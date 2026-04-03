from deep_translator import GoogleTranslator
import textwrap
import re

def translate_text(text, language):

    try:

        if not text:
            return ""

        # =========================
        # STEP 1: CLEAN TEXT
        # =========================
        text = re.sub(r'\s+', ' ', text)

        # =========================
        # STEP 2: SPLIT INTO SENTENCES
        # =========================
        sentences = re.split(r'(?<=[.!?]) +', text)

        translated_sentences = []

        for sentence in sentences:

            sentence = sentence.strip()

            if not sentence:
                continue

            # =========================
            # STEP 3: HANDLE LONG SENTENCES
            # =========================
            chunks = textwrap.wrap(sentence, 200)

            translated_chunk = ""

            for chunk in chunks:
                try:
                    translated = GoogleTranslator(
                        source="auto",
                        target=language
                    ).translate(chunk)

                    if translated:
                        translated_chunk += translated + " "

                except Exception as e:
                    print("Chunk error:", e)

            translated_sentences.append(translated_chunk.strip())

        # =========================
        # STEP 4: FORMAT OUTPUT
        # =========================

        # Convert into readable format (line by line)
        final_text = "\n\n".join(translated_sentences)

        return final_text.strip()

    except Exception as e:
        print("Translation error:", e)
        return "Translation failed"