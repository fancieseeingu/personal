// GoalView - Renders the goals section
import { DateUtils } from '../utils/DateUtils.js';

export class GoalView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.callbacks = {};
    }

    render(goals) {
        this.container.innerHTML = `
            <div class="goals-header">
                <h2>My Goals</h2>
                <button id="add-goal-btn" class="btn btn-primary">Add Goal</button>
            </div>
            <div class="goals-filters">
                <select id="category-filter" class="form-select">
                    <option value="">All Categories</option>
                    <option value="reading">Reading</option>
                    <option value="media">Media Watching</option>
                    <option value="creative">Creative Projects</option>
                </select>
                <select id="status-filter-goal" class="form-select">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                </select>
            </div>
            <div class="goals-grid">
                ${goals.length > 0 ? goals.map(goal => this.renderGoalCard(goal)).join('') : '<p>No goals yet. Set your first goal!</p>'}
            </div>
        `;

        this.attachDOMListeners();
    }

    renderGoalCard(goal) {
        const progressPercentage = goal.getProgressPercentage();
        const formattedDeadline = DateUtils.formatDate(goal.deadline);
        const categoryIcon = this.getCategoryIcon(goal.category);
        const daysRemaining = this.getDaysRemaining(goal.deadline);
        
        return `
            <div class="goal-card ${goal.status}" data-id="${goal.id}">
                <div class="goal-header">
                    <span class="category-icon">${categoryIcon}</span>
                    <div class="status-badge ${goal.status}">${goal.status}</div>
                </div>
                <h3>${goal.description}</h3>
                <p class="goal-category">${this.formatCategory(goal.category)}</p>
                <div class="goal-progress">
                    ${this.renderProgressBar(progressPercentage)}
                    <p class="progress-text">${goal.currentValue} / ${goal.targetValue} completed</p>
                </div>
                <div class="goal-deadline">
                    <span class="deadline-label">Deadline:</span>
                    <span class="deadline-date">${formattedDeadline}</span>
                    ${goal.status === 'active' ? `<span class="days-remaining ${daysRemaining < 7 ? 'urgent' : ''}">(${daysRemaining} days left)</span>` : ''}
                </div>
                <div class="goal-actions">
                    <button class="btn btn-edit" data-id="${goal.id}">Edit</button>
                    <button class="btn btn-delete" data-id="${goal.id}">Delete</button>
                </div>
            </div>
        `;
    }

    renderProgressBar(percentage) {
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
                <span class="progress-percentage">${Math.round(percentage)}%</span>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            'reading': '📚',
            'media': '🎬',
            'creative': '🎨'
        };
        return icons[category] || '🎯';
    }

    formatCategory(category) {
        const labels = {
            'reading': 'Reading',
            'media': 'Media Watching',
            'creative': 'Creative Projects'
        };
        return labels[category] || category;
    }

    getDaysRemaining(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    attachDOMListeners() {
        const addBtn = document.getElementById('add-goal-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddGoalModal());
        }

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.showEditGoalModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this goal?')) {
                    if (this.callbacks.onDeleteGoal) {
                        this.callbacks.onDeleteGoal(id);
                    }
                }
            });
        });

        const categoryFilter = document.getElementById('category-filter');
        const statusFilter = document.getElementById('status-filter-goal');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.handleFilterChange());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.handleFilterChange());
        }
    }

    handleFilterChange() {
        const filters = {
            category: document.getElementById('category-filter')?.value || '',
            status: document.getElementById('status-filter-goal')?.value || ''
        };

        if (this.callbacks.onFilterChange) {
            this.callbacks.onFilterChange(filters);
        }
    }

    showAddGoalModal() {
        const modal = this.createGoalModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
        this.setupModalHandlers(modal);
    }

    showEditGoalModal(id) {
        if (this.callbacks.onGetGoal) {
            const goal = this.callbacks.onGetGoal(id);
            if (goal) {
                const modal = this.createGoalModal(goal);
                document.body.appendChild(modal);
                modal.classList.add('active');
                this.setupModalHandlers(modal, goal);
            }
        }
    }

    createGoalModal(goal = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Format deadline for input (YYYY-MM-DD)
        const deadlineValue = goal ? goal.deadline.split('T')[0] : '';

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${goal ? 'Edit Goal' : 'Add Goal'}</h2>
                <form id="goal-form">
                    <div class="form-group">
                        <label class="form-label">Description *</label>
                        <input type="text" name="description" class="form-input" value="${goal?.description || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category *</label>
                        <select name="category" class="form-select" required>
                            <option value="reading" ${goal?.category === 'reading' ? 'selected' : ''}>Reading</option>
                            <option value="media" ${goal?.category === 'media' ? 'selected' : ''}>Media Watching</option>
                            <option value="creative" ${goal?.category === 'creative' ? 'selected' : ''}>Creative Projects</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Target Value *</label>
                        <input type="number" name="targetValue" class="form-input" value="${goal?.targetValue || ''}" min="1" required>
                        <small>Number of items to complete</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Deadline *</label>
                        <input type="date" name="deadline" class="form-input" value="${deadlineValue}" required>
                    </div>
                    ${goal ? `
                        <div class="form-group">
                            <label class="form-label">Current Progress</label>
                            <input type="number" name="currentValue" class="form-input" value="${goal.currentValue}" min="0" max="${goal.targetValue}">
                            <small>Current: ${goal.currentValue} / ${goal.targetValue}</small>
                        </div>
                    ` : ''}
                    <button type="submit" class="btn btn-primary">${goal ? 'Update' : 'Add'} Goal</button>
                </form>
            </div>
        `;
        return modal;
    }

    setupModalHandlers(modal, goal = null) {
        const closeBtn = modal.querySelector('.close');
        const form = modal.querySelector('#goal-form');

        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const goalData = {
                description: formData.get('description'),
                category: formData.get('category'),
                targetValue: parseInt(formData.get('targetValue')),
                deadline: new Date(formData.get('deadline')).toISOString()
            };

            if (goal) {
                // Include current value for updates
                const currentValue = formData.get('currentValue');
                if (currentValue !== null) {
                    goalData.currentValue = parseInt(currentValue);
                }
                
                if (this.callbacks.onUpdateGoal) {
                    this.callbacks.onUpdateGoal(goal.id, goalData);
                }
            } else {
                if (this.callbacks.onAddGoal) {
                    this.callbacks.onAddGoal(goalData);
                }
            }
            modal.remove();
        });
    }

    onAddGoal(callback) {
        this.callbacks.onAddGoal = callback;
    }

    onUpdateGoal(callback) {
        this.callbacks.onUpdateGoal = callback;
    }

    onDeleteGoal(callback) {
        this.callbacks.onDeleteGoal = callback;
    }

    onFilterChange(callback) {
        this.callbacks.onFilterChange = callback;
    }

    onGetGoal(callback) {
        this.callbacks.onGetGoal = callback;
    }
}
