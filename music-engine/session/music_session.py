import random


class MusicSession:

    def __init__(self):

        self.genre = "lo-fi"

        self.bpm = 90

        self.mood = "calm"

        self.intensity = 0.50

        self.state = "IDLE"

        self.language = "unknown"

        self.segment_number = 0

        self.session_seed = random.randint(
            0,
            1_000_000
        )

        self.previous_melody_pitch = None

        self.previous_motif = None


    def update(
        self,
        genre=None,
        bpm=None,
        mood=None,
        intensity=None,
        state=None,
        language=None
    ):

        if genre is not None:
            self.genre = genre

        if bpm is not None:
            self.bpm = bpm

        if mood is not None:
            self.mood = mood

        if intensity is not None:
            self.intensity = intensity

        if state is not None:
            self.state = state

        if language is not None:
            self.language = language


    def next_segment(self):

        self.segment_number += 1

        return {
            "segment": self.segment_number,

            "genre": self.genre,

            "bpm": self.bpm,

            "mood": self.mood,

            "intensity": self.intensity,

            "state": self.state,

            "language": self.language,

            "session_seed": self.session_seed,

            "previous_melody_pitch":
                self.previous_melody_pitch,

            "previous_motif":
                self.previous_motif
        }