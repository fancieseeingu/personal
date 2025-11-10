// BookController - Handles book CRUD operations and filtering
import { BookView } from '../views/BookView.js';
import { BookEntry } from '../models/BookEntry.js';
import { StorageService } from '../services/StorageService.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';
import { GoalTrackingService } from '../services/GoalTrackingService.js';


export class BookController {
    constructor() {
        this.view = new BookView('books-section');
        this.books = [];
        this.filteredBooks = [];
    }

    init() {
        this.books = StorageService.load(StorageService.KEYS.BOOKS);
        this.filteredBooks = [...this.books];
        this.attachEventListeners();
        this.view.render(this.filteredBooks);
    }

    attachEventListeners() {
        this.view.onAddBook((bookData) => this.addBook(bookData));
        this.view.onUpdateBook((id, updates) => this.updateBook(id, updates));
        this.view.onDeleteBook((id) => this.deleteBook(id));
        this.view.onFilterChange((filters) => this.filterBooks(filters));
        this.view.onGetBook((id) => this.getBook(id));
    }

    addBook(bookData) {
        const validation = ValidationUtils.validateBookEntry(bookData);
        if (!validation.valid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return;
        }

        const book = new BookEntry(
            Date.now(),
            bookData.title,
            bookData.author,
            bookData.genre,
            bookData.status
        );

        if (bookData.rating) {
            book.setRating(bookData.rating);
        }
        if (bookData.review) {
            book.review = bookData.review;
        }

        // Set initial status in history
        book.updateStatus(bookData.status);

        this.books.push(book);
        this.save();
        this.filteredBooks = [...this.books];
        this.view.render(this.filteredBooks);
    }

    updateBook(id, updates) {
        const book = this.books.find(b => b.id === id);
        if (book) {
            const oldStatus = book.status;
            
            // Update basic fields
            if (updates.title) book.title = updates.title;
            if (updates.author) book.author = updates.author;
            if (updates.genre) book.genre = updates.genre;
            if (updates.review !== undefined) book.review = updates.review;

            // Update status if changed
            if (updates.status && updates.status !== book.status) {
                book.updateStatus(updates.status);
            }

            // Update rating
            if (updates.rating) {
                book.setRating(updates.rating);
            } else if (updates.rating === null) {
                book.rating = null;
            }

            this.save();
            
            // Update goal progress if book was marked as completed
            if (updates.status === 'completed' && oldStatus !== 'completed') {
                this.updateGoalProgress();
            }
            
            this.filteredBooks = this.applyCurrentFilters();
            this.view.render(this.filteredBooks);
        }
    }

    deleteBook(id) {
        this.books = this.books.filter(b => b.id !== id);
        this.save();
        this.filteredBooks = this.applyCurrentFilters();
        this.view.render(this.filteredBooks);
    }

    filterBooks(filters) {
        this.currentFilters = filters;
        this.filteredBooks = this.applyCurrentFilters();
        this.view.render(this.filteredBooks);
    }

    applyCurrentFilters() {
        let filtered = [...this.books];

        if (this.currentFilters) {
            if (this.currentFilters.status) {
                filtered = filtered.filter(b => b.status === this.currentFilters.status);
            }
            if (this.currentFilters.genre) {
                filtered = filtered.filter(b => b.genre === this.currentFilters.genre);
            }
        }

        return filtered;
    }

    getBook(id) {
        return this.books.find(b => b.id === id);
    }

    save() {
        const result = StorageService.save(StorageService.KEYS.BOOKS, this.books);
        if (!result.success) {
            alert('Error saving books: ' + result.error);
        }
    }

    updateGoalProgress() {
        // Load all data needed for goal tracking
        const goals = StorageService.load(StorageService.KEYS.GOALS);
        const media = StorageService.load(StorageService.KEYS.MEDIA);
        const projects = StorageService.load(StorageService.KEYS.PROJECTS);

        // Update goal progress (GoalTrackingService will restore methods)
        const updatedGoals = GoalTrackingService.updateGoalProgress(
            goals,
            this.books,
            media,
            projects
        );

        // Save updated goals
        StorageService.save(StorageService.KEYS.GOALS, updatedGoals);
    }

    refresh() {
        this.books = StorageService.load(StorageService.KEYS.BOOKS);
        this.filteredBooks = this.applyCurrentFilters();
        this.view.render(this.filteredBooks);
    }
}
