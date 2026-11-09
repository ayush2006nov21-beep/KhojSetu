import os
from pathlib import Path
from dotenv import load_dotenv
from gnani.tts import GnaniTTSClient, AudioConfig

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
API_KEY = os.getenv("GNANI_API_KEY")


def generate_speech(text, language="hi-IN"):
    """Convert text to MP3 audio using Gnani Timbre v2.5."""
    if not API_KEY:
        raise RuntimeError("GNANI_API_KEY is missing from .env")

    if language not in ["hi-IN", "en-IN"]:
        raise ValueError("Unsupported language")

    voice = "Nalini" if language == "hi-IN" else "Yashvi"
    client = GnaniTTSClient(api_key=API_KEY)

    audio = client.synthesize(
        text,
        voice=voice,
        model="timbre-v2.5",
        language=language,
        speed=1.0,
        audio_config=AudioConfig(
            container="mp3",
            sample_rate=48000,
            bitrate="128k"
        ),
    )
    return audio
