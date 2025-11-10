// CreativeProject Model
export class CreativeProject {
    constructor(id, title, type, description) {
        this.id = id;
        this.title = title;
        this.type = type; // 'drawing', 'crafting'
        this.description = description;
        this.status = 'planning'; // 'planning', 'in-progress', 'completed'
        this.images = [];
        this.estimatedTime = null;
        this.actualTime = null;
        this.dateCreated = new Date().toISOString();
        this.dateCompleted = null;
        this.linkedMaterials = [];
    }

    addImage(imageDataUrl) {
        this.images.push({
            id: Date.now(),
            dataUrl: imageDataUrl,
            dateAdded: new Date().toISOString()
        });
    }

    linkMaterial(materialId) {
        if (!this.linkedMaterials.includes(materialId)) {
            this.linkedMaterials.push(materialId);
        }
    }
}
