// ProjectController - Handles creative project CRUD operations and image management
import { ProjectView } from '../views/ProjectView.js';
import { CreativeProject } from '../models/CreativeProject.js';
import { StorageService } from '../services/StorageService.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';
import { GoalTrackingService } from '../services/GoalTrackingService.js';

export class ProjectController {
    constructor() {
        this.view = new ProjectView('projects-section');
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilters = null;
    }

    init() {
        this.projects = StorageService.load(StorageService.KEYS.PROJECTS);
        this.filteredProjects = [...this.projects];
        this.attachEventListeners();
        this.view.render(this.filteredProjects);
    }

    attachEventListeners() {
        this.view.onAddProject((projectData) => this.addProject(projectData));
        this.view.onUpdateProject((id, updates) => this.updateProject(id, updates));
        this.view.onDeleteProject((id) => this.deleteProject(id));
        this.view.onFilterChange((filters) => this.filterProjects(filters));
        this.view.onGetProject((id) => this.getProject(id));
        this.view.onHandleImageUpload((files) => this.handleImageUpload(files));
        this.view.onRemoveImage((projectId, imageIndex) => this.removeImage(projectId, imageIndex));
    }

    async addProject(projectData) {
        const validation = ValidationUtils.validateCreativeProject(projectData);
        if (!validation.valid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return;
        }

        const project = new CreativeProject(
            Date.now(),
            projectData.title,
            projectData.type,
            projectData.description
        );

        project.status = projectData.status || 'planning';
        project.estimatedTime = projectData.estimatedTime;
        project.actualTime = projectData.actualTime;

        // Add images if provided
        if (projectData.newImages && projectData.newImages.length > 0) {
            projectData.newImages.forEach(imageDataUrl => {
                project.addImage(imageDataUrl);
            });
        }

        this.projects.push(project);
        this.save();
        this.filteredProjects = [...this.projects];
        this.view.render(this.filteredProjects);
    }

    async updateProject(id, updates) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            const oldStatus = project.status;
            
            // Update basic fields
            if (updates.title) project.title = updates.title;
            if (updates.type) project.type = updates.type;
            if (updates.description) project.description = updates.description;
            if (updates.status) {
                project.status = updates.status;
                if (updates.status === 'completed' && !project.dateCompleted) {
                    project.dateCompleted = new Date().toISOString();
                }
            }
            if (updates.estimatedTime !== undefined) project.estimatedTime = updates.estimatedTime;
            if (updates.actualTime !== undefined) project.actualTime = updates.actualTime;

            // Add new images if provided
            if (updates.newImages && updates.newImages.length > 0) {
                updates.newImages.forEach(imageDataUrl => {
                    project.addImage(imageDataUrl);
                });
            }

            this.save();
            
            // Update goal progress if project was marked as completed
            if (updates.status === 'completed' && oldStatus !== 'completed') {
                this.updateGoalProgress();
            }
            
            this.filteredProjects = this.applyCurrentFilters();
            this.view.render(this.filteredProjects);
        }
    }

    deleteProject(id) {
        this.projects = this.projects.filter(p => p.id !== id);
        this.save();
        this.filteredProjects = this.applyCurrentFilters();
        this.view.render(this.filteredProjects);
    }

    removeImage(projectId, imageIndex) {
        const project = this.projects.find(p => p.id === projectId);
        if (project && project.images && project.images[imageIndex]) {
            project.images.splice(imageIndex, 1);
            this.save();
            this.filteredProjects = this.applyCurrentFilters();
        }
    }

    filterProjects(filters) {
        this.currentFilters = filters;
        this.filteredProjects = this.applyCurrentFilters();
        this.view.render(this.filteredProjects);
    }

    applyCurrentFilters() {
        let filtered = [...this.projects];

        if (this.currentFilters) {
            if (this.currentFilters.type) {
                filtered = filtered.filter(p => p.type === this.currentFilters.type);
            }
            if (this.currentFilters.status) {
                filtered = filtered.filter(p => p.status === this.currentFilters.status);
            }
        }

        return filtered;
    }

    getProject(id) {
        return this.projects.find(p => p.id === id);
    }

    async handleImageUpload(files) {
        const images = [];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxWidth = 1920;
        const maxHeight = 1080;

        for (let file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error(`File ${file.name} is not a valid image`);
            }

            // Validate file size
            if (!ValidationUtils.validateImageSize(file)) {
                throw new Error(`File ${file.name} exceeds 5MB limit`);
            }

            try {
                const dataUrl = await this.resizeImage(file, maxWidth, maxHeight);
                images.push(dataUrl);
            } catch (error) {
                throw new Error(`Failed to process image ${file.name}: ${error.message}`);
            }
        }

        return images;
    }

    resizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth || height > maxHeight) {
                        const aspectRatio = width / height;

                        if (width > height) {
                            width = maxWidth;
                            height = width / aspectRatio;
                        } else {
                            height = maxHeight;
                            width = height * aspectRatio;
                        }
                    }

                    // Create canvas and resize
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to data URL (JPEG with 80% quality)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    save() {
        const result = StorageService.save(StorageService.KEYS.PROJECTS, this.projects);
        if (!result.success) {
            alert('Error saving projects: ' + result.error);
        }
    }

    updateGoalProgress() {
        // Load all data needed for goal tracking
        const goals = StorageService.load(StorageService.KEYS.GOALS);
        const books = StorageService.load(StorageService.KEYS.BOOKS);
        const media = StorageService.load(StorageService.KEYS.MEDIA);

        // Update goal progress
        const updatedGoals = GoalTrackingService.updateGoalProgress(
            goals,
            books,
            media,
            this.projects
        );

        // Save updated goals
        StorageService.save(StorageService.KEYS.GOALS, updatedGoals);
    }

    refresh() {
        this.projects = StorageService.load(StorageService.KEYS.PROJECTS);
        this.filteredProjects = this.applyCurrentFilters();
        this.view.render(this.filteredProjects);
    }
}
