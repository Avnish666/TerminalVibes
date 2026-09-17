from music21 import stream, note


class RhythmGenerator:

    # Drum mapping
    KICK = "C2"
    SNARE = "D2"
    HIHAT = "F#2"

    def generate(
        self,
        genre: str,
        measures: int = 4,
        intensity: float = 0.5
    ):

        part = stream.Part()

        # Keep intensity safely between 0 and 1
        intensity = max(
            0.0,
            min(1.0, intensity)
        )

        for _ in range(measures):

            if genre == "edm":

                self._add_edm_measure(
                    part,
                    intensity
                )

            elif genre == "synthwave":

                self._add_synthwave_measure(
                    part,
                    intensity
                )

            elif genre == "lo-fi":

                self._add_lofi_measure(
                    part,
                    intensity
                )

            else:

                self._add_basic_measure(
                    part,
                    intensity
                )

        return part

    # --------------------------------
    # Helper
    # --------------------------------

    def _add_step(
        self,
        part,
        pitch=None
    ):

        if pitch is None:

            current_rest = note.Rest()
            current_rest.quarterLength = 0.25

            part.append(current_rest)

        else:

            current_note = note.Note(pitch)
            current_note.quarterLength = 0.25

            part.append(current_note)

    # --------------------------------
    # EDM
    # --------------------------------

    def _add_edm_measure(
        self,
        part,
        intensity
    ):

        for step in range(16):

            # ------------------------
            # High intensity
            # Full pattern
            # ------------------------

            if intensity >= 0.75:

                if step in [0, 8]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                elif step % 2 == 0:

                    self._add_step(
                        part,
                        self.HIHAT
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Medium intensity
            # ------------------------

            elif intensity >= 0.50:

                if step in [0, 8]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                elif step in [2, 6, 10, 14]:

                    self._add_step(
                        part,
                        self.HIHAT
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Low intensity
            # ------------------------

            elif intensity >= 0.25:

                if step in [0, 8]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Very low / IDLE
            # ------------------------

            else:

                if step == 0:

                    self._add_step(
                        part,
                        self.KICK
                    )

                else:

                    self._add_step(part)

    # --------------------------------
    # Synthwave
    # --------------------------------

    def _add_synthwave_measure(
        self,
        part,
        intensity
    ):

        for step in range(16):

            # ------------------------
            # High intensity
            # ------------------------

            if intensity >= 0.75:

                if step in [0, 8]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                elif step in [2, 6, 10, 14]:

                    self._add_step(
                        part,
                        self.HIHAT
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Medium intensity
            # ------------------------

            elif intensity >= 0.50:

                if step in [0, 8]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                elif step in [2, 10]:

                    self._add_step(
                        part,
                        self.HIHAT
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Low intensity
            # ------------------------

            elif intensity >= 0.25:

                if step in [0, 8]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step == 12:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Very low / IDLE
            # ------------------------

            else:

                if step == 0:

                    self._add_step(
                        part,
                        self.KICK
                    )

                else:

                    self._add_step(part)

    # --------------------------------
    # Lo-fi
    # --------------------------------

    def _add_lofi_measure(
        self,
        part,
        intensity
    ):

        for step in range(16):

            # ------------------------
            # High intensity
            # ------------------------

            if intensity >= 0.75:

                if step in [0, 10]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                elif step in [2, 6, 10, 14]:

                    self._add_step(
                        part,
                        self.HIHAT
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Medium intensity
            # ------------------------

            elif intensity >= 0.50:

                if step in [0, 10]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step in [4, 12]:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                elif step in [2, 10]:

                    self._add_step(
                        part,
                        self.HIHAT
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Low intensity
            # ------------------------

            elif intensity >= 0.25:

                if step in [0, 10]:

                    self._add_step(
                        part,
                        self.KICK
                    )

                elif step == 12:

                    self._add_step(
                        part,
                        self.SNARE
                    )

                else:

                    self._add_step(part)

            # ------------------------
            # Very low / IDLE
            # ------------------------

            else:

                if step == 0:

                    self._add_step(
                        part,
                        self.KICK
                    )

                else:

                    self._add_step(part)

    # --------------------------------
    # Basic
    # --------------------------------

    def _add_basic_measure(
        self,
        part,
        intensity
    ):

        if intensity >= 0.50:

            self._add_step(
                part,
                self.KICK
            )

            for _ in range(15):

                self._add_step(part)

        elif intensity >= 0.25:

            self._add_step(
                part,
                self.KICK
            )

            for _ in range(15):

                self._add_step(part)

        else:

            for _ in range(16):

                self._add_step(part)