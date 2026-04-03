import whisper

# load model once
model = whisper.load_model("base")

def transcribe_audio():

    result = model.transcribe(
        "youtube_audio.wav",
        task="translate",      # force translate to English
        fp16=False
    )

    text = result["text"]

    with open("lecture_transcript.txt", "w", encoding="utf-8") as f:
        f.write(text)

    return text