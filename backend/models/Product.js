const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true },
  images: [{ type: String }], // Stores base64 strings or URLs
  status: { type: String, enum: ['IN_STOCK', 'OUT_OF_STOCK', 'UPCOMING'], default: 'IN_STOCK' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);