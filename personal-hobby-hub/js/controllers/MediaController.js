// MediaController - Handles media CRUD operations and filtering
import { MediaView } from '../views/MediaView.js';
import { MediaItem } from '../models/MediaItem.js';
import { StorageService } from '../services/StorageService.js';
import { GoalTrackingService } from '../services/GoalTrackingService.js';

export class MediaController {
    constructor() {
        this.view = new MediaView('media-section');
        this.mediaItems = [];
        this.filteredMedia = [];
        this.currentFilters = {};
    }

    init() {
        this.mediaItems = StorageService.load(StorageService.KEYS.MEDIA);
        this.filteredMedia = [...this.mediaItems];
        this.attachEventListeners();
        this.view.render(this.filteredMedia);
    }

    attachEventListeners() {
        this.view.onAddMedia((mediaData) => this.addMedia(mediaData));
        this.view.onUpdateMedia((id, updates) => this.updateMedia(id, updates));
        this.view.onDeleteMedia((id) => this.deleteMedia(id));
        this.view.onFilterChange((filters) => this.filterMedia(filters));
        this.view.onGetMedia((id) => this.getMedia(id));
    }

    addMedia(mediaData) {
        const media = new MediaItem(
            Date.now(),
            mediaData.title,
            mediaData.type,
            mediaData.originCountry
        );

        // Set optional fields
        if (mediaData.status) {
            media.status = mediaData.status;
        }
        if (mediaData.rating) {
            media.rating = mediaData.rating;
        }
        if (mediaData.review) {
            media.review = mediaData.review;
        }
        if (mediaData.totalEpisodes) {
            media.totalEpisodes = mediaData.totalEpisodes;
        }
        if (mediaData.currentEpisode !== undefined) {
            // Use updateProgress to handle auto-completion logic
            media.updateProgress(mediaData.currentEpisode);
        }

        this.mediaItems.push(media);
        this.save();
        this.filteredMedia = [...this.mediaItems];
        this.view.render(this.filteredMedia);
    }

    updateMedia(id, updates) {
        const media = this.mediaItems.find(m => m.id === id);
        if (media) {
            const oldStatus = media.status;
            
            // Update basic fields
            if (updates.title) media.title = updates.title;
            if (updates.type) media.type = updates.type;
            if (updates.originCountry) media.originCountry = updates.originCountry;
            if (updates.review !== undefined) media.review = updates.review;

            // Update status
            if (updates.status) {
                media.status = updates.status;
                if (updates.status === 'completed' && !media.dateCompleted) {
                    media.dateCompleted = new Date().toISOString();
                }
            }

            // Update rating
            if (updates.rating) {
                media.rating = updates.rating;
            } else if (updates.rating === null) {
                media.rating = null;
            }

            // Update episode information
            if (updates.totalEpisodes !== undefined) {
                media.totalEpisodes = updates.totalEpisodes;
            }

            // Update current episode with auto-completion logic
            if (updates.currentEpisode !== undefined) {
                media.updateProgress(updates.currentEpisode);
            }

            this.save();
            
            // Update goal progress if media was marked as completed
            if (updates.status === 'completed' && oldStatus !== 'completed') {
                this.updateGoalProgress();
            }
            
            this.filteredMedia = this.applyCurrentFilters();
            this.view.render(this.filteredMedia);
        }
    }

    deleteMedia(id) {
        this.mediaItems = this.mediaItems.filter(m => m.id !== id);
        this.save();
        this.filteredMedia = this.applyCurrentFilters();
        this.view.render(this.filteredMedia);
    }

    filterMedia(filters) {
        this.currentFilters = filters;
        this.filteredMedia = this.applyCurrentFilters();
        this.view.render(this.filteredMedia);
    }

    applyCurrentFilters() {
        let filtered = [...this.mediaItems];

        if (this.currentFilters) {
            if (this.currentFilters.country) {
                filtered = filtered.filter(m => m.originCountry === this.currentFilters.country);
            }
            if (this.currentFilters.status) {
                filtered = filtered.filter(m => m.status === this.currentFilters.status);
            }
            if (this.currentFilters.type) {
                filtered = filtered.filter(m => m.type === this.currentFilters.type);
            }
        }

        return filtered;
    }

    getMedia(id) {
        return this.mediaItems.find(m => m.id === id);
    }

    save() {
        const result = StorageService.save(StorageService.KEYS.MEDIA, this.mediaItems);
        if (!result.success) {
            alert('Error saving media: ' + result.error);
        }
    }

    updateGoalProgress() {
        // Load all data needed for goal tracking
        const goals = StorageService.load(StorageService.KEYS.GOALS);
        const books = StorageService.load(StorageService.KEYS.BOOKS);
        const projects = StorageService.load(StorageService.KEYS.PROJECTS);

        // Update goal progress
        const updatedGoals = GoalTrackingService.updateGoalProgress(
            goals,
            books,
            this.mediaItems,
            projects
        );

        // Save updated goals
        StorageService.save(StorageService.KEYS.GOALS, updatedGoals);
    }

    refresh() {
        this.mediaItems = StorageService.load(StorageService.KEYS.MEDIA);
        this.filteredMedia = this.applyCurrentFilters();
        this.view.render(this.filteredMedia);
    }
}
