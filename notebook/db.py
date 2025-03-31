import json
from typing import Dict, List, Optional

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

DEFAULT_NOTE_NAME = "My Note ({number})"

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///notes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Note(db.Model):
    """Model for a note in the notebook.

    Attributes:
        id: Auto-incrementing ID
        name: Unique identifier for the note
        content: Text content of the note
        comments: JSON string representing a list of comments (NOTE: Bad for scaling!)
        created_at: Timestamp when the note was created (immutable)
    """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    comments = db.Column(db.Text, default="[]")
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    @classmethod
    def get_all_names(cls) -> Dict[int, str]:
        return {note.id: note.name for note in cls.query.all()}

    @classmethod
    def get_note(cls, id: Optional[int] = None) -> "Note":
        if id is None:
            return Note.query.order_by(Note.id.desc()).first()  # Get most recent note
        return Note.query.filter_by(id=id).first()

    @classmethod
    def create(cls) -> "Note":
        note_names = [note.name for note in cls.query.all()]
        note_number = 1
        while True:
            new_note_name = DEFAULT_NOTE_NAME.format(number=note_number)
            if new_note_name not in note_names:
                new_note = Note(name=new_note_name, content="")
                db.session.add(new_note)
                db.session.commit()
                return new_note
            note_number += 1

    def update(
        self,
        new_name: Optional[str] = None,
        new_content: Optional[str] = None,
        new_comments: Optional[List[str]] = None,
    ) -> None:
        if new_name is not None and new_name != self.name:
            existing = Note.query.filter(Note.name == new_name, Note.id != self.id).first()
            if existing:
                raise ValueError("Name must be unique")
            self.name = new_name

        if new_content is not None:
            self.content = new_content

        if new_comments is not None:
            self.comments = json.dumps(new_comments)

        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "content": self.content,
            "comments": json.loads(self.comments),
        }


# Initialize the database
with app.app_context():
    db.create_all()
