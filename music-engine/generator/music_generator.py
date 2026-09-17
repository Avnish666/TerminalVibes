from music21 import stream, tempo, meter, key

from .chord_generator import ChordGenerator
from .melody_generator import MelodyGenerator
from .rhythm_generator import RhythmGenerator
from .bass_generator import BassGenerator


class MusicGenerator:

    def __init__(self):

        self.chord_generator = ChordGenerator()
        self.melody_generator = MelodyGenerator()
        self.rhythm_generator = RhythmGenerator()
        self.bass_generator = BassGenerator()

    def generate(
        self,
        genre: str,
        bpm: int,
        mood: str,
        seed: int | None = None,
        measures: int = 2,
        segment_number: int = 1,
        previous_melody_pitch=None,
        previous_motif=None,
        intensity: float = 0.5
    ):

        score = stream.Score()

        # --------------------------------
        # Tempo
        # --------------------------------

        score.append(
            tempo.MetronomeMark(number=bpm)
        )

        # --------------------------------
        # Time signature
        # --------------------------------

        score.append(
            meter.TimeSignature("4/4")
        )

       # --------------------------------
# Select key based on genre
# --------------------------------

        if genre == "synthwave":

             selected_key = key.Key(
        "A",
        "minor"
    )

        elif genre == "lo-fi":

           selected_key = key.Key(
        "C",
        "major"
    )

        elif genre == "edm":

           selected_key = key.Key(
        "C",
        "major"
    )

        else:

             selected_key = key.Key(
        "C",
        "major"
    )

        print(
            f"🎹 Selected key: {selected_key}"
        )

        score.append(
            selected_key
        )

        # --------------------------------
        # Chords
        # --------------------------------

        chords = self.chord_generator.generate(

            genre=genre,

            seed=seed,

            selected_key=selected_key,

            measures=measures,

            start_index=(
                (segment_number - 1)
                * measures
            )
        )

        # --------------------------------
        # Melody
        # --------------------------------

        melody_seed = None

        if seed is not None:

            melody_seed = (
                seed
                + segment_number
            )

        melody_result = self.melody_generator.generate(

            genre=genre,

            seed=melody_seed,

            selected_key=selected_key,

            chords=chords,

            measures=measures,

            previous_melody_pitch=previous_melody_pitch,

            previous_motif=previous_motif,

            intensity=intensity
        )

        melody = melody_result["part"]

        melody_end_pitch = (
            melody_result["end_pitch"]
        )

        melody_motif = (
            melody_result["motif"]
        )

        # --------------------------------
        # Rhythm
        # Intensity controls drum density
        # --------------------------------

        rhythm = self.rhythm_generator.generate(

            genre=genre,

            measures=measures,

            intensity=intensity
        )

        # --------------------------------
        # Bass
        # --------------------------------

        bass = self.bass_generator.generate(

            genre=genre,

            chords=chords,
            intensity=intensity
        )

        # --------------------------------
        # Combine
        # --------------------------------

        score.insert(
            0,
            chords
        )

        score.insert(
            0,
            melody
        )

        score.insert(
            0,
            rhythm
        )

        score.insert(
            0,
            bass
        )

        # --------------------------------
        # Return
        # --------------------------------

        return {
            "score": score,
            "melody_end_pitch": melody_end_pitch,
            "melody_motif": melody_motif
        }