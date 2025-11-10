// Goal Model
export class Goal {
    constructor(id, description, category, targetValue, deadline) {
        this.id = id;
        this.description = description;
        this.category = category; // 'reading', 'media', 'creative'
        this.targetValue = targetValue;
        this.currentValue = 0;
        this.deadline = deadline;
        this.status = 'active'; // 'active', 'completed', 'expired'
        this.dateCreated = new Date().toISOString();
    }

    updateProgress(currentValue) {
        this.currentValue = currentValue;
        if (this.currentValue >= this.targetValue) {
            this.status = 'completed';
        }
    }

    getProgressPercentage() {
        return Math.min((this.currentValue / this.targetValue) * 100, 100);
    }

    checkExpiration() {
        if (new Date() > new Date(this.deadline) && this.status === 'active') {
            this.status = 'expired';
        }
    }
}
