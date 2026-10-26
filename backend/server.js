const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Strict MongoDB Connection Options
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxury_ecommerce';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Database Connected Successfully! 🗄️'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Ensure mongoose is connected (readyState 1 = connected)
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const { formData, cart, total } = req.body;

    const orderItems = cart.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1
    }));

    const newOrder = new Order({
      customer: {
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country
      },
      items: orderItems,
      totalAmount: total
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order processed successfully', orderId: savedOrder._id });

  } catch (error) {
    console.error("Order processing error:", error);
    res.status(500).json({ message: "Failed to process order: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is live on http://127.0.0.1:${PORT} 🚀`);
});