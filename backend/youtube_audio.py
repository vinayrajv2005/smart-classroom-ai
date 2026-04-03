import yt_dlp
import os

def download_audio(video_url):

    # remove old files if they exist
    files = [
        "youtube_audio.webm",
        "youtube_audio.webm.part",
        "youtube_audio.wav"
    ]

    for f in files:
        if os.path.exists(f):
            try:
                os.remove(f)
            except:
                pass

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "youtube_audio.%(ext)s",
        "noplaylist": True,
        "quiet": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "wav",
            "preferredquality": "192"
        }]
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    return "youtube_audio.wav"