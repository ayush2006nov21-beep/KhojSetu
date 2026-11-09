
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GNANI_API_KEY")

if key:
    print("Gnani API key loaded successfully!")
else:
    print("API key not found!")
