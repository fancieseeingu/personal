// StorageService - Handles all localStorage operations
export class StorageService {
    static KEYS = {
        BOOKS: 'hobby_hub_books',
        MEDIA: 'hobby_hub_media',
        PROJECTS: 'hobby_hub_projects',
        MATERIALS: 'hobby_hub_materials',
        JOURNALS: 'hobby_hub_journals',
        GOALS: 'hobby_hub_goals'
    };

    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return { success: true };
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded:', error);
                return { success: false, error: 'Storage limit exceeded. Please delete some entries or images.' };
            }
            console.error('Storage error:', error);
            return { success: false, error: error.message };
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return [];
        }
    }

    static saveAll(books, media, projects, materials, journals, goals) {
        const results = {
            books: this.save(this.KEYS.BOOKS, books),
            media: this.save(this.KEYS.MEDIA, media),
            projects: this.save(this.KEYS.PROJECTS, projects),
            materials: this.save(this.KEYS.MATERIALS, materials),
            journals: this.save(this.KEYS.JOURNALS, journals),
            goals: this.save(this.KEYS.GOALS, goals)
        };

        const allSuccess = Object.values(results).every(r => r.success);
        return { success: allSuccess, results };
    }

    static loadAll() {
        return {
            books: this.load(this.KEYS.BOOKS),
            media: this.load(this.KEYS.MEDIA),
            projects: this.load(this.KEYS.PROJECTS),
            materials: this.load(this.KEYS.MATERIALS),
            journals: this.load(this.KEYS.JOURNALS),
            goals: this.load(this.KEYS.GOALS)
        };
    }
}
