from fpdf import FPDF
from database import get_lecture

def generate_pdf():

    lecture = get_lecture()

    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", size=12)

    pdf.multi_cell(0,10,lecture)

    pdf.output("lecture_notes.pdf")