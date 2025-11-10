// GoalTrackingService - Automatically updates goal progress based on user activities
import { Goal } from '../models/Goal.js';

export class GoalTrackingService {
    static updateGoalProgress(goals, books, media, projects) {
        goals.forEach(goal => {
            // Restore Goal methods if loaded from localStorage
            if (!goal.updateProgress) {
                Object.setPrototypeOf(goal, Goal.prototype);
            }

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
        });

        return goals;
    }
}
