// Material Model
export class Material {
    constructor(id, name, category, quantity, location) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.location = location;
        this.stockStatus = 'in-stock'; // 'in-stock', 'low-stock', 'out-of-stock'
        this.quantityHistory = [];
        this.dateAdded = new Date().toISOString();
        this.updateStockStatus();
    }

    updateQuantity(newQuantity) {
        this.quantityHistory.push({
            quantity: newQuantity,
            previousQuantity: this.quantity,
            date: new Date().toISOString()
        });
        this.quantity = newQuantity;
        this.updateStockStatus();
    }

    updateStockStatus() {
        if (this.quantity === 0) {
            this.stockStatus = 'out-of-stock';
        } else if (this.quantity <= 5) {
            this.stockStatus = 'low-stock';
        } else {
            this.stockStatus = 'in-stock';
        }
    }
}
