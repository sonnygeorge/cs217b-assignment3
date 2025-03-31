// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const searchBar = document.getElementById('search-bar');
    const notesList = document.querySelector('.searchable-index ul');
    const noteTitle = document.getElementById('note-title-input');
    const noteContent = document.getElementById('note-content');
    const commentsContainer = document.querySelector('.note-comments');
    const addCommentBtn = document.getElementById('add-comment-btn');
    const createNoteBtn = document.getElementById('create-note-btn');
    
    // Current note ID
    let currentNoteId = noteTitle.dataset.noteId;
    
    // Debounce function to limit how often a function can be called
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Function to filter notes based on search input
    function filterNotes() {
        console.log('Filtering notes...');
        const searchTerm = searchBar.value.toLowerCase();
        const noteItems = notesList.querySelectorAll('li');
        
        noteItems.forEach(item => {
            const noteName = item.querySelector('a').textContent.toLowerCase();
            if (noteName.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Function to update note in the database
    function updateNote(changes) {
        console.log('Updating note...');
        if (!currentNoteId) return;
        
        fetch(`/api/notes/${currentNoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changes)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update note');
            }
            return response.json();
        })
        .then(data => {
            // If the name was updated, update the sidebar
            if (changes.name) {
                const noteItem = notesList.querySelector(`li a[data-note-id="${currentNoteId}"]`);
                if (noteItem) {
                    noteItem.textContent = changes.name;
                }
            }
        })
        .catch(error => {
            console.error('Error updating note:', error);
            alert('Failed to update note: ' + error.message);
        });
    }
    
    // Function to gather all comments from the UI
    function getAllComments() {
        console.log('Getting all comments...');
        const commentInputs = commentsContainer.querySelectorAll('.note-comment input');
        const dateStrings = commentsContainer.querySelectorAll('.note-comment span');
        console.log(dateStrings);
        comments = Array.from(commentInputs).map(input => input.value);
        dates = Array.from(dateStrings).map(date => date.textContent);
        return comments.map((comment, index) => ({ comment, date: dates[index] }));
    }
    
    // Function to create a new note
    function createNewNote() {
        console.log('Creating new note...');
        fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(note => {
            // Add the new note to the sidebar
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `/${note.id}`;
            a.textContent = note.name;
            a.dataset.noteId = note.id;
            li.appendChild(a);
            notesList.appendChild(li);
            
            // Navigate to the new note
            window.location.href = `/${note.id}`;
        })
        .catch(error => {
            console.error('Error creating note:', error);
            alert('Failed to create note');
        });
    }
    
    // Function to delete the current note
    function deleteNote() {
        console.log('Deleting note...');
        if (!currentNoteId || !confirm('Are you sure you want to delete this note?')) {
            return;
        }
        
        fetch(`/api/notes/${currentNoteId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            return response.json();
        })
        .then(() => {
            // Redirect to home page
            window.location.href = '/';
        })
        .catch(error => {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        });
    }
    
    // Function to add a new comment input field
    function addCommentField(value = '') {
        console.log('Adding comment field...');
        const commentDiv = document.createElement('div');
        commentDiv.className = 'note-comment';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your comment here...';
        input.value = value;
        
        // Add event listener for the new input
        input.addEventListener('input', debounce(() => {
            updateNote({ comments: getAllComments() });
        }, 500));

        today = new Date();
        const date = document.createElement('span');
        date.className = 'comment-date-string';
        // Stringify just the date portion of the date object e.g. 2021-09-01
        date.textContent = today.toISOString().split('T')[0];
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-comment-btn';
        deleteBtn.addEventListener('click', function() {
            commentDiv.remove();
            updateNote({ comments: getAllComments() });
        });
        
        commentDiv.appendChild(input);
        commentDiv.appendChild(date);
        commentDiv.appendChild(deleteBtn);
        commentsContainer.appendChild(commentDiv);
    }
    
    // Setup event listeners
    
    // Search bar filtering
    searchBar.addEventListener('input', filterNotes);
    
    // Note title updates
    noteTitle.addEventListener('input', debounce(() => {
        updateNote({ name: noteTitle.value });
    }, 500));
    
    // Note content updates
    noteContent.addEventListener('input', debounce(() => {
        updateNote({ content: noteContent.value });
    }, 500));
    
    // Comment updates (for existing comments)
    document.querySelectorAll('.note-comment input').forEach(input => {
        input.addEventListener('input', debounce(() => {
            updateNote({ comments: getAllComments() });
        }, 500));
    });
    
    // Add comment button
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', () => {
            addCommentField();
        });
    }
    
    // Create note button
    if (createNoteBtn) {
        createNoteBtn.addEventListener('click', createNewNote);
    }
    
    // Delete note button
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    if (deleteNoteBtn) {
        deleteNoteBtn.addEventListener('click', deleteNote);
    }
    
    // Initialize comment delete buttons
    document.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.note-comment').remove();
            updateNote({ comments: getAllComments() });
        });
    });
});