import sqlite3

def init_db():

    conn = sqlite3.connect("lecture.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lecture(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT
    )
    """)

    conn.commit()
    conn.close()


def save_text(text):

    conn = sqlite3.connect("lecture.db")
    cursor = conn.cursor()

    cursor.execute("INSERT INTO lecture(text) VALUES(?)", (text,))
    
    conn.commit()
    conn.close()


def get_lecture():

    conn = sqlite3.connect("lecture.db")
    cursor = conn.cursor()

    cursor.execute("SELECT text FROM lecture")

    rows = cursor.fetchall()

    conn.close()

    lecture = " ".join([row[0] for row in rows])

    return lecture