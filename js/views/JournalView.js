// JournalView - Renders the journal section
import { DateUtils } from '../utils/DateUtils.js';

export class JournalView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.callbacks = {};
    }

    render(entries) {
        // Sort entries by date (most recent first)
        const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

        this.container.innerHTML = `
            <div class="journal-header">
                <h2>My Journal</h2>
                <button id="add-journal-btn" class="btn btn-primary">Add Entry</button>
            </div>
            <div class="journal-filters">
                <input type="text" id="tag-filter" class="form-input" placeholder="Filter by tag...">
                <button id="clear-filter-btn" class="btn btn-secondary">Clear Filter</button>
            </div>
            <div class="journal-list">
                ${sortedEntries.length > 0 ? sortedEntries.map(entry => this.renderJournalCard(entry)).join('') : '<p>No journal entries yet. Start writing!</p>'}
            </div>
        `;

        this.attachDOMListeners();
    }

    renderJournalCard(entry) {
        const formattedDate = DateUtils.formatDate(entry.date);
        const tagsHtml = entry.tags && entry.tags.length > 0 
            ? `<div class="journal-tags">${entry.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>`
            : '';
        
        const linkedItemsHtml = entry.linkedItems && entry.linkedItems.length > 0
            ? `<div class="linked-items">
                <span class="linked-label">🔗 Linked:</span>
                ${entry.linkedItems.map(item => `<span class="linked-item ${item.type}">${this.getItemIcon(item.type)} ${item.type}</span>`).join('')}
               </div>`
            : '';

        return `
            <div class="journal-card" data-id="${entry.id}">
                <div class="journal-header-info">
                    <h3>${entry.title}</h3>
                    <span class="journal-date">${formattedDate}</span>
                </div>
                <p class="journal-content">${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}</p>
                ${tagsHtml}
                ${linkedItemsHtml}
                <div class="journal-actions">
                    <button class="btn btn-edit" data-id="${entry.id}">Edit</button>
                    <button class="btn btn-delete" data-id="${entry.id}">Delete</button>
                    <button class="btn btn-view" data-id="${entry.id}">View Full</button>
                </div>
            </div>
        `;
    }

    getItemIcon(type) {
        const icons = {
            'book': '📚',
            'media': '🎬',
            'project': '🎨'
        };
        return icons[type] || '📎';
    }

    attachDOMListeners() {
        const addBtn = document.getElementById('add-journal-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddJournalModal());
        }

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showEditJournalModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this journal entry?')) {
                    if (this.callbacks.onDeleteJournal) {
                        this.callbacks.onDeleteJournal(id);
                    }
                }
            });
        });

        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showViewJournalModal(id);
            });
        });

        const tagFilter = document.getElementById('tag-filter');
        if (tagFilter) {
            tagFilter.addEventListener('input', (e) => {
                const tag = e.target.value.trim();
                if (this.callbacks.onFilterByTag) {
                    this.callbacks.onFilterByTag(tag);
                }
            });
        }

        const clearFilterBtn = document.getElementById('clear-filter-btn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                const tagFilter = document.getElementById('tag-filter');
                if (tagFilter) {
                    tagFilter.value = '';
                }
                if (this.callbacks.onFilterByTag) {
                    this.callbacks.onFilterByTag('');
                }
            });
        }
    }

    showAddJournalModal() {
        const modal = this.createJournalModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
        this.setupModalHandlers(modal);
    }

    showEditJournalModal(id) {
        if (this.callbacks.onGetJournal) {
            const entry = this.callbacks.onGetJournal(id);
            if (entry) {
                const modal = this.createJournalModal(entry);
                document.body.appendChild(modal);
                modal.classList.add('active');
                this.setupModalHandlers(modal, entry);
            }
        }
    }

    showViewJournalModal(id) {
        if (this.callbacks.onGetJournal) {
            const entry = this.callbacks.onGetJournal(id);
            if (entry) {
                const modal = this.createViewModal(entry);
                document.body.appendChild(modal);
                modal.classList.add('active');
            }
        }
    }

    createViewModal(entry) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        const formattedDate = DateUtils.formatDate(entry.date);
        const tagsHtml = entry.tags && entry.tags.length > 0 
            ? `<div class="journal-tags">${entry.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>`
            : '';
        
        const linkedItemsHtml = entry.linkedItems && entry.linkedItems.length > 0
            ? `<div class="linked-items">
                <strong>Linked Items:</strong><br>
                ${entry.linkedItems.map(item => `<span class="linked-item ${item.type}">${this.getItemIcon(item.type)} ${item.type} (ID: ${item.id})</span>`).join('<br>')}
               </div>`
            : '';

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${entry.title}</h2>
                <p class="journal-date">${formattedDate}</p>
                ${tagsHtml}
                <div class="journal-full-content">
                    ${entry.content}
                </div>
                ${linkedItemsHtml}
                <button class="btn btn-secondary close-modal">Close</button>
            </div>
        `;

        const closeBtn = modal.querySelector('.close');
        const closeModalBtn = modal.querySelector('.close-modal');

        closeBtn.addEventListener('click', () => modal.remove());
        closeModalBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        return modal;
    }

    createJournalModal(entry = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${entry ? 'Edit Journal Entry' : 'Add Journal Entry'}</h2>
                <form id="journal-form">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" name="title" class="form-input" value="${entry?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Content *</label>
                        <textarea name="content" class="form-textarea" rows="10" required>${entry?.content || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tags (comma-separated)</label>
                        <div id="tag-input-container">
                            <input type="text" id="tag-input" class="form-input" placeholder="e.g., reflection, art, reading">
                            <div id="tag-display" class="tag-display">
                                ${entry && entry.tags ? entry.tags.map(tag => `<span class="tag-chip" data-tag="${tag}">${tag} <button type="button" class="remove-tag">×</button></span>`).join('') : ''}
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Link Items</label>
                        <div class="link-items-container">
                            <select id="link-type" class="form-select">
                                <option value="">Select type...</option>
                                <option value="book">Book</option>
                                <option value="media">Media</option>
                                <option value="project">Project</option>
                            </select>
                            <input type="number" id="link-id" class="form-input" placeholder="Item ID" min="1">
                            <button type="button" id="add-link-btn" class="btn btn-secondary">Add Link</button>
                        </div>
                        <div id="linked-items-display" class="linked-items-display">
                            ${entry && entry.linkedItems ? entry.linkedItems.map((item, idx) => `
                                <span class="linked-chip" data-index="${idx}">
                                    ${this.getItemIcon(item.type)} ${item.type} (${item.id})
                                    <button type="button" class="remove-link">×</button>
                                </span>
                            `).join('') : ''}
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">${entry ? 'Update' : 'Add'} Entry</button>
                </form>
            </div>
        `;
        return modal;
    }

    setupModalHandlers(modal, entry = null) {
        const closeBtn = modal.querySelector('.close');
        const form = modal.querySelector('#journal-form');
        const tagInput = modal.querySelector('#tag-input');
        const tagDisplay = modal.querySelector('#tag-display');
        const linkTypeSelect = modal.querySelector('#link-type');
        const linkIdInput = modal.querySelector('#link-id');
        const addLinkBtn = modal.querySelector('#add-link-btn');
        const linkedItemsDisplay = modal.querySelector('#linked-items-display');

        let currentTags = entry && entry.tags ? [...entry.tags] : [];
        let currentLinkedItems = entry && entry.linkedItems ? [...entry.linkedItems] : [];

        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Tag input handling
        this.renderTagInput(tagInput, tagDisplay, currentTags);

        // Link items handling
        addLinkBtn.addEventListener('click', () => {
            const type = linkTypeSelect.value;
            const id = parseInt(linkIdInput.value);

            if (type && id && id > 0) {
                currentLinkedItems.push({ type, id });
                this.updateLinkedItemsDisplay(linkedItemsDisplay, currentLinkedItems);
                linkTypeSelect.value = '';
                linkIdInput.value = '';
            } else {
                alert('Please select a type and enter a valid ID');
            }
        });

        // Remove link handlers
        linkedItemsDisplay.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-link')) {
                const chip = e.target.closest('.linked-chip');
                const index = parseInt(chip.dataset.index);
                currentLinkedItems.splice(index, 1);
                this.updateLinkedItemsDisplay(linkedItemsDisplay, currentLinkedItems);
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const journalData = {
                title: formData.get('title'),
                content: formData.get('content'),
                tags: currentTags,
                linkedItems: currentLinkedItems
            };

            if (entry) {
                if (this.callbacks.onUpdateJournal) {
                    this.callbacks.onUpdateJournal(entry.id, journalData);
                }
            } else {
                if (this.callbacks.onAddJournal) {
                    this.callbacks.onAddJournal(journalData);
                }
            }
            modal.remove();
        });
    }

    renderTagInput(tagInput, tagDisplay, currentTags) {
        // Handle tag input
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = tagInput.value.trim().replace(/^#/, '').replace(/,/g, '');
                if (tag && !currentTags.includes(tag)) {
                    currentTags.push(tag);
                    this.updateTagDisplay(tagDisplay, currentTags);
                    tagInput.value = '';
                }
            }
        });

        // Handle tag removal
        tagDisplay.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                const chip = e.target.closest('.tag-chip');
                const tag = chip.dataset.tag;
                const index = currentTags.indexOf(tag);
                if (index > -1) {
                    currentTags.splice(index, 1);
                    this.updateTagDisplay(tagDisplay, currentTags);
                }
            }
        });
    }

    updateTagDisplay(tagDisplay, tags) {
        tagDisplay.innerHTML = tags.map(tag => 
            `<span class="tag-chip" data-tag="${tag}">${tag} <button type="button" class="remove-tag">×</button></span>`
        ).join('');
    }

    updateLinkedItemsDisplay(linkedItemsDisplay, linkedItems) {
        linkedItemsDisplay.innerHTML = linkedItems.map((item, idx) => 
            `<span class="linked-chip" data-index="${idx}">
                ${this.getItemIcon(item.type)} ${item.type} (${item.id})
                <button type="button" class="remove-link">×</button>
            </span>`
        ).join('');
    }

    onAddJournal(callback) {
        this.callbacks.onAddJournal = callback;
    }

    onUpdateJournal(callback) {
        this.callbacks.onUpdateJournal = callback;
    }

    onDeleteJournal(callback) {
        this.callbacks.onDeleteJournal = callback;
    }

    onFilterByTag(callback) {
        this.callbacks.onFilterByTag = callback;
    }

    onGetJournal(callback) {
        this.callbacks.onGetJournal = callback;
    }
}
