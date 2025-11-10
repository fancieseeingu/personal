export class ProjectView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.callbacks = {};
    }

    render(projects) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="projects-header">
                <h2>My Creative Projects</h2>
                <button id="add-project-btn" class="btn btn-primary">Add Project</button>
            </div>
            <div class="projects-filters">
                <select id="type-filter-project" class="form-select">
                    <option value="">All Types</option>
                    <option value="drawing">Drawing</option>
                    <option value="crafting">Crafting</option>
                </select>
                <select id="status-filter-project" class="form-select">
                    <option value="">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div class="projects-grid">
                ${projects.length > 0 ? projects.map(project => this.renderProjectCard(project)).join('') : '<p>No projects yet. Start your first creative project!</p>'}
            </div>
        `;
        // Attach listeners after render
        this.attachDOMListeners();
    }

    renderProjectCard(project) {
        const typeIcon = project.type === 'drawing' ? '🎨' : '✂️';
        const imageCount = project.images ? project.images.length : 0;
        const firstImage = imageCount > 0 ? project.images[0].dataUrl : null;
        const materialCount = project.linkedMaterials ? project.linkedMaterials.length : 0;

        return `
            <div class="project-card" data-id="${project.id}">
                ${firstImage ? `
                    <div class="project-thumbnail" data-id="${project.id}">
                        <img src="${firstImage}" alt="${project.title}">
                        ${imageCount > 1 ? `<span class="image-count">+${imageCount - 1}</span>` : ''}
                    </div>
                ` : `
                    <div class="project-thumbnail-placeholder" data-id="${project.id}">
                        <span class="type-icon">${typeIcon}</span>
                    </div>
                `}
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p class="project-type">${typeIcon} ${project.type}</p>
                    <div class="status-badge ${project.status}">${project.status.replace('-', ' ')}</div>
                    <p class="project-description">${project.description ? project.description.substring(0, 100) : ''}${project.description && project.description.length > 100 ? '...' : ''}</p>
                    ${project.estimatedTime ? `<p class="time-estimate">Est: ${project.estimatedTime}h</p>` : ''}
                    ${project.actualTime ? `<p class="time-actual">Actual: ${project.actualTime}h</p>` : ''}
                    ${materialCount > 0 ? `<p class="material-count">📦 ${materialCount} material${materialCount > 1 ? 's' : ''}</p>` : ''}
                    <div class="project-actions">
                        <button class="btn btn-edit" data-id="${project.id}">Edit</button>
                        <button class="btn btn-delete" data-id="${project.id}">Delete</button>
                        ${imageCount > 0 ? `<button class="btn btn-gallery" data-id="${project.id}">Gallery</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    attachDOMListeners() {
        if (!this.container) return;

        // Add-project button (scoped to container)
        const addBtn = this.container.querySelector('#add-project-btn');
        if (addBtn) {
            addBtn.removeEventListener?.('click', this._addClickHandler);
            this._addClickHandler = () => this.showAddProjectModal();
            addBtn.addEventListener('click', this._addClickHandler);
        }

        // Filters
        const typeFilter = this.container.querySelector('#type-filter-project');
        const statusFilter = this.container.querySelector('#status-filter-project');

        if (typeFilter) {
            typeFilter.removeEventListener?.('change', this._filterChangeHandler);
            this._filterChangeHandler = () => this.handleFilterChange();
            typeFilter.addEventListener('change', this._filterChangeHandler);
        }
        if (statusFilter) {
            statusFilter.removeEventListener?.('change', this._filterChangeHandler);
            statusFilter.addEventListener('change', this._filterChangeHandler);
        }

        // Event delegation on container for dynamic buttons and thumbnail clicks
        if (this._delegateHandler) {
            // remove existing to avoid duplicates
            this.container.removeEventListener('click', this._delegateHandler);
        }

        this._delegateHandler = (e) => {
            const btn = e.target.closest && e.target.closest('button');
            const card = e.target.closest && e.target.closest('.project-card');

            if (btn) {
                if (btn.classList.contains('btn-edit')) {
                    const id = Number(btn.dataset.id);
                    this.showEditProjectModal(id);
                    return;
                }
                if (btn.classList.contains('btn-delete')) {
                    const id = Number(btn.dataset.id);
                    if (confirm('Are you sure you want to delete this project?')) {
                        if (this.callbacks.onDeleteProject) this.callbacks.onDeleteProject(id);
                    }
                    return;
                }
                if (btn.classList.contains('btn-gallery')) {
                    const id = Number(btn.dataset.id);
                    this.showImageGallery(id);
                    return;
                }
            }

            if (card) {
                const thumb = e.target.closest && e.target.closest('.project-thumbnail, .project-thumbnail-placeholder');
                if (thumb) {
                    const id = Number(card.dataset.id);
                    if (this.callbacks.onGetProject) {
                        const project = this.callbacks.onGetProject(id);
                        if (project && project.images && project.images.length > 0) {
                            this.showImageGallery(id);
                        }
                    }
                }
            }
        };

        this.container.addEventListener('click', this._delegateHandler);
    }

    handleFilterChange() {
        const filters = {
            type: this.container.querySelector('#type-filter-project')?.value || '',
            status: this.container.querySelector('#status-filter-project')?.value || ''
        };

        if (this.callbacks.onFilterChange) {
            this.callbacks.onFilterChange(filters);
        }
    }

    showAddProjectModal() {
        const modal = this.createProjectModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
        this.setupModalHandlers(modal);
    }

    showEditProjectModal(id) {
        if (this.callbacks.onGetProject) {
            const project = this.callbacks.onGetProject(id);
            if (project) {
                const modal = this.createProjectModal(project);
                document.body.appendChild(modal);
                modal.classList.add('active');
                this.setupModalHandlers(modal, project);
            }
        }
    }

    createProjectModal(project = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${project ? 'Edit Project' : 'Add Project'}</h2>
                <form id="project-form">
                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" name="title" class="form-input" value="${project?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type *</label>
                        <select name="type" class="form-select" required>
                            <option value="drawing" ${project?.type === 'drawing' ? 'selected' : ''}>Drawing</option>
                            <option value="crafting" ${project?.type === 'crafting' ? 'selected' : ''}>Crafting</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description *</label>
                        <textarea name="description" class="form-textarea" required>${project?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="planning" ${project?.status === 'planning' ? 'selected' : ''}>Planning</option>
                            <option value="in-progress" ${project?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${project?.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estimated Time (hours)</label>
                        <input type="number" name="estimatedTime" class="form-input" value="${project?.estimatedTime || ''}" min="0" step="0.5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Actual Time (hours)</label>
                        <input type="number" name="actualTime" class="form-input" value="${project?.actualTime || ''}" min="0" step="0.5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Upload Images (max 5MB each)</label>
                        <input type="file" id="project-images" class="form-input" accept="image/*" multiple>
                        <small>You can select multiple images</small>
                    </div>
                    ${project && project.images && project.images.length > 0 ? `
                        <div class="form-group">
                            <label class="form-label">Current Images</label>
                            <div class="image-preview-grid">
                                ${project.images.map((img, idx) => `
                                    <div class="image-preview-item">
                                        <img src="${img.dataUrl}" alt="Project image ${idx + 1}">
                                        <button type="button" class="btn-remove-image" data-index="${idx}">×</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <button type="submit" class="btn btn-primary">${project ? 'Update' : 'Add'} Project</button>
                </form>
            </div>
        `;
        return modal;
    }

    setupModalHandlers(modal, project = null) {
        const closeBtn = modal.querySelector('.close');
        const form = modal.querySelector('#project-form');
        const fileInput = modal.querySelector('#project-images');

        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Handle image removal for existing project
        if (project) {
            modal.querySelectorAll('.btn-remove-image').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    if (this.callbacks.onRemoveImage) {
                        this.callbacks.onRemoveImage(project.id, index);
                        modal.remove();
                        // Reopen modal with updated project
                        setTimeout(() => this.showEditProjectModal(project.id), 100);
                    }
                });
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const projectData = {
                title: formData.get('title'),
                type: formData.get('type'),
                description: formData.get('description'),
                status: formData.get('status') || 'planning',
                estimatedTime: formData.get('estimatedTime') ? parseFloat(formData.get('estimatedTime')) : null,
                actualTime: formData.get('actualTime') ? parseFloat(formData.get('actualTime')) : null
            };

            // Handle image uploads
            const files = fileInput?.files || [];
            if (files.length > 0) {
                if (this.callbacks.onHandleImageUpload) {
                    try {
                        const images = await this.callbacks.onHandleImageUpload(files);
                        projectData.newImages = images;
                    } catch (error) {
                        alert(error.message);
                        return;
                    }
                }
            }

            if (project) {
                if (this.callbacks.onUpdateProject) {
                    this.callbacks.onUpdateProject(project.id, projectData);
                }
            } else {
                if (this.callbacks.onAddProject) {
                    this.callbacks.onAddProject(projectData);
                }
            }
            modal.remove();
        });
    }

    showImageGallery(projectId) {
        if (this.callbacks.onGetProject) {
            const project = this.callbacks.onGetProject(projectId);
            if (project && project.images && project.images.length > 0) {
                const gallery = this.createImageGallery(project);
                document.body.appendChild(gallery);
            }
        }
    }

    createImageGallery(project) {
        const gallery = document.createElement('div');
        gallery.className = 'lightbox';
        gallery.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <button class="lightbox-prev">‹</button>
                <button class="lightbox-next">›</button>
                <div class="lightbox-image-container">
                    <img src="${project.images[0].dataUrl}" alt="${project.title}" class="lightbox-image">
                    <div class="lightbox-caption">
                        <h3>${project.title}</h3>
                        <p class="image-counter">1 / ${project.images.length}</p>
                    </div>
                </div>
            </div>
        `;

        let currentIndex = 0;
        const img = gallery.querySelector('.lightbox-image');
        const counter = gallery.querySelector('.image-counter');
        const closeBtn = gallery.querySelector('.lightbox-close');
        const prevBtn = gallery.querySelector('.lightbox-prev');
        const nextBtn = gallery.querySelector('.lightbox-next');

        const updateImage = (index) => {
            currentIndex = index;
            img.src = project.images[index].dataUrl;
            counter.textContent = `${index + 1} / ${project.images.length}`;
        };

        prevBtn.addEventListener('click', () => {
            const newIndex = currentIndex > 0 ? currentIndex - 1 : project.images.length - 1;
            updateImage(newIndex);
        });

        nextBtn.addEventListener('click', () => {
            const newIndex = currentIndex < project.images.length - 1 ? currentIndex + 1 : 0;
            updateImage(newIndex);
        });

        closeBtn.addEventListener('click', () => gallery.remove());
        gallery.addEventListener('click', (e) => {
            if (e.target === gallery) gallery.remove();
        });

        // Keyboard navigation
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
            if (e.key === 'Escape') {
                gallery.remove();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        return gallery;
    }

    onAddProject(callback) {
        this.callbacks.onAddProject = callback;
    }

    onUpdateProject(callback) {
        this.callbacks.onUpdateProject = callback;
    }

    onDeleteProject(callback) {
        this.callbacks.onDeleteProject = callback;
    }

    onFilterChange(callback) {
        this.callbacks.onFilterChange = callback;
    }

    onGetProject(callback) {
        this.callbacks.onGetProject = callback;
    }

    onHandleImageUpload(callback) {
        this.callbacks.onHandleImageUpload = callback;
    }

    onRemoveImage(callback) {
        this.callbacks.onRemoveImage = callback;
    }
}