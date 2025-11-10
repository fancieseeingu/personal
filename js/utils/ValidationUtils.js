// ValidationUtils - Input validation logic
export class ValidationUtils {
    static validateBookEntry(data) {
        const errors = [];

        if (!data.title || data.title.trim() === '') {
            errors.push('Title is required');
        }
        if (!data.author || data.author.trim() === '') {
            errors.push('Author is required');
        }
        if (!data.genre || data.genre.trim() === '') {
            errors.push('Genre is required');
        }

        return { valid: errors.length === 0, errors };
    }

    static validateMediaItem(data) {
        const errors = [];

        if (!data.title || data.title.trim() === '') {
            errors.push('Title is required');
        }
        if (!data.type || data.type.trim() === '') {
            errors.push('Type is required');
        }
        if (!data.originCountry || data.originCountry.trim() === '') {
            errors.push('Origin country is required');
        }

        return { valid: errors.length === 0, errors };
    }

    static validateCreativeProject(data) {
        const errors = [];

        if (!data.title || data.title.trim() === '') {
            errors.push('Title is required');
        }
        if (!data.type || data.type.trim() === '') {
            errors.push('Type is required');
        }
        if (!data.description || data.description.trim() === '') {
            errors.push('Description is required');
        }

        return { valid: errors.length === 0, errors };
    }

    static validateMaterial(data) {
        const errors = [];

        if (!data.name || data.name.trim() === '') {
            errors.push('Name is required');
        }
        if (!data.category || data.category.trim() === '') {
            errors.push('Category is required');
        }
        if (data.quantity === undefined || data.quantity === null || data.quantity < 0) {
            errors.push('Valid quantity is required');
        }
        if (!data.location || data.location.trim() === '') {
            errors.push('Location is required');
        }

        return { valid: errors.length === 0, errors };
    }

    static validateJournalEntry(data) {
        const errors = [];

        if (!data.title || data.title.trim() === '') {
            errors.push('Title is required');
        }
        if (!data.content || data.content.trim() === '') {
            errors.push('Content is required');
        }

        return { valid: errors.length === 0, errors };
    }

    static validateGoal(data) {
        const errors = [];

        if (!data.description || data.description.trim() === '') {
            errors.push('Description is required');
        }
        if (!data.category || data.category.trim() === '') {
            errors.push('Category is required');
        }
        if (!data.targetValue || data.targetValue <= 0) {
            errors.push('Valid target value is required');
        }
        if (!data.deadline) {
            errors.push('Deadline is required');
        }

        return { valid: errors.length === 0, errors };
    }

    static validateRating(rating) {
        return rating >= 1 && rating <= 5;
    }

    static validateImageSize(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
    }

    static validateImageType(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        return validTypes.includes(file.type);
    }
}
