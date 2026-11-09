
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Find project folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Load API key
load_dotenv(BASE_DIR / ".env")
API_KEY = os.getenv("GNANI_API_KEY")

# Find audio file
audio_path = BASE_DIR / "services" / "test.wav"

print("1. Checking API key...")

if not API_KEY:
    print("ERROR: API key not found!")
    raise SystemExit

print("API key loaded.")

print("2. Checking audio file...")

if not audio_path.exists():
    print("ERROR: test.wav not found!")
    raise SystemExit

print("Audio file found.")

print("3. Sending audio to Gnani Prisma...")

url = "https://api.vachana.ai/stt/v3"

headers = {
    "X-API-Key-ID": API_KEY
}

data = {
    "language_code": "en-IN",
    "preferred_language": "en-IN",
    "format": "transcribe"
}

with open(audio_path, "rb") as audio:
    files = {
        "audio_file": ("test.wav", audio, "audio/wav")
    }

    response = requests.post(
        url,
        headers=headers,
        data=data,
        files=files,
        timeout=60
    )

print("4. Server response:", response.status_code)

if response.ok:
    result = response.json()
    print("5. TRANSCRIPTION:")
    print(result.get("transcript", "No transcript returned"))
else:
    print("API ERROR:")
    print(response.text[:1500])
