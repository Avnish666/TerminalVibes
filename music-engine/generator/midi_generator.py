from pathlib import Path
from uuid import uuid4
import random

from .music_generator import MusicGenerator
from .audio_generator import AudioGenerator


class MidiGenerator:

    def __init__(self):

        self.music_generator = MusicGenerator()

        self.audio_generator = AudioGenerator()

    def generate(
        self,
        genre: str,
        bpm: int,
        mood: str,
        measures: int = 2,
        seed: int | None = None,
        segment_number : int=1,
        previous_melody_pitch=None,
        previous_motif=None,
        intensity: float = 0.5
    ) -> dict:

        # ------------------------------------------------
        # Generate a seed if one wasn't provided
        # ------------------------------------------------

        if seed is None:

            seed = random.randint(
                0,
                1_000_000
            )

        print(
            f"🎲 Generated music seed: {seed}"
        )


        # ------------------------------------------------
        # Generate musical score
        # ------------------------------------------------

        music_result = self.music_generator.generate(

                genre=genre,

                bpm=bpm,

                mood=mood,

                seed=seed,

                measures=measures,

                segment_number=segment_number,

                previous_melody_pitch=previous_melody_pitch,

                previous_motif=previous_motif,

                intensity=intensity
        )

        score = music_result["score"]

        melody_end_pitch = (
         music_result["melody_end_pitch"]
         )
        
        melody_motif = (
        music_result["melody_motif"]
            )


        # ------------------------------------------------
        # Output directory
        # ------------------------------------------------

        output_dir = Path("generated")

        output_dir.mkdir(
            exist_ok=True
        )


        # ------------------------------------------------
        # Unique filenames
        # ------------------------------------------------

        unique_id = uuid4().hex[:8]

        base_name = (
            f"{genre}_{bpm}_{unique_id}"
        )


        midi_file = (
            output_dir
            / f"{base_name}.mid"
        )

        wav_file = (
            output_dir
            / f"{base_name}.wav"
        )


        # ------------------------------------------------
        # Save MIDI
        # ------------------------------------------------

        score.write(
            "midi",
            fp=str(midi_file)
        )


        # ------------------------------------------------
        # Synthesize audio
        # ------------------------------------------------

        audio = self.audio_generator.synthesize_score(
            score,
            bpm
        )


        # ------------------------------------------------
        # Save WAV
        # ------------------------------------------------

        self.audio_generator.save_wav(
            audio,
            str(wav_file)
        )


        return {
    "midi": str(midi_file),
    "wav": str(wav_file),
    "melody_end_pitch": melody_end_pitch,
    "melody_motif": melody_motif

}