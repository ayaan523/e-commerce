// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const Razorpay = require('razorpay');
require('dotenv').config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

// Parse the allowed admin emails from the .env file
const ALLOWED_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase());

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const createAdminToken = () => {
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(timestamp).digest('hex');
  return `${timestamp}.${signature}`;
};

const createUserToken = (userId) => {
  const timestamp = Date.now().toString();
  const value = `${userId}.${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET || '').update(value).digest('hex');
  return `${value}.${signature}`;
};

const requireAdmin = (req, res, next) => {
  if (!ADMIN_TOKEN_SECRET) return res.status(503).json({ message: 'Admin authentication is not configured' });
  const token = req.get('Authorization')?.replace('Bearer ', '');
  const [timestamp, signature] = token?.split('.') || [];
  const expected = timestamp && crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(timestamp).digest('hex');
  const valid = timestamp && signature && expected && safeEqual(signature, expected) && Date.now() - Number(timestamp) < 8 * 60 * 60 * 1000;
  if (!valid) return res.status(401).json({ message: 'Admin authentication required' });
  next();
};

const requireUser = (req, res, next) => {
  const token = req.get('Authorization')?.replace('Bearer ', '');
  const [userId, timestamp, signature] = token?.split('.') || [];
  const value = userId && timestamp && `${userId}.${timestamp}`;
  const expected = value && crypto.createHmac('sha256', ADMIN_TOKEN_SECRET || '').update(value).digest('hex');
  if (!ADMIN_TOKEN_SECRET || !value || !signature || !safeEqual(signature, expected) || Date.now() - Number(timestamp) >= 8 * 60 * 60 * 1000) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  req.userId = userId;
  next();
};

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
    const { email, password, street, address, city, state, country } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      defaultAddress: { street: street || address, city, state, country }
    });

    await newUser.save();
    res.status(201).json({ 
      message: "Account created successfully", 
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name,
        picture: newUser.picture,
        defaultAddress: newUser.defaultAddress,
        token: createUserToken(newUser._id)
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
        defaultAddress: user.defaultAddress,
        token: createUserToken(user._id)
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
    
    const { email, sub: googleId, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, googleId, name, picture });
      await user.save();
    } else {
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
        defaultAddress: user.defaultAddress,
        token: createUserToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Google authentication failed: " + error.message });
  }
});

// --- ADMIN AUTHENTICATION ROUTES ---

// Legacy passcode login
app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD || !ADMIN_TOKEN_SECRET) return res.status(503).json({ message: 'Admin authentication is not configured' });
  if (!safeEqual(req.body.password, ADMIN_PASSWORD)) {
    return res.status(401).json({ message: 'Invalid administrator credentials' });
  }
  res.json({ token: createAdminToken() });
});

// New Google SSO login for Admins
app.post('/api/admin/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const { email } = ticket.getPayload();

    // Check if the authenticated email is in our whitelist
    if (!ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
      console.warn(`Unauthorized admin access attempt by: ${email}`);
      return res.status(403).json({ message: "Unauthorized. This email does not have administrator privileges." });
    }

    // If they are on the list, grant the standard admin token
    res.json({ token: createAdminToken() });
  } catch (error) {
    res.status(500).json({ message: "Admin Google auth failed: " + error.message });
  }
});

// --- CLIENT PROFILE ROUTES ---

app.get('/api/orders/client/:email', requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email');
    if (!user || user.email !== req.params.email) return res.status(403).json({ message: 'Access denied' });
    const orders = await Order.find({ 'customer.email': user.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client orders" });
  }
});

app.put('/api/auth/profile', requireUser, async (req, res) => {
  try {
    const { defaultAddress } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId },
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

// --- RAZORPAY PAYMENT & ORDER PROCESSING ---

app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { cart } = req.body;
    
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const products = await Product.find({ _id: { $in: cart.map(item => item._id) }, status: 'IN_STOCK' });
    const productMap = new Map(products.map(product => [String(product._id), product]));
    
    let calculatedTotal = 0;
    cart.forEach(item => {
      const dbProduct = productMap.get(String(item._id));
      if (dbProduct) {
        calculatedTotal += dbProduct.price * (Number(item.quantity) || 1);
      }
    });
    
    calculatedTotal += 25; // Add flat shipping fee

    const options = {
      amount: Math.round(calculatedTotal * 100), 
      currency: "INR", 
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ razorpayOrder: order, calculatedTotal });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ message: "Failed to initialize payment", error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const { formData, cart, razorpayResponse } = req.body;

    if (!formData?.email || !formData.address || !formData.city || !formData.country || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Complete shipping details and cart items are required' });
    }

    // Verify Razorpay Signature
    const body = razorpayResponse.razorpay_order_id + "|" + razorpayResponse.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpayResponse.razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature. Transaction rejected.' });
    }

    const products = await Product.find({ _id: { $in: cart.map(item => item._id) } });
    const productMap = new Map(products.map(product => [String(product._id), product]));
    
    const orderItems = cart.map(item => {
      const product = productMap.get(String(item._id));
      const quantity = Number(item.quantity);
      return { productId: product._id, name: product.name, price: product.price, quantity };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 25;

    const newOrder = new Order({
      customer: { email: formData.email, address: formData.address, city: formData.city, country: formData.country },
      items: orderItems,
      totalAmount: total,
      status: 'PENDING'
    });
    
    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order processed securely', orderId: savedOrder._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to process order: " + error.message });
  }
});

// --- ADMIN PORTAL ROUTES ---

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
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

app.post('/api/admin/categories', requireAdmin, async (req, res) => {
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

app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
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

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
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

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
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