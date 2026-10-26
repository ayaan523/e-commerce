const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Pulling in your DB model

// GET all products from MongoDB
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST a new product to MongoDB (for future admin use)
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
});

module.exports = router;