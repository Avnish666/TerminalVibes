import math
import wave

import numpy as np
from music21 import note, chord


class AudioGenerator:

    SAMPLE_RATE = 44100

    # --------------------------------
    # Drum MIDI numbers
    # --------------------------------

    KICK_MIDI = 36       # C2
    SNARE_MIDI = 38      # D2
    HIHAT_MIDI = 42     # F#3

    def __init__(self):
        pass

    # --------------------------------
    # MIDI → frequency
    # --------------------------------

    def midi_to_frequency(
        self,
        midi_number: int
    ) -> float:

        return 440.0 * (
            2 ** ((midi_number - 69) / 12)
        )

    # --------------------------------
    # Basic waveform
    # --------------------------------

    def create_wave(
        self,
        frequency: float,
        duration: float,
        volume: float = 0.2
    ):

        sample_count = int(
            self.SAMPLE_RATE * duration
        )

        time = np.linspace(
            0,
            duration,
            sample_count,
            endpoint=False
        )

        wave_data = np.sin(
            2 * np.pi * frequency * time
        )

        wave_data += (
            0.25
            * np.sin(
                2 * np.pi * frequency * 2 * time
            )
        )

        wave_data += (
            0.1
            * np.sin(
                2 * np.pi * frequency * 3 * time
            )
        )

        wave_data *= volume

        return wave_data

    # ==============================================
    # DRUM SYNTHESIS
    # ==============================================

    # --------------------------------
    # Kick
    # --------------------------------

    def create_kick(
    self,
    duration: float
):

        duration = min(
        duration,
        0.45
    )

        sample_count = int(
        self.SAMPLE_RATE * duration
    )

        time = np.linspace(
        0,
        duration,
        sample_count,
        endpoint=False
    )

    # Frequency drops from ~120Hz to ~45Hz
        frequency = (
        80 * np.exp(-12 * time)
        + 45
    )

        phase = (
        2
        * np.pi
        * np.cumsum(frequency)
        / self.SAMPLE_RATE
    )

        kick = np.sin(phase)

    # Fast decay
        envelope = np.exp(
        -10 * time
    )

        kick *= envelope

        return kick * 0.45

    # --------------------------------
    # Snare
    # --------------------------------

    def create_snare(
    self,
    duration: float
):

        duration = min(
           duration,
        0.25
        )

        sample_count = int(
           self.SAMPLE_RATE * duration
        )

        time = np.linspace(
        0,
        duration,
        sample_count,
        endpoint=False
    )

        rng = np.random.default_rng()

       # Noise component
        noise = rng.uniform(
        -1,
        1,
        sample_count
    )

    # Tonal body
        tone = np.sin(
        2 * np.pi * 180 * time
    )

    # Combine
        snare = (
        0.55 * noise
        + 0.20 * tone
    )

    # Fast decay
        envelope = np.exp(
        -20 * time
    )

        snare *= envelope

        return snare * 0.18

    # --------------------------------
    # Hi-hat
    # --------------------------------

    def create_hihat(
        self,
        duration: float
    ):

        duration = min(
            duration,
            0.08
        )

        sample_count = int(
            self.SAMPLE_RATE * duration
        )

        rng = np.random.default_rng()

        noise = rng.uniform(
            -1,
            1,
            sample_count
        )

        # Simple high-pass approximation
        if sample_count > 1:

            noise = np.diff(
                np.concatenate(
                    ([0], noise)
                )
            )

        time = np.linspace(
            0,
            duration,
            sample_count,
            endpoint=False
        )

        envelope = np.exp(
            -45 * time
        )

        hihat = noise * envelope

        return hihat * 0.06

    # --------------------------------
    # Drum selector
    # --------------------------------

    def synthesize_drum(
        self,
        midi_number: int,
        duration: float
    ):

        if midi_number == self.KICK_MIDI:

            return self.create_kick(
                duration
            )

        if midi_number == self.SNARE_MIDI:

            return self.create_snare(
                duration
            )

        if midi_number == self.HIHAT_MIDI:

            return self.create_hihat(
                duration
            )

        return None

    # ==============================================
    # NORMAL NOTE
    # ==============================================

    def synthesize_note(
        self,
        current_note,
        duration: float
    ):

        if isinstance(
            current_note,
            note.Rest
        ):

            sample_count = int(
                self.SAMPLE_RATE * duration
            )

            return np.zeros(
                sample_count
            )

        midi_number = int(
            current_note.pitch.midi
        )

        # --------------------------------
        # Check for drums
        # --------------------------------

        drum_audio = self.synthesize_drum(
            midi_number,
            duration
        )

        if drum_audio is not None:

            return drum_audio

        # --------------------------------
        # Normal musical note
        # --------------------------------

        frequency = self.midi_to_frequency(
            midi_number
        )

        return self.create_wave(
            frequency,
            duration
        )

    # ==============================================
    # CHORD
    # ==============================================

    def synthesize_chord(
        self,
        current_chord,
        duration: float
    ):

        sample_count = int(
            self.SAMPLE_RATE * duration
        )

        combined = np.zeros(
            sample_count
        )

        for current_note in current_chord.notes:

            wave_data = self.synthesize_note(
                current_note,
                duration
            )

            combined += (
                wave_data * 0.4
            )

        return combined

    # ==============================================
    # SCORE
    # ==============================================

    def synthesize_score(
        self,
        score,
        bpm: int
    ):

        audio_tracks = []

        for part in score.parts:

            part_audio = []

            for element in (
                part.flatten().notesAndRests
            ):

                quarter_length = float(
                element.quarterLength
             )

                   #Convert music21 quarterLength (beats)
                   # into real seconds using BPM.
                duration = (
                  quarter_length
                  * 60.0
                     / bpm
                   )

                duration = max(
                  duration,
                    0.02)

                if isinstance(
                    element,
                    chord.Chord
                ):

                    audio = self.synthesize_chord(
                        element,
                        duration
                    )

                elif isinstance(
                    element,
                    note.Note
                ):

                    audio = self.synthesize_note(
                        element,
                        duration
                    )

                else:

                    audio = np.zeros(
                        int(
                            self.SAMPLE_RATE
                            * duration
                        )
                    )

                part_audio.append(
                    audio
                )

            if part_audio:

                track = np.concatenate(
                    part_audio
                )

                audio_tracks.append(
                    track
                )

        if not audio_tracks:

            return np.array([])

        max_length = max(
            len(track)
            for track in audio_tracks
        )

        mixed_audio = np.zeros(
            max_length
        )

        # --------------------------------
        # Mix all tracks
        # --------------------------------

        for track in audio_tracks:

            mixed_audio[
                :len(track)
            ] += track

        # --------------------------------
        # Normalize
        # --------------------------------

        max_amplitude = np.max(
            np.abs(mixed_audio)
        )

        if max_amplitude > 0:

            mixed_audio /= max_amplitude

        return mixed_audio

    # ==============================================
    # SAVE WAV
    # ==============================================

    def save_wav(
        self,
        audio,
        output_file: str
    ):

        audio = np.clip(
            audio,
            -1,
            1
        )

        audio_16bit = (
            audio * 32767
        ).astype(
            np.int16
        )

        with wave.open(
            output_file,
            "wb"
        ) as wav_file:

            wav_file.setnchannels(
                1
            )

            wav_file.setsampwidth(
                2
            )

            wav_file.setframerate(
                self.SAMPLE_RATE
            )

            wav_file.writeframes(
                audio_16bit.tobytes()
            )