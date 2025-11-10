// DashboardController - Coordinates data loading and dashboard view rendering
import { DashboardView } from '../views/DashboardView.js';
import { StorageService } from '../services/StorageService.js';
import { GoalTrackingService } from '../services/GoalTrackingService.js';
import { Goal } from '../models/Goal.js';

export class DashboardController {
    constructor() {
        this.view = new DashboardView('dashboard-section');
        this.data = {
            books: [],
            media: [],
            projects: [],
            materials: [],
            journals: [],
            goals: []
        };
    }

    init() {
        this.loadData();
        this.render();
    }

    loadData() {
        this.data = StorageService.loadAll();
        
        // Restore Goal methods for objects loaded from localStorage
        this.data.goals.forEach(goal => {
            if (!goal.updateProgress) {
                Object.setPrototypeOf(goal, Goal.prototype);
            }
        });
        
        // Update goal progress based on current data
        this.data.goals = GoalTrackingService.updateGoalProgress(
            this.data.goals,
            this.data.books,
            this.data.media,
            this.data.projects
        );
        
        // Save updated goals
        StorageService.save(StorageService.KEYS.GOALS, this.data.goals);
    }

    render() {
        this.view.render(this.data);
    }

    refresh() {
        this.loadData();
        this.render();
    }
}
