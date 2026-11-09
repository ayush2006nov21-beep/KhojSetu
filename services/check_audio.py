import wave

try:
    audio = wave.open("services/test.wav", "rb")

    print("Audio file is valid!")
    print("Channels:", audio.getnchannels())
    print("Sample rate:", audio.getframerate())
    print("Sample width:", audio.getsampwidth())
    print("Duration:", round(audio.getnframes() / audio.getframerate(), 2), "seconds")

    audio.close()

except Exception as e:
    print("Audio file problem:", e)