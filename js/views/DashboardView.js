// DashboardView - Renders the dashboard with stats, goals, and recent activity
import { DateUtils } from '../utils/DateUtils.js';

export class DashboardView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(data) {
        const stats = this.calculateStats(data);
        
        this.container.innerHTML = `
            <div class="dashboard">
                <h1>My Hobby Hub</h1>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Books</h3>
                        <p class="stat-number">${stats.booksCompleted}</p>
                        <p class="stat-label">Completed</p>
                    </div>
                    <div class="stat-card">
                        <h3>Media</h3>
                        <p class="stat-number">${stats.mediaCompleted}</p>
                        <p class="stat-label">Watched</p>
                    </div>
                    <div class="stat-card">
                        <h3>Projects</h3>
                        <p class="stat-number">${stats.projectsCompleted}</p>
                        <p class="stat-label">Finished</p>
                    </div>
                    <div class="stat-card">
                        <h3>Journal Entries</h3>
                        <p class="stat-number">${stats.journalCount}</p>
                        <p class="stat-label">Written</p>
                    </div>
                </div>
                
                <div class="goals-section">
                    <h2>Active Goals</h2>
                    ${this.renderGoals(data.goals)}
                </div>
                
                <div class="recent-activity">
                    <h2>Recent Activity</h2>
                    ${this.renderRecentActivity(data)}
                </div>
            </div>
        `;
    }

    calculateStats(data) {
        return {
            booksCompleted: data.books.filter(b => b.status === 'completed').length,
            mediaCompleted: data.media.filter(m => m.status === 'completed').length,
            projectsCompleted: data.projects.filter(p => p.status === 'completed').length,
            journalCount: data.journals.length
        };
    }

    renderGoals(goals) {
        const activeGoals = goals.filter(g => g.status === 'active');
        
        if (activeGoals.length === 0) {
            return '<p>No active goals. Create one to start tracking your progress!</p>';
        }

        return activeGoals.map(goal => `
            <div class="goal-card">
                <h4>${goal.description}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.getProgressPercentage()}%"></div>
                </div>
                <p>${goal.currentValue} / ${goal.targetValue}</p>
                <p class="deadline">Due: ${DateUtils.formatDate(goal.deadline)} (${DateUtils.getDaysUntil(goal.deadline)} days)</p>
            </div>
        `).join('');
    }

    renderRecentActivity(data) {
        const activities = [];

        // Collect recent books
        data.books.slice(0, 5).forEach(book => {
            activities.push({
                title: `Book: ${book.title}`,
                meta: `${book.status} - ${DateUtils.formatRelativeTime(book.dateAdded)}`,
                date: new Date(book.dateAdded)
            });
        });

        // Collect recent media
        data.media.slice(0, 5).forEach(item => {
            activities.push({
                title: `Media: ${item.title}`,
                meta: `${item.status} - ${DateUtils.formatRelativeTime(item.dateAdded)}`,
                date: new Date(item.dateAdded)
            });
        });

        // Collect recent projects
        data.projects.slice(0, 5).forEach(project => {
            activities.push({
                title: `Project: ${project.title}`,
                meta: `${project.status} - ${DateUtils.formatRelativeTime(project.dateCreated)}`,
                date: new Date(project.dateCreated)
            });
        });

        // Collect recent journals
        data.journals.slice(0, 5).forEach(journal => {
            activities.push({
                title: `Journal: ${journal.title}`,
                meta: DateUtils.formatRelativeTime(journal.date),
                date: new Date(journal.date)
            });
        });

        // Sort by date (most recent first) and take top 10
        activities.sort((a, b) => b.date - a.date);
        const recentActivities = activities.slice(0, 10);

        if (recentActivities.length === 0) {
            return '<div class="activity-list"><p>No recent activity. Start adding entries!</p></div>';
        }

        return `
            <div class="activity-list">
                ${recentActivities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-item-title">${activity.title}</div>
                        <div class="activity-item-meta">${activity.meta}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
