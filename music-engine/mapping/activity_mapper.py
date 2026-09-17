class ActivityMapper:

    LANGUAGE_GENRES = {
        "python": "lo-fi",
        "java": "synthwave",
        "javascript": "edm",
        "typescript": "edm",
        "cpp": "synthwave",
        "c++": "synthwave",
        "c": "synthwave",
    }

    def map_activity(
        self,
        wpm: float,
        language: str,
        state: str,
        pause_duration: float
    ):

        genre = self.get_genre(language)

        bpm = self.get_bpm(wpm)

        mood = self.get_mood(
            wpm=wpm,
            state=state,
            pause_duration=pause_duration
        )

        intensity = self.get_intensity(
            wpm=wpm,
            state=state,
            pause_duration=pause_duration
        )

        return {
            "genre": genre,
            "bpm": bpm,
            "mood": mood,
            "intensity": intensity
        }

    # ========================================================
    # GENRE
    # ========================================================

    def get_genre(
        self,
        language: str
    ):

        language = language.lower()

        return self.LANGUAGE_GENRES.get(
            language,
            "lo-fi"
        )

    # ========================================================
    # BPM
    # ========================================================

    def get_bpm(
        self,
        wpm: float
    ):

        if wpm < 30:

            return 70

        elif wpm < 50:

            return 85

        elif wpm < 70:

            return 100

        elif wpm < 90:

            return 115

        else:

            return 130

    # ========================================================
    # MOOD
    # ========================================================

    def get_mood(
        self,
        wpm: float,
        state: str,
        pause_duration: float
    ):

        state = state.upper()

        if state == "IDLE":

            return "calm"

        if pause_duration > 5:

            return "moody"

        if wpm >= 90:

            return "intense"

        if wpm >= 50:

            return "energetic"

        return "calm"

    # ========================================================
    # INTENSITY
    # ========================================================

    def get_intensity(
        self,
        wpm: float,
        state: str,
        pause_duration: float
    ):

        state = state.upper()

        # --------------------------------
        # IDLE
        # --------------------------------

        if state == "IDLE":

            return 0.15

        # --------------------------------
        # THINKING
        # --------------------------------

        if state == "THINKING":

            return 0.40

        # --------------------------------
        # ACTIVE
        # --------------------------------

        if state == "ACTIVE":

            if wpm >= 90:

                return 1.0

            elif wpm >= 70:

                return 0.85

            elif wpm >= 50:

                return 0.70

            elif wpm >= 30:

                return 0.55

            else:

                return 0.40

        # --------------------------------
        # Fallback
        # --------------------------------

        return 0.50