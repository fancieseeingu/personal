// BookEntry Model
export class BookEntry {
    constructor(id, title, author, genre, status) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.status = status; // 'to-read', 'reading', 'completed'
        this.rating = null;
        this.review = '';
        this.dateAdded = new Date().toISOString();
        this.dateStarted = null;
        this.dateCompleted = null;
        this.statusHistory = [];
    }

    updateStatus(newStatus) {
        this.statusHistory.push({
            status: newStatus,
            date: new Date().toISOString()
        });
        this.status = newStatus;

        if (newStatus === 'reading' && !this.dateStarted) {
            this.dateStarted = new Date().toISOString();
        }
        if (newStatus === 'completed' && !this.dateCompleted) {
            this.dateCompleted = new Date().toISOString();
        }
    }

    setRating(rating) {
        if (rating >= 1 && rating <= 5) {
            this.rating = rating;
        }
    }
}
