// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxury_ecommerce';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Database Connected Successfully! 🗄️'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// --- CLIENT AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, street, city, state, country } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      defaultAddress: { street, city, state, country }
    });

    await newUser.save();
    res.status(201).json({ 
      message: "Account created successfully", 
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name,
        picture: newUser.picture,
        defaultAddress: newUser.defaultAddress 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed: " + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    res.json({ 
      message: "Login successful", 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        picture: user.picture,
        defaultAddress: user.defaultAddress 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed: " + error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    // Google provides name and picture in the payload
    const { email, sub: googleId, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      // New client via Google
      user = new User({ email, googleId, name, picture });
      await user.save();
    } else {
      // Sync existing client with latest Google profile data
      user.googleId = googleId;
      if (name) user.name = name;
      if (picture) user.picture = picture;
      await user.save();
    }

    res.json({
      message: "Google login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        defaultAddress: user.defaultAddress
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Google authentication failed: " + error.message });
  }
});

// --- CLIENT PROFILE ROUTES ---

app.get('/api/orders/client/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client orders" });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const { email, defaultAddress } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { defaultAddress } },
      { new: true } 
    );
    
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ 
      message: 'Profile destination updated', 
      user: { 
        id: updatedUser._id, 
        email: updatedUser.email, 
        name: updatedUser.name,
        picture: updatedUser.picture,
        defaultAddress: updatedUser.defaultAddress 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile: " + error.message });
  }
});

// --- PUBLIC STOREFRONT ROUTES ---

app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'All' && category !== 'ALL') {
      filter = { category: { $regex: new RegExp(`^${category}$`, 'i') } };
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
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
      customer: { email: formData.email, address: formData.address, city: formData.city, country: formData.country },
      items: orderItems,
      totalAmount: total,
      status: 'PENDING'
    });
    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order processed successfully', orderId: savedOrder._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to process order: " + error.message });
  }
});

// --- ADMIN PORTAL ROUTES ---

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }) || [];
    let totalRevenue = 0;
    const productSalesMap = {};

    orders.forEach(order => {
      totalRevenue += order.totalAmount || 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!productSalesMap[item.name]) {
            productSalesMap[item.name] = { name: item.name, unitsSold: 0, revenueGenerated: 0 };
          }
          productSalesMap[item.name].unitsSold += (item.quantity || 1);
          productSalesMap[item.name].revenueGenerated += (item.price || 0) * (item.quantity || 1);
        });
      }
    });
    res.json({ totalOrders: orders.length, totalRevenue, recentOrders: orders.slice(0, 5), productBreakdown: Object.values(productSalesMap) });
  } catch (error) {
    res.status(500).json({ message: "Error compiling atelier metrics: " + error.message });
  }
});

app.post('/api/admin/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });
    
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const newCategory = new Category({ name: name.trim() });
    await newCategory.save();
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to create category: " + error.message });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(500).json({ message: "Database not connected" });
    const { name, price, originalPrice, description, category, images, status } = req.body;
    
    const newProduct = new Product({
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description,
      category: category || "General",
      images: images ? (Array.isArray(images) ? images : [images]) : ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2"],
      status: status || "IN_STOCK"
    });
    const savedProduct = await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: savedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product: " + error.message });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { name, price, originalPrice, description, category, images, status } = req.body;
    
    const updateData = {
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description,
      category: category || "General",
      status: status || "IN_STOCK"
    };

    if (images && images.length > 0 && images[0] !== '') {
      updateData.images = Array.isArray(images) ? images : [images];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { returnDocument: 'after' }
    );
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product: " + error.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: { status: status || 'DISPATCHED' } }, 
      { returnDocument: 'after' }
    );
    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is live on http://127.0.0.1:${PORT} 🚀`);
});