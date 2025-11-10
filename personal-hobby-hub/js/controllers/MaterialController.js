class MaterialController {
  constructor(storageService, materialView) {
    this.storageService = storageService;
    this.view = materialView;
    this.materials = [];
    this.filteredMaterials = [];
  }

  init() {
    this.materials = this.storageService.load(StorageService.KEYS.MATERIALS);
    
    // Reconstruct Material objects with methods
    this.materials = this.materials.map(data => {
      const material = new Material(
        data.id,
        data.name,
        data.category,
        data.quantity,
        data.location
      );
      // Restore all properties
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
      material.updateQuantity(newQuantity);
      
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
    this.storageService.save(StorageService.KEYS.MATERIALS, this.materials);
  }

  getMaterials() {
    return this.materials;
  }
}
