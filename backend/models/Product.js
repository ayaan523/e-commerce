const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String, required: true }],
  model3D: { type: String },
  stockCount: { type: Number, default: 0 },
  status: { type: String, default: 'IN_STOCK' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
