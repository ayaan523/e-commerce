const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const initialProducts = [
  {
    name: "Cult Classics",
    price: 149.99,
    description: "Heavyweight French terry cotton with metallic accents and structured drape.",
    category: "Hoodies",
    images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2"],
    status: "IN_STOCK"
  },
  {
    name: "Sharp Looks",
    price: 289.50,
    description: "Weather-resistant technical shell engineered with modular utility pockets.",
    category: "Outerwear",
    images: ["https://images.unsplash.com/photo-1548883354-7622d03aca27"],
    status: "IN_STOCK"
  },
  {
    name: "Culture Code",
    price: 210.00,
    description: "Ultra-soft grade-A Mongolian cashmere tailored with an asymmetric silhouette.",
    category: "Knitwear",
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80"],
    status: "COMING_SOON"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/luxury_ecommerce');
    console.log('Database Connected for Seeding... 🗄️');

    await Product.deleteMany({});
    console.log('Existing products cleared.');

    await Product.insertMany(initialProducts);
    console.log('Database seeded with luxury inventory successfully! ✨');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();