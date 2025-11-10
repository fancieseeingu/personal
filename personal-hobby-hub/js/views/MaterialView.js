export class MaterialView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.callbacks = {};
  }

  render(materials = []) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="materials-header">
        <h2>Materials Inventory</h2>
        <button id="add-material-btn" class="btn btn-primary">Add Material</button>
      </div>
      <div class="materials-filters">
        <select id="category-filter">
          <option value="">All Categories</option>
          <option value="paint">Paint</option>
          <option value="paper">Paper</option>
          <option value="fabric">Fabric</option>
          <option value="yarn">Yarn</option>
          <option value="beads">Beads</option>
          <option value="tools">Tools</option>
          <option value="other">Other</option>
        </select>
        <select id="stock-filter">
          <option value="">All Stock Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>
      <div class="materials-list">
        ${materials.length > 0 
          ? materials.map(material => this.renderMaterialCard(material)).join('') 
          : '<p class="empty-state">No materials yet. Add your first material to get started!</p>'}
      </div>
    `;

    this.attachDOMListeners();
  }

  renderMaterialCard(material) {
    const stockStatus = material.stockStatus || '';
    const stockStatusClass = stockStatus ? stockStatus.replace(/-/g, '_') : '';
    const stockStatusLabel = stockStatus
      ? stockStatus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Unknown';

    const dateAdded = material.dateAdded ? new Date(material.dateAdded).toLocaleDateString() : '';

    return `
      <div class="material-card" data-id="${material.id}">
        <div class="material-header">
          <h3>${material.name || ''}</h3>
          <span class="stock-badge ${stockStatusClass}">${stockStatusLabel}</span>
        </div>
        <div class="material-details">
          <p class="category"><strong>Category:</strong> ${material.category || ''}</p>
          <p class="quantity"><strong>Quantity:</strong> ${material.quantity ?? 0}</p>
          <p class="location"><strong>Location:</strong> ${material.location || ''}</p>
          <p class="date-added"><strong>Added:</strong> ${dateAdded}</p>
        </div>
        <div class="material-actions">
          <button class="btn-edit btn" data-id="${material.id}">Edit</button>
          <button class="btn-quantity btn" data-id="${material.id}">Update Quantity</button>
          <button class="btn-delete btn" data-id="${material.id}">Delete</button>
        </div>
      </div>
    `;
  }

  // show add modal (modal uses modal.querySelector to scope fields)
  showAddMaterialModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Material</h3>
          <button class="modal-close">&times;</button>
        </div>
        <form id="material-form">
          <div class="form-group">
            <label for="material-name">Name *</label>
            <input type="text" id="material-name" required>
          </div>
          <div class="form-group">
            <label for="material-category">Category *</label>
            <select id="material-category" required>
              <option value="">Select category</option>
              <option value="paint">Paint</option>
              <option value="paper">Paper</option>
              <option value="fabric">Fabric</option>
              <option value="yarn">Yarn</option>
              <option value="beads">Beads</option>
              <option value="tools">Tools</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="material-quantity">Quantity *</label>
            <input type="number" id="material-quantity" min="0" required>
          </div>
          <div class="form-group">
            <label for="material-location">Location *</label>
            <input type="text" id="material-location" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary modal-cancel">Cancel</button>
            <button type="submit" class="btn-primary">Add Material</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');

    const form = modal.querySelector('#material-form');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const materialData = {
        name: modal.querySelector('#material-name').value,
        category: modal.querySelector('#material-category').value,
        quantity: parseInt(modal.querySelector('#material-quantity').value, 10) || 0,
        location: modal.querySelector('#material-location').value,
        dateAdded: new Date().toISOString(),
        quantityHistory: []
      };
      if (this.callbacks.onAddMaterial) this.callbacks.onAddMaterial(materialData);
      closeModal();
    });
  }

  showEditMaterialModal(material) {
    if (!material) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Material</h3>
          <button class="modal-close">&times;</button>
        </div>
        <form id="material-form">
          <div class="form-group">
            <label for="material-name">Name *</label>
            <input type="text" id="material-name" value="${material.name || ''}" required>
          </div>
          <div class="form-group">
            <label for="material-category">Category *</label>
            <select id="material-category" required>
              <option value="">Select category</option>
              <option value="paint" ${material.category === 'paint' ? 'selected' : ''}>Paint</option>
              <option value="paper" ${material.category === 'paper' ? 'selected' : ''}>Paper</option>
              <option value="fabric" ${material.category === 'fabric' ? 'selected' : ''}>Fabric</option>
              <option value="yarn" ${material.category === 'yarn' ? 'selected' : ''}>Yarn</option>
              <option value="beads" ${material.category === 'beads' ? 'selected' : ''}>Beads</option>
              <option value="tools" ${material.category === 'tools' ? 'selected' : ''}>Tools</option>
              <option value="other" ${material.category === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="material-location">Location *</label>
            <input type="text" id="material-location" value="${material.location || ''}" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary modal-cancel">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');

    const form = modal.querySelector('#material-form');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updates = {
        name: modal.querySelector('#material-name').value,
        category: modal.querySelector('#material-category').value,
        location: modal.querySelector('#material-location').value
      };
      if (this.callbacks.onUpdateMaterial) this.callbacks.onUpdateMaterial(material.id, updates);
      closeModal();
    });
  }

  showUpdateQuantityModal(material) {
    if (!material) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Update Quantity: ${material.name}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <form id="quantity-form">
          <div class="form-group">
            <label>Current Quantity: <strong>${material.quantity ?? 0}</strong></label>
          </div>
          <div class="form-group">
            <label for="new-quantity">New Quantity *</label>
            <input type="number" id="new-quantity" min="0" value="${material.quantity ?? 0}" required>
          </div>
          ${Array.isArray(material.quantityHistory) && material.quantityHistory.length > 0 ? `
            <div class="quantity-history">
              <h4>Recent Changes</h4>
              <ul>
                ${material.quantityHistory.slice(-5).reverse().map(entry => `
                  <li>
                    ${entry.previousQuantity} → ${entry.quantity} 
                    <span class="date">(${new Date(entry.date).toLocaleDateString()})</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="form-actions">
            <button type="button" class="btn-secondary modal-cancel">Cancel</button>
            <button type="submit" class="btn-primary">Update</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');

    const form = modal.querySelector('#quantity-form');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newQuantity = parseInt(modal.querySelector('#new-quantity').value, 10) || 0;
      if (this.callbacks.onUpdateQuantity) this.callbacks.onUpdateQuantity(material.id, newQuantity);
      closeModal();
    });
  }

  attachDOMListeners() {
    if (!this.container) return;

    // Add button
    const addBtn = this.container.querySelector('#add-material-btn');
    if (addBtn) {
      addBtn.removeEventListener?.('click', this._addHandler);
      this._addHandler = () => this.showAddMaterialModal();
      addBtn.addEventListener('click', this._addHandler);
    }

    // Filters
    const categoryFilter = this.container.querySelector('#category-filter');
    const stockFilter = this.container.querySelector('#stock-filter');

    if (categoryFilter) {
      categoryFilter.removeEventListener?.('change', this._filterChangeHandler);
      this._filterChangeHandler = (e) => {
        if (this.callbacks.onFilterChange) {
          this.callbacks.onFilterChange({
            category: e.target.value,
            stockStatus: stockFilter?.value || ''
          });
        }
      };
      categoryFilter.addEventListener('change', this._filterChangeHandler);
    }

    if (stockFilter) {
      stockFilter.removeEventListener?.('change', this._filterChangeHandler);
      stockFilter.addEventListener('change', this._filterChangeHandler);
    }

    // Delegated click handler for items inside the container
    if (this._delegateHandler) this.container.removeEventListener('click', this._delegateHandler);

    this._delegateHandler = (e) => {
      const btn = e.target.closest && e.target.closest('button');
      const card = e.target.closest && e.target.closest('.material-card');

      if (btn) {
        if (btn.classList.contains('btn-edit')) {
          const id = Number(btn.dataset.id);
          if (this.callbacks.onEditClick) this.callbacks.onEditClick(id);
          return;
        }
        if (btn.classList.contains('btn-quantity')) {
          const id = Number(btn.dataset.id);
          if (this.callbacks.onQuantityClick) this.callbacks.onQuantityClick(id);
          return;
        }
        if (btn.classList.contains('btn-delete')) {
          const id = Number(btn.dataset.id);
          if (confirm('Are you sure you want to delete this material?')) {
            if (this.callbacks.onDeleteMaterial) this.callbacks.onDeleteMaterial(id);
          }
          return;
        }
      }
    };

    this.container.addEventListener('click', this._delegateHandler);
  }

  // callback setters
  onAddMaterial(callback) { this.callbacks.onAddMaterial = callback; }
  onUpdateMaterial(callback) { this.callbacks.onUpdateMaterial = callback; }
  onDeleteMaterial(callback) { this.callbacks.onDeleteMaterial = callback; }
  onUpdateQuantity(callback) { this.callbacks.onUpdateQuantity = callback; }
  onEditClick(callback) { this.callbacks.onEditClick = callback; } // controller should fetch material and call showEditMaterialModal
  onQuantityClick(callback) { this.callbacks.onQuantityClick = callback; } // controller should fetch material and call showUpdateQuantityModal
  onFilterChange(callback) { this.callbacks.onFilterChange = callback; }
}