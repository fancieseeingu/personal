// Main application entry point
import { StorageService } from './services/StorageService.js';
import { SearchService } from './services/SearchService.js';
import { DateUtils } from './utils/DateUtils.js';
import { DashboardController } from './controllers/DashboardController.js';
import { BookController } from './controllers/BookController.js';
import { MediaController } from './controllers/MediaController.js';
import { ProjectController } from './controllers/ProjectController.js';
import { MaterialController } from './controllers/MaterialController.js';
import { JournalController } from './controllers/JournalController.js';
import { GoalController } from './controllers/GoalController.js';

class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.controllers = {};
        this.data = null;
        this.init();
    }

    init() {
        console.log('Personal Hobby Hub initializing...');
        
        // Set up global error handlers
        this.setupErrorHandlers();
        
        // Load all data from localStorage
        this.loadAllData();
        
        // Setup UI
        this.setupNavigation();
        this.setupSearch();
        
        // Load default section (dashboard)
        this.loadSection('dashboard');
    }

    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showToast('An unexpected error occurred', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showToast('An unexpected error occurred', 'error');
        });
    }

    loadAllData() {
        try {
            this.data = StorageService.loadAll();
            console.log('Data loaded successfully:', {
                books: this.data.books.length,
                media: this.data.media.length,
                projects: this.data.projects.length,
                materials: this.data.materials.length,
                journals: this.data.journals.length,
                goals: this.data.goals.length
            });
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data from storage', 'error');
            // Initialize with empty data
            this.data = {
                books: [],
                media: [],
                projects: [],
                materials: [],
                journals: [],
                goals: []
            };
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    navigateToSection(section) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update active section
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;
        this.loadSection(section);
    }

    loadSection(section) {
        console.log(`Loading section: ${section}`);
        
        // Initialize controller if not already done (lazy loading)
        if (!this.controllers[section]) {
            switch(section) {
                case 'dashboard':
                    this.initDashboard();
                    break;
                case 'books':
                    this.initBooks();
                    break;
                case 'media':
                    this.initMedia();
                    break;
                case 'projects':
                    this.initProjects();
                    break;
                case 'materials':
                    this.initMaterials();
                    break;
                case 'journal':
                    this.initJournal();
                    break;
                case 'goals':
                    this.initGoals();
                    break;
                default:
                    console.warn(`Unknown section: ${section}`);
            }
        } else {
            // Refresh the section if controller exists
            if (this.controllers[section] && this.controllers[section].refresh) {
                this.controllers[section].refresh();
            } else if (this.controllers[section] && this.controllers[section].init) {
                this.controllers[section].init();
            }
        }
    }

    initDashboard() {
        const controller = new DashboardController();
        this.controllers.dashboard = controller;
        controller.init();
    }

    initBooks() {
        const controller = new BookController();
        this.controllers.books = controller;
        controller.init();
    }

    initMedia() {
        const controller = new MediaController();
        this.controllers.media = controller;
        controller.init();
    }

    initProjects() {
        const controller = new ProjectController();
        this.controllers.projects = controller;
        controller.init();
    }

    initMaterials() {
        const controller = new MaterialController();
        this.controllers.materials = controller;
        controller.init();
    }

    initJournal() {
        const controller = new JournalController();
        this.controllers.journal = controller;
        controller.init();
    }

    initGoals() {
        const controller = new GoalController();
        this.controllers.goals = controller;
        controller.init();
    }

    setupSearch() {
        const searchInput = document.getElementById('global-search');
        const searchModal = document.getElementById('search-results-modal');
        const searchResults = document.getElementById('search-results');
        const closeBtn = searchModal.querySelector('.close');
        const applyFiltersBtn = document.getElementById('apply-search-filters');
        const clearFiltersBtn = document.getElementById('clear-search-filters');

        let currentQuery = '';
        let searchTimeout = null;

        // Search input with debounce
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            currentQuery = query;

            clearTimeout(searchTimeout);
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                    searchModal.classList.add('active');
                }, 300);
            } else if (query.length === 0) {
                searchModal.classList.remove('active');
            }
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            searchModal.classList.remove('active');
            searchInput.value = '';
        });

        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
                searchInput.value = '';
            }
        });

        // Apply filters
        applyFiltersBtn.addEventListener('click', () => {
            if (currentQuery) {
                this.performSearch(currentQuery, true);
            }
        });

        // Clear filters
        clearFiltersBtn.addEventListener('click', () => {
            document.getElementById('search-date-from').value = '';
            document.getElementById('search-date-to').value = '';
            document.getElementById('search-tag').value = '';
            if (currentQuery) {
                this.performSearch(currentQuery);
            }
        });
    }

    performSearch(query, applyFilters = false) {
        const searchResults = document.getElementById('search-results');
        
        // Show loading state
        searchResults.innerHTML = '<div class="search-loading"><div class="search-loading-spinner"></div><p>Searching...</p></div>';

        // Get all data
        const data = {
            books: StorageService.load(StorageService.KEYS.BOOKS),
            media: StorageService.load(StorageService.KEYS.MEDIA),
            projects: StorageService.load(StorageService.KEYS.PROJECTS),
            materials: StorageService.load(StorageService.KEYS.MATERIALS),
            journals: StorageService.load(StorageService.KEYS.JOURNALS),
            goals: StorageService.load(StorageService.KEYS.GOALS)
        };

        // Perform search
        let results = SearchService.search(query, data);

        // Apply additional filters if requested
        if (applyFilters) {
            const dateFrom = document.getElementById('search-date-from').value;
            const dateTo = document.getElementById('search-date-to').value;
            const tagFilter = document.getElementById('search-tag').value.trim();

            if (dateFrom && dateTo) {
                const startDate = new Date(dateFrom);
                const endDate = new Date(dateTo);
                
                Object.keys(results).forEach(type => {
                    results[type] = SearchService.filterByDateRange(results[type], startDate, endDate);
                });
            }

            if (tagFilter) {
                const tags = tagFilter.split(',').map(t => t.trim());
                results.journals = SearchService.filterByTags(results.journals, tags);
            }
        }

        // Render results
        this.renderSearchResults(results, query);
    }

    renderSearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

        if (totalResults === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try searching with different keywords</p>
                </div>
            `;
            return;
        }

        let html = '';

        // Render Books
        if (results.books.length > 0) {
            html += this.renderResultGroup('books', '📚 Books', results.books, query, (book) => `
                <h4>${this.highlightText(book.title, query)}</h4>
                <div class="result-meta">
                    <span>by ${this.highlightText(book.author, query)}</span>
                    <span>${book.genre}</span>
                    <span class="status-badge ${book.status}">${book.status}</span>
                </div>
                ${book.review ? `<div class="result-preview">${this.highlightText(this.truncate(book.review, 150), query)}</div>` : ''}
            `);
        }

        // Render Media
        if (results.media.length > 0) {
            html += this.renderResultGroup('media', '🎬 Media', results.media, query, (item) => `
                <h4>${this.highlightText(item.title, query)}</h4>
                <div class="result-meta">
                    <span>${item.type}</span>
                    <span>${item.originCountry}</span>
                    <span class="status-badge ${item.status}">${item.status}</span>
                </div>
                ${item.review ? `<div class="result-preview">${this.highlightText(this.truncate(item.review, 150), query)}</div>` : ''}
            `);
        }

        // Render Projects
        if (results.projects.length > 0) {
            html += this.renderResultGroup('projects', '🎨 Projects', results.projects, query, (project) => `
                <h4>${this.highlightText(project.title, query)}</h4>
                <div class="result-meta">
                    <span>${project.type}</span>
                    <span class="status-badge ${project.status}">${project.status}</span>
                </div>
                <div class="result-preview">${this.highlightText(this.truncate(project.description, 150), query)}</div>
            `);
        }

        // Render Materials
        if (results.materials && results.materials.length > 0) {
            html += this.renderResultGroup('materials', '📦 Materials', results.materials, query, (material) => `
                <h4>${this.highlightText(material.name, query)}</h4>
                <div class="result-meta">
                    <span>${material.category}</span>
                    <span>Qty: ${material.quantity}</span>
                    <span>${material.location}</span>
                </div>
            `);
        }

        // Render Journals
        if (results.journals.length > 0) {
            html += this.renderResultGroup('journals', '📝 Journals', results.journals, query, (journal) => `
                <h4>${this.highlightText(journal.title, query)}</h4>
                <div class="result-meta">
                    <span>${DateUtils.formatDate(journal.date)}</span>
                </div>
                <div class="result-preview">${this.highlightText(this.truncate(journal.content, 150), query)}</div>
                ${journal.tags && journal.tags.length > 0 ? `
                    <div class="result-tags">
                        ${journal.tags.map(tag => `<span class="result-tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            `);
        }

        // Render Goals
        if (results.goals && results.goals.length > 0) {
            html += this.renderResultGroup('goals', '🎯 Goals', results.goals, query, (goal) => `
                <h4>${this.highlightText(goal.description, query)}</h4>
                <div class="result-meta">
                    <span>${goal.category}</span>
                    <span>${goal.currentValue} / ${goal.targetValue}</span>
                    <span class="status-badge ${goal.status}">${goal.status}</span>
                </div>
            `);
        }

        searchResults.innerHTML = html;
    }

    renderResultGroup(type, title, items, query, renderItem) {
        return `
            <div class="search-result-group ${type}">
                <h3>${title} <span class="count">(${items.length})</span></h3>
                ${items.map(item => `
                    <div class="search-result-item" data-type="${type}" data-id="${item.id}">
                        ${renderItem(item)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    highlightText(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    truncate(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    // Toast notification system
    showToast(message, type = 'success') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Save feedback wrapper
    handleSaveResult(result, entityType) {
        if (result.success) {
            this.showToast(`${entityType} saved successfully`, 'success');
        } else {
            if (result.error && result.error.includes('quota')) {
                this.showToast('Storage limit exceeded. Please delete some entries or images.', 'error');
            } else {
                this.showToast(`Error saving ${entityType}: ${result.error || 'Unknown error'}`, 'error');
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
