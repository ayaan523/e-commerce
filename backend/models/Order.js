const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  items: [
    {
      productId: { type: String },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);