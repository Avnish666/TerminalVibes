from music21 import stream, note


class BassGenerator:

    def generate(
        self,
        genre: str,
        chords=None,
        intensity: float = 0.5
    ):

        part = stream.Part()

        if chords is None:
            return part

        # --------------------------------
        # Clamp intensity
        # --------------------------------

        intensity = max(
            0.0,
            min(1.0, intensity)
        )

        print(
            f"🎸 Bass intensity: {intensity:.2f}"
        )

        # --------------------------------
        # Generate bass
        # --------------------------------

        for current_chord in chords:

            root = current_chord.root()

            bass_pitch = root.transpose(-12)

            # =================================
            # EDM
            # =================================

            if genre == "edm":

                if intensity >= 0.75:

                    # High intensity:
                    # 8th-note bass pattern

                    for _ in range(8):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 0.5

                        part.append(
                            bass_note
                        )

                elif intensity >= 0.5:

                    # Medium intensity:
                    # Quarter-note bass

                    for _ in range(4):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 1

                        part.append(
                            bass_note
                        )

                elif intensity >= 0.25:

                    # Low intensity:
                    # Two half-note bass notes

                    for _ in range(2):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 2

                        part.append(
                            bass_note
                        )

                else:

                    # Very low intensity:
                    # One long bass note

                    bass_note = note.Note(
                        bass_pitch
                    )

                    bass_note.quarterLength = 4

                    part.append(
                        bass_note
                    )

            # =================================
            # SYNTHWAVE
            # =================================

            elif genre == "synthwave":

                if intensity >= 0.75:

                    # High intensity:
                    # 8th-note pulse

                    for _ in range(8):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 0.5

                        part.append(
                            bass_note
                        )

                elif intensity >= 0.5:

                    # Medium intensity:
                    # Quarter-note pulse

                    for _ in range(4):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 1

                        part.append(
                            bass_note
                        )

                elif intensity >= 0.25:

                    # Low intensity:
                    # Two half notes

                    for _ in range(2):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 2

                        part.append(
                            bass_note
                        )

                else:

                    # Very low intensity:
                    # One sustained note

                    bass_note = note.Note(
                        bass_pitch
                    )

                    bass_note.quarterLength = 4

                    part.append(
                        bass_note
                    )

            # =================================
            # LO-FI
            # =================================

            elif genre == "lo-fi":

                if intensity >= 0.75:

                    # High intensity

                    for _ in range(4):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 1

                        part.append(
                            bass_note
                        )

                elif intensity >= 0.5:

                    # Medium intensity

                    for _ in range(2):

                        bass_note = note.Note(
                            bass_pitch
                        )

                        bass_note.quarterLength = 2

                        part.append(
                            bass_note
                        )

                elif intensity >= 0.25:

                    # Low intensity

                    bass_note = note.Note(
                        bass_pitch
                    )

                    bass_note.quarterLength = 4

                    part.append(
                        bass_note
                    )

                else:

                    # Very low intensity

                    bass_note = note.Rest()

                    bass_note.quarterLength = 4

                    part.append(
                        bass_note
                    )

            # =================================
            # DEFAULT
            # =================================

            else:

                bass_note = note.Note(
                    bass_pitch
                )

                bass_note.quarterLength = 4

                part.append(
                    bass_note
                )

        return part