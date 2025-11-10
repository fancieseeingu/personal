// BookView - Renders the books section
import { DateUtils } from '../utils/DateUtils.js';

export class BookView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.callbacks = {};
    }

    render(books) {
        this.container.innerHTML = `
            <div class="books-header">
                <h2>My Books</h2>
                <button id="add-book-btn" class="btn btn-primary">Add Book</button>
            </div>
            <div class="books-filters">
                <select id="status-filter">
                    <option value="">All Status</option>
                    <option value="to-read">To Read</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                </select>
                <select id="genre-filter">
                    <option value="">All Genres</option>
                </select>
            </div>
            <div class="books-list">
                ${books.length > 0 ? books.map(book => this.renderBookCard(book)).join('') : '<p>No books yet. Add your first book!</p>'}
            </div>
        `;

        this.populateGenreFilter(books);
        this.attachDOMListeners();
    }

    renderBookCard(book) {
        return `
            <div class="book-card" data-id="${book.id}">
                <h3>${book.title}</h3>
                <p class="author">by ${book.author}</p>
                <p class="genre">${book.genre}</p>
                <div class="status-badge ${book.status}">${book.status.replace('-', ' ')}</div>
                ${book.rating ? `<div class="rating">${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}</div>` : ''}
                ${book.review ? `<p class="review-preview">${book.review.substring(0, 100)}${book.review.length > 100 ? '...' : ''}</p>` : ''}
                <div class="book-actions">
                    <button class="btn btn-edit" data-id="${book.id}">Edit</button>
                    <button class="btn btn-delete" data-id="${book.id}">Delete</button>
                </div>
            </div>
        `;
    }

    populateGenreFilter(books) {
        const genres = [...new Set(books.map(b => b.genre))];
        const genreFilter = document.getElementById('genre-filter');
        if (genreFilter) {
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre;
                option.textContent = genre;
                genreFilter.appendChild(option);
            });
        }
    }

    attachDOMListeners() {
        const addBtn = document.getElementById('add-book-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddBookModal());
        }

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showEditBookModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this book?')) {
                    if (this.callbacks.onDeleteBook) {
                        this.callbacks.onDeleteBook(id);
                    }
                }
            });
        });

        const statusFilter = document.getElementById('status-filter');
        const genreFilter = document.getElementById('genre-filter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                if (this.callbacks.onFilterChange) {
                    this.callbacks.onFilterChange({
                        status: statusFilter.value,
                        genre: genreFilter.value
                    });
                }
            });
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', () => {
                if (this.callbacks.onFilterChange) {
                    this.callbacks.onFilterChange({
                        status: statusFilter.value,
                        genre: genreFilter.value
                    });
                }
            });
        }
    }

    showAddBookModal() {
        const modal = this.createBookModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    showEditBookModal(bookId) {
        if (this.callbacks.onGetBook) {
            const book = this.callbacks.onGetBook(bookId);
            if (book) {
                const modal = this.createBookModal(book);
                document.body.appendChild(modal);
                modal.classList.add('active');
            }
        }
    }

    createBookModal(book = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${book ? 'Edit Book' : 'Add Book'}</h2>
                <form id="book-form">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" id="book-title" class="form-input" value="${book ? book.title : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Author *</label>
                        <input type="text" id="book-author" class="form-input" value="${book ? book.author : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Genre *</label>
                        <input type="text" id="book-genre" class="form-input" value="${book ? book.genre : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select id="book-status" class="form-select">
                            <option value="to-read" ${book && book.status === 'to-read' ? 'selected' : ''}>To Read</option>
                            <option value="reading" ${book && book.status === 'reading' ? 'selected' : ''}>Reading</option>
                            <option value="completed" ${book && book.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rating (1-5)</label>
                        <input type="number" id="book-rating" class="form-input" min="1" max="5" value="${book && book.rating ? book.rating : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Review</label>
                        <textarea id="book-review" class="form-textarea">${book && book.review ? book.review : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">${book ? 'Update' : 'Add'} Book</button>
                        <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        const closeBtn = modal.querySelector('.close');
        const closeModalBtn = modal.querySelector('.close-modal');
        const form = modal.querySelector('#book-form');

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        closeModalBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const bookData = {
                title: document.getElementById('book-title').value,
                author: document.getElementById('book-author').value,
                genre: document.getElementById('book-genre').value,
                status: document.getElementById('book-status').value,
                rating: document.getElementById('book-rating').value ? parseInt(document.getElementById('book-rating').value) : null,
                review: document.getElementById('book-review').value
            };

            if (book) {
                if (this.callbacks.onUpdateBook) {
                    this.callbacks.onUpdateBook(book.id, bookData);
                }
            } else {
                if (this.callbacks.onAddBook) {
                    this.callbacks.onAddBook(bookData);
                }
            }
            modal.remove();
        });

        return modal;
    }

    onAddBook(callback) {
        this.callbacks.onAddBook = callback;
    }

    onUpdateBook(callback) {
        this.callbacks.onUpdateBook = callback;
    }

    onDeleteBook(callback) {
        this.callbacks.onDeleteBook = callback;
    }

    onFilterChange(callback) {
        this.callbacks.onFilterChange = callback;
    }

    onGetBook(callback) {
        this.callbacks.onGetBook = callback;
    }
}
