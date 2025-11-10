// JournalController - Handles journal CRUD operations and tag filtering
import { JournalView } from '../views/JournalView.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { StorageService } from '../services/StorageService.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';

export class JournalController {
    constructor() {
        this.view = new JournalView('journal-section');
        this.entries = [];
        this.filteredEntries = [];
        this.currentTagFilter = '';
    }

    init() {
        this.entries = StorageService.load(StorageService.KEYS.JOURNALS);
        this.filteredEntries = [...this.entries];
        this.attachEventListeners();
        this.view.render(this.filteredEntries);
    }

    attachEventListeners() {
        this.view.onAddJournal((journalData) => this.addJournal(journalData));
        this.view.onUpdateJournal((id, updates) => this.updateJournal(id, updates));
        this.view.onDeleteJournal((id) => this.deleteJournal(id));
        this.view.onFilterByTag((tag) => this.filterByTag(tag));
        this.view.onGetJournal((id) => this.getJournal(id));
    }

    addJournal(journalData) {
        const validation = ValidationUtils.validateJournalEntry(journalData);
        if (!validation.valid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return;
        }

        const entry = new JournalEntry(
            Date.now(),
            journalData.title,
            journalData.content
        );

        // Add tags
        if (journalData.tags && journalData.tags.length > 0) {
            journalData.tags.forEach(tag => entry.addTag(tag));
        }

        // Add linked items
        if (journalData.linkedItems && journalData.linkedItems.length > 0) {
            journalData.linkedItems.forEach(item => {
                entry.linkItem(item.type, item.id);
            });
        }

        this.entries.push(entry);
        this.save();
        this.filteredEntries = this.applyCurrentFilter();
        this.view.render(this.filteredEntries);
    }

    updateJournal(id, updates) {
        const entry = this.entries.find(e => e.id === id);
        if (entry) {
            // Update basic fields
            if (updates.title) entry.title = updates.title;
            if (updates.content) entry.content = updates.content;

            // Update tags
            if (updates.tags !== undefined) {
                entry.tags = [...updates.tags];
            }

            // Update linked items
            if (updates.linkedItems !== undefined) {
                entry.linkedItems = [...updates.linkedItems];
            }

            this.save();
            this.filteredEntries = this.applyCurrentFilter();
            this.view.render(this.filteredEntries);
        }
    }

    deleteJournal(id) {
        this.entries = this.entries.filter(e => e.id !== id);
        this.save();
        this.filteredEntries = this.applyCurrentFilter();
        this.view.render(this.filteredEntries);
    }

    filterByTag(tag) {
        this.currentTagFilter = tag.toLowerCase().trim();
        this.filteredEntries = this.applyCurrentFilter();
        this.view.render(this.filteredEntries);
    }

    applyCurrentFilter() {
        let filtered = [...this.entries];

        if (this.currentTagFilter) {
            filtered = filtered.filter(entry => {
                return entry.tags && entry.tags.some(tag => 
                    tag.toLowerCase().includes(this.currentTagFilter)
                );
            });
        }

        return filtered;
    }

    getJournal(id) {
        return this.entries.find(e => e.id === id);
    }

    save() {
        const result = StorageService.save(StorageService.KEYS.JOURNALS, this.entries);
        if (!result.success) {
            alert('Error saving journal entries: ' + result.error);
        }
    }

    refresh() {
        this.entries = StorageService.load(StorageService.KEYS.JOURNALS);
        this.filteredEntries = this.applyCurrentFilter();
        this.view.render(this.filteredEntries);
    }
}
