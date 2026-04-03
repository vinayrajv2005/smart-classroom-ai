import cv2
import pytesseract
import numpy as np

def read_board():

    cap = cv2.VideoCapture(0)

    ret, frame = cap.read()

    if not ret:
        cap.release()
        return {"text": "", "formulas": "", "diagram": False}

    # Resize for better processing
    frame = cv2.resize(frame, (800, 600))

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Improve contrast
    gray = cv2.GaussianBlur(gray, (5,5), 0)

    # Adaptive threshold helps OCR
    thresh = cv2.adaptiveThreshold(
        gray,255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,11,2
    )

    # =========================
    # OCR TEXT
    # =========================

    text = pytesseract.image_to_string(thresh)

    # =========================
    # DIAGRAM DETECTION
    # =========================

    edges = cv2.Canny(gray, 50, 150)

    # Detect lines (good for diagrams)
    lines = cv2.HoughLinesP(
        edges,
        1,
        np.pi/180,
        threshold=100,
        minLineLength=50,
        maxLineGap=10
    )

    diagram_detected = False

    if lines is not None and len(lines) > 5:
        diagram_detected = True

    # Detect contours (shapes)
    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    for cnt in contours:

        area = cv2.contourArea(cnt)

        if area > 1000:
            diagram_detected = True
            break

    # =========================
    # FORMULA DETECTION
    # =========================

    formula_keywords = ["=", "+", "-", "/", "*", "^"]

    formula_found = ""

    for symbol in formula_keywords:

        if symbol in text:
            formula_found = text
            break

    cap.release()

    return {
        "text": text.strip(),
        "formulas": formula_found.strip(),
        "diagram": diagram_detected
    }