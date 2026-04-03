from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import qrcode

from speech_to_text import start_listening, stop_listening
from translator import translate_text
from summarizer import generate_summary
from database import init_db, save_text
from pdf_generator import generate_pdf
from board_reader import read_board
from youtube_audio import download_audio
from whisper_transcriber import transcribe_audio


# ===============================
# APP CONFIG
# ===============================

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

init_db()

# ✅ UPDATED IP ADDRESS
SERVER_IP = "10.1.0.172"


# ===============================
# GLOBAL VARIABLES
# ===============================

latest_text = ""
live_board_text = ""
camera_on = False
participants = []


# ===============================
# SPEECH CALLBACK
# ===============================

def callback(text):
    global latest_text

    latest_text = text
    save_text(text)

    print("Teacher Speech:", text)


# ===============================
# SPEECH CONTROL
# ===============================

@app.route("/start_listening")
def start():

    thread = threading.Thread(target=start_listening, args=(callback,))
    thread.daemon = True
    thread.start()

    return jsonify({"status": "speech listening started"})


@app.route("/stop_listening")
def stop():

    stop_listening()

    return jsonify({"status": "speech listening stopped"})


@app.route("/get_text")
def get_text():

    return jsonify({
        "text": latest_text
    })


# ===============================
# TRANSLATION
# ===============================

@app.route("/translate", methods=["POST"])
def translate():

    try:
        data = request.json or {}

        text = data.get("text", "")
        language = data.get("language", "en")

        translated = translate_text(text, language)

        return jsonify({
            "translated": translated
        })

    except Exception as e:
        return jsonify({
            "translated": "",
            "error": str(e)
        })


# ===============================
# AI SUMMARY
# ===============================

import textwrap

@app.route("/summary", methods=["POST"])
def summary():

    try:
        data = request.json or {}
        lecture = data.get("text", "")

        lecture = translate_text(lecture, "en")
        chunks = textwrap.wrap(lecture, 1000)

        final_notes = ""

        for chunk in chunks:
            try:
                notes = generate_summary(chunk)
                final_notes += notes + "\n\n"
            except Exception as e:
                print("Skipping chunk:", e)
                continue

        return jsonify({
            "notes": final_notes.strip()
        })

    except Exception as e:
        return jsonify({
            "notes": "",
            "error": str(e)
        })


# ===============================
# PDF GENERATION
# ===============================

@app.route("/download_pdf")
def pdf():

    path = generate_pdf()

    return send_file(
        path,
        as_attachment=True
    )


# ===============================
# BOARD OCR
# ===============================

@app.route("/capture_board")
def capture_board():

    global live_board_text

    data = read_board() or {}
    live_board_text = data.get("text", "")

    return jsonify(data)


@app.route("/get_board_text")
def get_board_text():

    return jsonify({
        "text": live_board_text,
        "camera": camera_on
    })


@app.route("/start_camera")
def start_camera():

    global camera_on
    camera_on = True

    return jsonify({"status": "camera started"})


@app.route("/stop_camera")
def stop_camera():

    global camera_on
    camera_on = False

    return jsonify({"status": "camera stopped"})


# ===============================
# YOUTUBE AUDIO DOWNLOAD
# ===============================

@app.route("/youtube_audio", methods=["POST"])
def youtube_audio():

    data = request.json or {}
    url = data.get("url", "")

    audio = download_audio(url)

    return jsonify({
        "audio": audio
    })


# ===============================
# WHISPER TRANSCRIPTION
# ===============================

@app.route("/transcribe")
def transcribe():

    text = transcribe_audio()

    return jsonify({
        "transcript": text
    })


# ===============================
# PARTICIPANTS (SOCKET)
# ===============================

@socketio.on("join")
def join(data):

    name = data.get("name", "Student")

    if name not in participants:
        participants.append(name)

    emit("participants", participants, broadcast=True)


@socketio.on("disconnect")
def leave():

    if participants:
        participants.pop()

    emit("participants", participants, broadcast=True)


# ===============================
# WEBRTC SIGNALING
# ===============================

@socketio.on("offer")
def offer(data):
    emit("offer", data, broadcast=True, include_self=False)


@socketio.on("answer")
def answer(data):
    emit("answer", data, broadcast=True, include_self=False)


@socketio.on("candidate")
def candidate(data):
    emit("candidate", data, broadcast=True, include_self=False)


# ===============================
# QR CODE FOR STUDENTS
# ===============================

@app.route("/qr")
def qr():

    url = f"http://{SERVER_IP}:5500/frontend/student.html"

    img = qrcode.make(url)

    from io import BytesIO
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return send_file(buffer, mimetype="image/png")


# ===============================
# MAIN SERVER
# ===============================

if __name__ == "__main__":
    
    print("Server running...")
    print(f"Student URL: http://{SERVER_IP}:5500/frontend/student.html")

    speech_thread = threading.Thread(target=start_listening, args=(callback,))
    speech_thread.daemon = True
    speech_thread.start()

    print("Speech recognition started...")

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True
    )