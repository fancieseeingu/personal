// Make sure this file exports the class as a named export so app.js can import it with:
// import { MaterialController } from './controllers/MaterialController.js';
export class MaterialController {
  constructor(storageService, materialView) {
    this.storageService = storageService;
    this.view = materialView;
    this.materials = [];
    this.filteredMaterials = [];
    this.currentFilters = null;
  }

  init() {
    // use the passed storageService instance for keys/loads
    const saved = this.storageService.load(this.storageService.KEYS.MATERIALS) || [];

    // Reconstruct Material objects with methods (if you have a Material class available)
    this.materials = saved.map(data => {
      // If Material constructor or class isn't globally available, import or provide it.
      const material = new Material(
        data.id,
        data.name,
        data.category,
        data.quantity,
        data.location
      );
      // Restore all properties saved in storage (including quantityHistory, dateAdded, etc.)
      Object.assign(material, data);
      return material;
    });

    this.filteredMaterials = [...this.materials];
    this.view.render(this.filteredMaterials);
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.view.onAddMaterial((materialData) => this.addMaterial(materialData));
    this.view.onUpdateMaterial((id, updates) => this.updateMaterial(id, updates));
    this.view.onDeleteMaterial((id) => this.deleteMaterial(id));
    this.view.onUpdateQuantity((id, newQuantity) => this.updateQuantity(id, newQuantity));
    this.view.onEditClick((id) => {
      const material = this.materials.find(m => m.id === id);
      if (material) {
        this.view.showEditMaterialModal(material);
      }
    });
    this.view.onQuantityClick((id) => {
      const material = this.materials.find(m => m.id === id);
      if (material) {
        this.view.showUpdateQuantityModal(material);
      }
    });
    this.view.onFilterChange((filters) => this.filterMaterials(filters));
  }

  addMaterial(materialData) {
    const material = new Material(
      Date.now(),
      materialData.name,
      materialData.category,
      materialData.quantity,
      materialData.location
    );

    // initialize metadata if needed
    material.dateAdded = new Date().toISOString();
    material.quantityHistory = material.quantityHistory || [];

    this.materials.push(material);
    this.save();
    this.applyCurrentFilters();
  }

  updateMaterial(id, updates) {
    const material = this.materials.find(m => m.id === id);
    if (material) {
      // Update properties (but not quantity through this method)
      if (updates.name !== undefined) material.name = updates.name;
      if (updates.category !== undefined) material.category = updates.category;
      if (updates.location !== undefined) material.location = updates.location;

      this.save();
      this.applyCurrentFilters();
    }
  }

  deleteMaterial(id) {
    this.materials = this.materials.filter(m => m.id !== id);
    this.save();
    this.applyCurrentFilters();
  }

  updateQuantity(id, newQuantity) {
    const material = this.materials.find(m => m.id === id);
    if (material) {
      // Use the Material model's updateQuantity method which handles history and stock status
      if (typeof material.updateQuantity === 'function') {
        material.updateQuantity(newQuantity);
      } else {
        // fallback: update fields manually
        const prev = material.quantity ?? 0;
        material.quantityHistory = material.quantityHistory || [];
        material.quantityHistory.push({ previousQuantity: prev, quantity: newQuantity, date: new Date().toISOString() });
        material.quantity = newQuantity;
        // Optionally update stockStatus
        material.stockStatus = material.quantity > 0 ? 'in-stock' : 'out-of-stock';
      }

      this.save();
      this.applyCurrentFilters();
    }
  }

  filterMaterials(filters) {
    this.currentFilters = filters;
    this.applyCurrentFilters();
  }

  applyCurrentFilters() {
    let filtered = [...this.materials];

    if (this.currentFilters) {
      if (this.currentFilters.category) {
        filtered = filtered.filter(m => m.category === this.currentFilters.category);
      }
      if (this.currentFilters.stockStatus) {
        filtered = filtered.filter(m => m.stockStatus === this.currentFilters.stockStatus);
      }
    }

    this.filteredMaterials = filtered;
    this.view.render(this.filteredMaterials);
  }

  save() {
    this.storageService.save(this.storageService.KEYS.MATERIALS, this.materials);
  }

  getMaterials() {
    return this.materials;
  }
}