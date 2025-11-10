// JournalEntry Model
export class JournalEntry {
    constructor(id, title, content) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.date = new Date().toISOString();
        this.tags = [];
        this.linkedItems = []; // {type: 'book|media|project', id: itemId}
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }

    linkItem(type, itemId) {
        this.linkedItems.push({ type, id: itemId });
    }
}
