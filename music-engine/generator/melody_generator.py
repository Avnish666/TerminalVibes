import random

from music21 import stream, note, key

class MelodyGenerator:

    def generate(
        self,
        genre: str,
        seed: int | None = None,
        selected_key=None,
        chords=None,
        measures: int = 2,
        previous_melody_pitch=None,
        previous_motif=None,
        intensity: float = 0.5
    ):

        rng = random.Random(seed)

        part = stream.Part()

        # --------------------------------
        # Clamp intensity
        # --------------------------------

        intensity = max(
            0.0,
            min(1.0, intensity)
        )

        # --------------------------------
        # Default key
        # --------------------------------

        if selected_key is None:

            selected_key = key.Key(
                "C",
                "major"
            )

        # --------------------------------
        # Build scale
        # --------------------------------

        scale_object = selected_key.getScale()

        tonic_name = selected_key.tonic.name

        octave = 4

        scale_pitches = scale_object.getPitches(
            f"{tonic_name}{octave}",
            f"{tonic_name}{octave + 1}"
        )

        scale = [
            pitch.nameWithOctave
            for pitch in scale_pitches
        ]

        print(
            f"🎼 Melody scale: {scale}"
        )

        # --------------------------------
        # Genre settings
        # --------------------------------

        if genre == "lo-fi":

            durations = [
                1,
                1,
                1.5,
                2
            ]

        elif genre == "synthwave":

            durations = [
                0.5,
                1,
                1,
                1.5
            ]

        elif genre == "edm":

            durations = [
                0.25,
                0.5,
                0.5,
                1
            ]

        else:

            durations = [
                1,
                1,
                2
            ]

        # --------------------------------
        # Extract chord tones
        # --------------------------------

        chord_tone_sets = []

        if chords is not None:

            for current_chord in chords:

                chord_tones = {
                    pitch.name
                    for pitch in current_chord.pitches
                }

                chord_tone_sets.append(
                    chord_tones
                )

        # --------------------------------
        # Decide whether to reuse motif
        # --------------------------------

        use_motif = (
            previous_motif is not None
            and len(previous_motif) > 0
            and rng.random() < 0.60
        )

        if use_motif:

            print(
                "🎼 Reusing previous melody motif"
            )

        else:

            print(
                "🎼 Creating new melody motif"
            )

        # --------------------------------
        # Melody density based on intensity
        # --------------------------------

        # Higher intensity = more notes
        #
        # 0.00 - 0.25 → sparse
        # 0.25 - 0.50 → normal
        # 0.50 - 0.75 → active
        # 0.75 - 1.00 → dense

        if intensity < 0.25:

            note_probability = 0.45

        elif intensity < 0.50:

            note_probability = 0.65

        elif intensity < 0.75:

            note_probability = 0.82

        else:

            note_probability = 0.95

        print(
            f"🎼 Melody intensity: {intensity:.2f} "
            f"| note probability: {note_probability:.2f}"
        )

        # --------------------------------
        # Generate melody
        # --------------------------------

        motif = []

        note_counter = 0

        for measure_index in range(measures):

            # --------------------------------
            # Current chord
            # --------------------------------

            if measure_index < len(
                chord_tone_sets
            ):

                chord_tones = chord_tone_sets[
                    measure_index
                ]

            else:

                chord_tones = set()

            # --------------------------------
            # Chord candidates
            # --------------------------------

            chord_candidates = [

                pitch

                for pitch in scale

                if pitch.rstrip("0123456789")
                in chord_tones
            ]

            scale_candidates = scale

            # --------------------------------
            # Fill measure
            # --------------------------------

            measure_length = 0

            while measure_length < 4:

                duration = rng.choice(
                    durations
                )

                # Prevent exceeding measure
                # length

                if (
                    measure_length + duration
                    > 4
                ):

                    duration = (
                        4 - measure_length
                    )

                # --------------------------------
                # Decide whether to play a note
                # --------------------------------

                is_first_note = (
                    measure_index == 0
                    and measure_length == 0
                )

                # Always keep the first note
                # for segment continuity.

                should_play = (
                    is_first_note
                    or rng.random()
                    < note_probability
                )

                # --------------------------------
                # Add rest for low intensity
                # --------------------------------

                if not should_play:

                    current_rest = note.Rest()

                    current_rest.quarterLength = (
                        duration
                    )

                    part.append(
                        current_rest
                    )

                    measure_length += duration

                    continue

                # --------------------------------
                # Choose note
                # --------------------------------

                current_pitch = None

                # --------------------------------
                # First note: connect to previous
                # segment
                # --------------------------------

                if (
                    measure_index == 0
                    and measure_length == 0
                    and previous_melody_pitch
                ):

                    nearby_candidates = (
                        chord_candidates
                        if chord_candidates
                        else scale_candidates
                    )

                    try:

                        previous_pitch = (
                            note.Note(
                                previous_melody_pitch
                            ).pitch
                        )

                        current_pitch = min(

                            nearby_candidates,

                            key=lambda pitch_name:

                                abs(
                                    note.Note(
                                        pitch_name
                                    ).pitch.midi
                                    -
                                    previous_pitch.midi
                                )
                        )

                        print(
                            f"🎼 Melody continues from "
                            f"{previous_melody_pitch} "
                            f"→ {current_pitch}"
                        )

                    except Exception:

                        current_pitch = rng.choice(
                            nearby_candidates
                        )

                # --------------------------------
                # Reuse previous motif
                # --------------------------------

                elif (
                    use_motif
                    and note_counter
                    < len(previous_motif)
                ):

                    motif_pitch = (
                        previous_motif[
                            note_counter
                            % len(previous_motif)
                        ]
                    )

                    # --------------------------------
                    # Check if motif note belongs
                    # to current scale
                    # --------------------------------

                    motif_note = note.Note(
                        motif_pitch
                    )

                    motif_name = (
                        motif_note.pitch.name
                    )

                    motif_candidates = [

                        pitch

                        for pitch in (
                            chord_candidates
                            if chord_candidates
                            else scale_candidates
                        )

                        if pitch.rstrip(
                            "0123456789"
                        ) == motif_name
                    ]

                    if motif_candidates:

                        current_pitch = (
                            rng.choice(
                                motif_candidates
                            )
                        )

                    else:

                        # Find nearby scale note

                        current_pitch = min(

                            scale_candidates,

                            key=lambda pitch_name:

                                abs(
                                    note.Note(
                                        pitch_name
                                    ).pitch.midi
                                    -
                                    motif_note.pitch.midi
                                )
                        )

                # --------------------------------
                # Normal chord-aware generation
                # --------------------------------

                elif (
                    chord_candidates
                    and rng.random() < 0.70
                ):

                    current_pitch = rng.choice(
                        chord_candidates
                    )

                else:

                    current_pitch = rng.choice(
                        scale_candidates
                    )

                # --------------------------------
                # Add note
                # --------------------------------

                current_note = note.Note(
                    current_pitch
                )

                current_note.quarterLength = (
                    duration
                )

                part.append(
                    current_note
                )

                # --------------------------------
                # Store first few notes as motif
                # --------------------------------

                if len(motif) < 4:

                    motif.append(
                        current_pitch
                    )

                note_counter += 1

                measure_length += duration

        # --------------------------------
        # Find final melody pitch
        # --------------------------------

        melody_notes = list(
            part.recurse().notes
        )

        melody_end_pitch = None

        if melody_notes:

            melody_end_pitch = (
                melody_notes[-1]
                .pitch
                .nameWithOctave
            )

        print(
            f"🎼 Melody ending pitch: "
            f"{melody_end_pitch}"
        )

        print(
            f"🎼 Melody motif: {motif}"
        )

        # --------------------------------
        # Return
        # --------------------------------

        return {
            "part": part,
            "end_pitch": melody_end_pitch,
            "motif": motif
        }