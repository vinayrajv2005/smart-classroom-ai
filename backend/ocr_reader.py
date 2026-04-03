import cv2
import pytesseract

def read_board():

    cam = cv2.VideoCapture(0)

    ret, frame = cam.read()

    text = pytesseract.image_to_string(frame)

    cam.release()

    return text