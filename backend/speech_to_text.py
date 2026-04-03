import speech_recognition as sr

recognizer = sr.Recognizer()

listening = False


def start_listening(callback):

    global listening
    listening = True

    with sr.Microphone() as source:

        recognizer.adjust_for_ambient_noise(source)

        while listening:

            try:

                audio = recognizer.listen(source)

                text = recognizer.recognize_google(audio)

                callback(text)

            except:
                pass


def stop_listening():

    global listening
    listening = False