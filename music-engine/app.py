import asyncio
import time
import os

from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from session.music_session import MusicSession
from generator.midi_generator import MidiGenerator
from mapping.activity_mapper import ActivityMapper


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="TerminalVibes Music Engine",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# GLOBAL COMPONENTS
# ============================================================

midi_generator = MidiGenerator()
music_session = MusicSession()
activity_mapper = ActivityMapper()


# ============================================================
# REQUEST MODELS
# ============================================================

class MusicRequest(BaseModel):
    genre: str
    bpm: int
    mood: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def health_check():

    return {
        "service": "TerminalVibes Music Engine",
        "status": "running"
    }


# ============================================================
# SESSION UPDATE
# ============================================================

@app.post("/session/update")
def update_session(request: MusicRequest):

    music_session.update(
        genre=request.genre,
        bpm=request.bpm,
        mood=request.mood
    )

    return {
        "success": True,
        "session": music_session.next_segment()
    }


# ============================================================
# MANUAL MUSIC GENERATION
# ============================================================

@app.post("/generate")
def generate_music(request: MusicRequest):

    files = midi_generator.generate(
        genre=request.genre,
        bpm=request.bpm,
        mood=request.mood
    )

    return {
        "success": True,
        "genre": request.genre,
        "bpm": request.bpm,
        "mood": request.mood,
        "file": files
    }


# ============================================================
# GENERATE ONE MUSIC SEGMENT
# ============================================================

async def generate_and_send_segment(
    websocket: WebSocket
):

    # --------------------------------------------------------
    # Get current session parameters
    # --------------------------------------------------------

    segment_info = music_session.next_segment()

    genre = segment_info["genre"]
    bpm = segment_info["bpm"]
    mood = segment_info["mood"]
    segment_number = segment_info["segment"]
    session_seed = segment_info["session_seed"]
    intensity = segment_info["intensity"]

    previous_melody_pitch = (
        segment_info["previous_melody_pitch"]
    )

    previous_motif = (
        segment_info["previous_motif"]
    )


    # --------------------------------------------------------
    # Generation log
    # --------------------------------------------------------

    print(
        f"🎵 Generating segment #{segment_number}: "
        f"{genre} | {bpm} BPM | {mood}"
    )


    # --------------------------------------------------------
    # Measure generation time
    # --------------------------------------------------------

    start_time = time.perf_counter()


    # --------------------------------------------------------
    # Generate music
    # --------------------------------------------------------

    files = await asyncio.to_thread(

        midi_generator.generate,

        genre,
        bpm,
        mood,
        2,
        session_seed,
        segment_number,
        previous_melody_pitch,
        previous_motif,
        intensity
    )


    # --------------------------------------------------------
    # Save melody continuity
    # --------------------------------------------------------

    music_session.previous_melody_pitch = (
        files["melody_end_pitch"]
    )

    music_session.previous_motif = (
        files["melody_motif"]
    )


    # --------------------------------------------------------
    # Generation time
    # --------------------------------------------------------

    generation_time = (
        time.perf_counter() - start_time
    )

    print(
        f"⏱️ Generation time: "
        f"{generation_time:.3f}s"
    )


    # --------------------------------------------------------
    # Send music parameters
    # --------------------------------------------------------

    await websocket.send_json({

        "type": "music_parameters",

        "music": {
            "genre": genre,
            "bpm": bpm,
            "mood": mood,
            "intensity": intensity
        },

        "segment": segment_number
    })


    # --------------------------------------------------------
    # Read WAV
    # --------------------------------------------------------

    wav_path = files["wav"]

    try:

        with open(
            wav_path,
            "rb"
        ) as audio_file:

            audio_data = audio_file.read()


        print(
            f"🔊 Segment #{segment_number}: "
            f"{len(audio_data)} bytes"
        )


        # ----------------------------------------------------
        # Send WAV
        # ----------------------------------------------------

        await websocket.send_bytes(
            audio_data
        )


    finally:

        # ----------------------------------------------------
        # Delete temporary files
        # ----------------------------------------------------

        try:

            if os.path.exists(files["wav"]):
                os.remove(files["wav"])

            if files.get("midi") and os.path.exists(files["midi"]):
                os.remove(files["midi"])

        except OSError as error:

            print(
                f"⚠️ Could not delete temporary files: {error}"
            )


# ============================================================
# CONTINUOUS MUSIC PRODUCER
# ============================================================

async def music_producer(
    websocket: WebSocket
):

    print(
        "🎼 Music producer started"
    )


    # --------------------------------------------------------
    # Generate first two segments immediately.
    #
    # This gives the frontend a small lookahead buffer.
    # --------------------------------------------------------

    for _ in range(2):

        await generate_and_send_segment(
            websocket
        )




    while True:

        await asyncio.sleep(3.0)

        await generate_and_send_segment(
            websocket
        )



@app.websocket("/ws/music")
async def music_websocket(
    websocket: WebSocket
):

    await websocket.accept()

    print(
        "🎵 Music WebSocket connected"
    )


    producer_task = None


    try:

        while True:

            data = await websocket.receive_json()


 

            wpm = data.get(
                "wpm",
                0
            )

            language = data.get(
                "language",
                "unknown"
            )

            state = data.get(
                "state",
                "IDLE"
            )

            pause_duration = data.get(
                "pauseDuration",
                0
            )


       

            music = activity_mapper.map_activity(

                wpm=wpm,

                language=language,

                state=state,

                pause_duration=pause_duration
            )



            music_session.update(

                genre=music["genre"],

                bpm=music["bpm"],

                mood=music["mood"],

                intensity=music["intensity"],

                state=state,

                language=language
            )



            if producer_task is None:

                print(
                    "🎼 First activity received"
                )

                producer_task = asyncio.create_task(
                    music_producer(
                        websocket
                    )
                )


    except Exception as e:

        print(
            "❌ Music WebSocket disconnected:",
            e
        )


    finally:

        # ----------------------------------------------------
        # Stop producer when WebSocket disconnects
        # ----------------------------------------------------

        if producer_task is not None:

            producer_task.cancel()

            try:

                await producer_task

            except asyncio.CancelledError:

                pass


        print(
            "🔌 Music producer stopped"
        )