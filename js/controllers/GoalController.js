// GoalController - Handles goal CRUD operations and progress tracking
import { GoalView } from '../views/GoalView.js';
import { Goal } from '../models/Goal.js';
import { StorageService } from '../services/StorageService.js';
import { GoalTrackingService } from '../services/GoalTrackingService.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';

export class GoalController {
    constructor() {
        this.view = new GoalView('goals-section');
        this.goals = [];
        this.filteredGoals = [];
        this.currentFilters = null;
    }

    init() {
        this.goals = StorageService.load(StorageService.KEYS.GOALS);
        
        // Restore Goal methods for objects loaded from localStorage
        this.goals.forEach(goal => {
            if (!goal.updateProgress) {
                Object.setPrototypeOf(goal, Goal.prototype);
            }
        });
        
        // Update goal progress based on current activities
        this.updateAllGoalProgress();
        
        this.filteredGoals = [...this.goals];
        this.attachEventListeners();
        this.view.render(this.filteredGoals);
    }

    attachEventListeners() {
        this.view.onAddGoal((goalData) => this.addGoal(goalData));
        this.view.onUpdateGoal((id, updates) => this.updateGoal(id, updates));
        this.view.onDeleteGoal((id) => this.deleteGoal(id));
        this.view.onFilterChange((filters) => this.filterGoals(filters));
        this.view.onGetGoal((id) => this.getGoal(id));
    }

    addGoal(goalData) {
        const validation = ValidationUtils.validateGoal(goalData);
        if (!validation.valid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return;
        }

        const goal = new Goal(
            Date.now(),
            goalData.description,
            goalData.category,
            goalData.targetValue,
            goalData.deadline
        );

        // Initialize progress based on current activities
        this.updateGoalProgress(goal);

        this.goals.push(goal);
        this.save();
        this.filteredGoals = this.applyCurrentFilters();
        this.view.render(this.filteredGoals);
    }

    updateGoal(id, updates) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            // Update basic fields
            if (updates.description) goal.description = updates.description;
            if (updates.category) goal.category = updates.category;
            if (updates.targetValue) goal.targetValue = updates.targetValue;
            if (updates.deadline) goal.deadline = updates.deadline;
            
            // Update current value if provided
            if (updates.currentValue !== undefined) {
                goal.updateProgress(updates.currentValue);
            }

            // Check expiration
            goal.checkExpiration();

            this.save();
            this.filteredGoals = this.applyCurrentFilters();
            this.view.render(this.filteredGoals);
        }
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.save();
        this.filteredGoals = this.applyCurrentFilters();
        this.view.render(this.filteredGoals);
    }

    filterGoals(filters) {
        this.currentFilters = filters;
        this.filteredGoals = this.applyCurrentFilters();
        this.view.render(this.filteredGoals);
    }

    applyCurrentFilters() {
        let filtered = [...this.goals];

        if (this.currentFilters) {
            if (this.currentFilters.category) {
                filtered = filtered.filter(g => g.category === this.currentFilters.category);
            }
            if (this.currentFilters.status) {
                filtered = filtered.filter(g => g.status === this.currentFilters.status);
            }
        }

        return filtered;
    }

    getGoal(id) {
        return this.goals.find(g => g.id === id);
    }

    // Update progress for all goals based on current activities
    updateAllGoalProgress() {
        const books = StorageService.load(StorageService.KEYS.BOOKS);
        const media = StorageService.load(StorageService.KEYS.MEDIA);
        const projects = StorageService.load(StorageService.KEYS.PROJECTS);

        this.goals = GoalTrackingService.updateGoalProgress(
            this.goals,
            books,
            media,
            projects
        );

        this.save();
    }

    // Update progress for a specific goal
    updateGoalProgress(goal) {
        const books = StorageService.load(StorageService.KEYS.BOOKS);
        const media = StorageService.load(StorageService.KEYS.MEDIA);
        const projects = StorageService.load(StorageService.KEYS.PROJECTS);

        switch (goal.category) {
            case 'reading':
                goal.updateProgress(
                    books.filter(b => b.status === 'completed').length
                );
                break;
            case 'media':
                goal.updateProgress(
                    media.filter(m => m.status === 'completed').length
                );
                break;
            case 'creative':
                goal.updateProgress(
                    projects.filter(p => p.status === 'completed').length
                );
                break;
        }
        goal.checkExpiration();
    }

    save() {
        const result = StorageService.save(StorageService.KEYS.GOALS, this.goals);
        if (!result.success) {
            alert('Error saving goals: ' + result.error);
        }
    }

    refresh() {
        this.goals = StorageService.load(StorageService.KEYS.GOALS);
        this.updateAllGoalProgress();
        this.filteredGoals = this.applyCurrentFilters();
        this.view.render(this.filteredGoals);
    }
}
