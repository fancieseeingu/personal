// SearchService - Provides unified search across all entry types
export class SearchService {
    static search(query, data) {
        const results = {
            books: [],
            media: [],
            projects: [],
            materials: [],
            journals: [],
            goals: []
        };

        const lowerQuery = query.toLowerCase();

        // Search books
        results.books = data.books.filter(book =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            (book.review && book.review.toLowerCase().includes(lowerQuery))
        );

        // Search media
        results.media = data.media.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            (item.review && item.review.toLowerCase().includes(lowerQuery))
        );

        // Search projects
        results.projects = data.projects.filter(project =>
            project.title.toLowerCase().includes(lowerQuery) ||
            project.description.toLowerCase().includes(lowerQuery)
        );

        // Search materials
        results.materials = data.materials.filter(material =>
            material.name.toLowerCase().includes(lowerQuery) ||
            material.category.toLowerCase().includes(lowerQuery) ||
            material.location.toLowerCase().includes(lowerQuery)
        );

        // Search journals
        results.journals = data.journals.filter(journal =>
            journal.title.toLowerCase().includes(lowerQuery) ||
            journal.content.toLowerCase().includes(lowerQuery) ||
            (journal.tags && journal.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );

        // Search goals
        results.goals = data.goals.filter(goal =>
            goal.description.toLowerCase().includes(lowerQuery) ||
            goal.category.toLowerCase().includes(lowerQuery)
        );

        return results;
    }

    static filterByDateRange(items, startDate, endDate) {
        return items.filter(item => {
            const itemDate = new Date(item.dateAdded || item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    static filterByTags(items, tags) {
        return items.filter(item =>
            item.tags && tags.some(tag => item.tags.includes(tag))
        );
    }
}
