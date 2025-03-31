from typing import Optional

from flask import render_template, request, jsonify

from notebook.db import app, Note


# API endpoints for AJAX requests


@app.route("/api/notes/<int:note_id>", methods=["GET"])
def get_note(note_id):
    note = Note.get_note(note_id)
    if note:
        return jsonify(note.to_dict())
    return jsonify({"error": "Note not found"}), 404


@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    note = Note.get_note(note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.json
    try:
        note.update(
            new_name=data.get("name"),
            new_content=data.get("content"),
            new_comments=data.get("comments"),
        )
        return jsonify(note.to_dict())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/notes", methods=["POST"])
def create_note():
    note = Note.create()
    return jsonify(note.to_dict()), 201


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    note = Note.get_note(note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    note.delete()
    return jsonify({"success": True})


@app.route("/api/notes", methods=["GET"])
def get_all_notes():
    notes = Note.query.all()
    return jsonify([{"id": note.id, "name": note.name} for note in notes])


# Main route for the notebook


@app.route("/", defaults={"note_id": None})
@app.route("/<int:note_id>")
def home(note_id: Optional[int]):
    # Get all notes for the sidebar
    notes = Note.query.all()
    note_list = [{"id": note.id, "name": note.name} for note in notes]

    # Get the note with the given ID, the most recent note, or a new note if needed
    if note_id is not None:
        note = Note.get_note(note_id)
    elif notes:
        note = Note.get_note()  # Gets most recent note
    else:
        note = Note.create()
        note_list.append({"id": note.id, "name": note.name})

    note_data = note.to_dict()
    note_data["created_at"] = note.created_at.strftime("%Y-%m-%d")
    return render_template("notebook.html", notes=note_list, current_note=note_data)


if __name__ == "__main__":
    app.run(debug=True)
