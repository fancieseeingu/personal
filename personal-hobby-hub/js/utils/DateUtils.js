// DateUtils - Date formatting and comparison helper methods
export class DateUtils {
    static formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatDateTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatRelativeTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    static isDateInRange(dateString, startDate, endDate) {
        const date = new Date(dateString);
        return date >= startDate && date <= endDate;
    }

    static sortByDate(items, dateField = 'dateAdded', ascending = false) {
        return items.sort((a, b) => {
            const dateA = new Date(a[dateField]);
            const dateB = new Date(b[dateField]);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    static getDaysUntil(dateString) {
        const targetDate = new Date(dateString);
        const now = new Date();
        const diffMs = targetDate - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    static isOverdue(dateString) {
        return new Date(dateString) < new Date();
    }
}
