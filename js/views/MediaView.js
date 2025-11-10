// MediaView - Renders the media section
export class MediaView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.callbacks = {};
    }

    render(mediaItems) {
        this.container.innerHTML = `
            <div class="media-header">
                <h2>My Media</h2>
                <button id="add-media-btn" class="btn btn-primary">Add Media</button>
            </div>
            <div class="media-filters">
                <select id="country-filter" class="form-select">
                    <option value="">All Countries</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Korean">Korean</option>
                    <option value="American">American</option>
                </select>
                <select id="status-filter-media" class="form-select">
                    <option value="">All Status</option>
                    <option value="plan-to-watch">Plan to Watch</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                </select>
                <select id="type-filter" class="form-select">
                    <option value="">All Types</option>
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                </select>
            </div>
            <div class="media-grid">
                ${mediaItems.length > 0 ? mediaItems.map(item => this.renderMediaCard(item)).join('') : '<p>No media items yet. Add one to get started!</p>'}
            </div>
        `;

        this.attachDOMListeners();
    }

    renderMediaCard(item) {
        const countryClass = item.originCountry.toLowerCase();
        const episodeInfo = item.type === 'series' && item.totalEpisodes 
            ? `<div class="episode-progress">Episode ${item.currentEpisode} / ${item.totalEpisodes}</div>`
            : '';
        
        return `
            <div class="media-card" data-id="${item.id}">
                <h3>${item.title}</h3>
                <p class="media-type">${item.type === 'movie' ? 'Movie' : 'Series'}</p>
                <span class="origin-country ${countryClass}">${item.originCountry}</span>
                <div class="status-badge ${item.status}">${item.status.replace('-', ' ')}</div>
                ${episodeInfo}
                ${item.rating ? `<div class="rating">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>` : ''}
                ${item.review ? `<p class="review-preview">${item.review.substring(0, 100)}${item.review.length > 100 ? '...' : ''}</p>` : ''}
                <div class="media-actions">
                    <button class="btn btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn btn-delete" data-id="${item.id}">Delete</button>
                </div>
            </div>
        `;
    }

    attachDOMListeners() {
        const addBtn = document.getElementById('add-media-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddMediaModal());
        }

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showEditMediaModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this media item?')) {
                    if (this.callbacks.onDeleteMedia) {
                        this.callbacks.onDeleteMedia(id);
                    }
                }
            });
        });

        const countryFilter = document.getElementById('country-filter');
        const statusFilter = document.getElementById('status-filter-media');
        const typeFilter = document.getElementById('type-filter');

        if (countryFilter) {
            countryFilter.addEventListener('change', () => this.handleFilterChange());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.handleFilterChange());
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.handleFilterChange());
        }
    }

    handleFilterChange() {
        const filters = {
            country: document.getElementById('country-filter')?.value || '',
            status: document.getElementById('status-filter-media')?.value || '',
            type: document.getElementById('type-filter')?.value || ''
        };

        if (this.callbacks.onFilterChange) {
            this.callbacks.onFilterChange(filters);
        }
    }

    showAddMediaModal() {
        const modal = this.createMediaModal();
        document.body.appendChild(modal);
        modal.classList.add('active');

        const form = modal.querySelector('#media-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const mediaData = {
                title: formData.get('title'),
                type: formData.get('type'),
                originCountry: formData.get('originCountry'),
                status: formData.get('status') || 'plan-to-watch',
                totalEpisodes: formData.get('totalEpisodes') ? parseInt(formData.get('totalEpisodes')) : null,
                currentEpisode: formData.get('currentEpisode') ? parseInt(formData.get('currentEpisode')) : 0,
                rating: formData.get('rating') ? parseInt(formData.get('rating')) : null,
                review: formData.get('review')
            };

            if (this.callbacks.onAddMedia) {
                this.callbacks.onAddMedia(mediaData);
            }
            modal.remove();
        });

        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showEditMediaModal(id) {
        if (this.callbacks.onGetMedia) {
            const item = this.callbacks.onGetMedia(id);
            if (item) {
                const modal = this.createMediaModal(item);
                document.body.appendChild(modal);
                modal.classList.add('active');

                const form = modal.querySelector('#media-form');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const updates = {
                        title: formData.get('title'),
                        type: formData.get('type'),
                        originCountry: formData.get('originCountry'),
                        status: formData.get('status'),
                        totalEpisodes: formData.get('totalEpisodes') ? parseInt(formData.get('totalEpisodes')) : null,
                        currentEpisode: formData.get('currentEpisode') ? parseInt(formData.get('currentEpisode')) : 0,
                        rating: formData.get('rating') ? parseInt(formData.get('rating')) : null,
                        review: formData.get('review')
                    };

                    if (this.callbacks.onUpdateMedia) {
                        this.callbacks.onUpdateMedia(id, updates);
                    }
                    modal.remove();
                });

                modal.querySelector('.close').addEventListener('click', () => modal.remove());
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            }
        }
    }

    createMediaModal(item = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${item ? 'Edit Media' : 'Add Media'}</h2>
                <form id="media-form">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" name="title" class="form-input" value="${item?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type *</label>
                        <select name="type" class="form-select" required>
                            <option value="movie" ${item?.type === 'movie' ? 'selected' : ''}>Movie</option>
                            <option value="series" ${item?.type === 'series' ? 'selected' : ''}>Series</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Origin Country *</label>
                        <select name="originCountry" class="form-select" required>
                            <option value="Chinese" ${item?.originCountry === 'Chinese' ? 'selected' : ''}>Chinese</option>
                            <option value="Korean" ${item?.originCountry === 'Korean' ? 'selected' : ''}>Korean</option>
                            <option value="American" ${item?.originCountry === 'American' ? 'selected' : ''}>American</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="plan-to-watch" ${item?.status === 'plan-to-watch' ? 'selected' : ''}>Plan to Watch</option>
                            <option value="watching" ${item?.status === 'watching' ? 'selected' : ''}>Watching</option>
                            <option value="completed" ${item?.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Total Episodes (for series)</label>
                        <input type="number" name="totalEpisodes" class="form-input" value="${item?.totalEpisodes || ''}" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Current Episode</label>
                        <input type="number" name="currentEpisode" class="form-input" value="${item?.currentEpisode || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rating (1-5)</label>
                        <input type="number" name="rating" class="form-input" value="${item?.rating || ''}" min="1" max="5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Review</label>
                        <textarea name="review" class="form-textarea">${item?.review || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">${item ? 'Update' : 'Add'} Media</button>
                </form>
            </div>
        `;
        return modal;
    }

    onAddMedia(callback) {
        this.callbacks.onAddMedia = callback;
    }

    onUpdateMedia(callback) {
        this.callbacks.onUpdateMedia = callback;
    }

    onDeleteMedia(callback) {
        this.callbacks.onDeleteMedia = callback;
    }

    onFilterChange(callback) {
        this.callbacks.onFilterChange = callback;
    }

    onGetMedia(callback) {
        this.callbacks.onGetMedia = callback;
    }
}
