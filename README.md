# Reactive "Notebook" Flask App

<img src="https://media.giphy.com/media/b8EJwKmPO8FYkgnG22/giphy.gif" width="100%">

## How to run w/out Docker:

1. Clone the repository
2. Install the requirements: `pip install -r requirements.txt`
3. Run the app: `python run.py`
4. Open your browser and go to `http://localhost:5000/`

## How to run w/ Docker:

```bash
mkdir -p instance

docker build -t flask-app .

docker run -d \
  --name flask-container \
  -p 5000:5000 \
  --mount type=bind,source="$(pwd)"/instance,target=/app/instance \
  flask-app
```

You can stop and delete the image with:

```bash
docker stop flask-container
docker rm flask-container
```


## Grading Checklist:

New:
- ✅ The app uses the same (persistent) local DB, regardless of whether you run it inside or outside of the Docker container (assuming you follow the above instructions).

Old:
- ✅ Flask app w/ Flask-SQLAlchemy backend
- ✅ "Create a note, where a note has a name and a content."
- ✅ "Return a list of all notes."
- ✅ "Return a list of notes that match a search term."
- ✅ "Return the content of a note identified by name."
- ✅ "Add a date to each note and comment."
- ✅ "Allow comments on a note."
- ✅ "Delete a note and all of its comments."

