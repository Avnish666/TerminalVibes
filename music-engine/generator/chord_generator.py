import random

from music21 import stream, chord


class ChordGenerator:

    def generate(
        self,
        genre: str,
        seed: int | None = None,
        selected_key=None,
        measures: int = 2,
        start_index: int = 0
    ):

        rng = random.Random(seed)

        part = stream.Part()

        # ====================================================
        # CHORD PROGRESSIONS
        # ====================================================

        if genre == "lo-fi":

            progressions = [
                ["Cmaj7", "Am7", "Fmaj7", "G7"],
                ["Am7", "Fmaj7", "Cmaj7", "G7"],
                ["Cmaj7", "G7", "Am7", "Fmaj7"],
            ]

        elif genre == "synthwave":

            progressions = [
                ["Am", "F", "C", "G"],
                ["Am", "C", "G", "F"],
                ["F", "G", "Am", "C"],
                ["Am", "G", "F", "G"],
            ]

        elif genre == "edm":

            progressions = [
                ["C", "G", "Am", "F"],
                ["Am", "F", "C", "G"],
                ["C", "Am", "F", "G"],
            ]

        else:

            progressions = [
                ["C", "G", "Am", "F"]
            ]

        # ====================================================
        # SELECT PROGRESSION
        # ====================================================

        progression = rng.choice(progressions)

        print(
            f"🎹 Chord progression: {progression}"
        )

        # ====================================================
        # CHORD NAME → ACTUAL NOTES
        # ====================================================

        chord_notes = {

            # -----------------------------------------------
            # Major
            # -----------------------------------------------

            "C": [
                "C4",
                "E4",
                "G4"
            ],

            "F": [
                "F4",
                "A4",
                "C5"
            ],

            "G": [
                "G4",
                "B4",
                "D5"
            ],

            # -----------------------------------------------
            # Minor
            # -----------------------------------------------

            "Am": [
                "A3",
                "C4",
                "E4"
            ],

            # -----------------------------------------------
            # Lo-fi 7th chords
            # -----------------------------------------------

            "Cmaj7": [
                "C4",
                "E4",
                "G4",
                "B4"
            ],

            "Am7": [
                "A3",
                "C4",
                "E4",
                "G4"
            ],

            "Fmaj7": [
                "F4",
                "A4",
                "C5",
                "E5"
            ],

            "G7": [
                "G4",
                "B4",
                "D5",
                "F5"
            ],
        }

        # ====================================================
        # GENERATE REQUESTED MEASURES
        # ====================================================

        for measure_index in range(measures):

            # -----------------------------------------------
            # Continue through progression
            # -----------------------------------------------

            progression_index = (
                start_index + measure_index
            ) % len(progression)

            chord_name = progression[
                progression_index
            ]
            print(
             f"🎹 Segment chord {measure_index + 1}: {chord_name}"
               )
            notes = chord_notes[chord_name]

            current_chord = chord.Chord(
                notes
            )

            current_chord.quarterLength = 4

            part.append(
                current_chord
            )

        return part