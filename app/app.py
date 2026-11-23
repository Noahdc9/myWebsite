import os, sqlite3
from flask import Flask, jsonify, request

app = Flask(__name__)
DB = os.environ.get("DB_PATH", "/data/site.db")

def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

with db() as con:
    con.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        text TEXT NOT NULL,
        created TEXT DEFAULT CURRENT_TIMESTAMP)""")

@app.get("/api/health")
def health():
    return jsonify(status="ok")

@app.post("/api/messages")
def add_message():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()[:50]
    text = str(data.get("text", "")).strip()[:500]
    if not name or not text:
        return jsonify(error="name og text skal udfyldes"), 400
    with db() as con:
        con.execute("INSERT INTO messages (name, text) VALUES (?, ?)", (name, text))
    return jsonify(ok=True), 201

@app.get("/api/messages")
def list_messages():
    with db() as con:
        rows = con.execute(
            "SELECT name, text, created FROM messages ORDER BY id DESC LIMIT 50"
        ).fetchall()
    return jsonify([dict(r) for r in rows])
