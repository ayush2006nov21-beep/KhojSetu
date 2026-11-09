
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GNANI_API_KEY")

def transcribe_audio(audio_path, language="hi-IN"):

    if not API_KEY:
        raise Exception("Gnani API key not found")

    url = "https://api.vachana.ai/stt/v3"

    headers = {
        "X-API-Key-ID": API_KEY
    }

    data = {
        "language_code": language,
        "preferred_language": language,
        "format": "transcribe"
    }

    with open(audio_path, "rb") as audio:
        files = {
            "audio_file": ("recording.wav", audio, "audio/wav")
        }

        response = requests.post(
            url,
            headers=headers,
            data=data,
            files=files,
            timeout=60
        )

    if not response.ok:
        raise Exception(response.text)

    result = response.json()
    return result.get("transcript", "")
