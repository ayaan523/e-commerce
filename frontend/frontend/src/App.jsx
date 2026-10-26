import React, { useState, useEffect } from 'react';
import './App.css'; 
import Hero3D from './components/Hero3D';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';

const FALLBACK_PRODUCTS = [
  {
    _id: "mock-1",
    name: "Cult Classics",
    price: 149.99,
    description: "Heavyweight French terry cotton with metallic accents and structured drape.",
    category: "Hoodies",
    images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2"],
    status: "IN_STOCK"
  },
  {
    _id: "mock-2",
    name: "Sharp Looks",
    price: 289.50,
    description: "Weather-resistant technical shell engineered with modular utility pockets.",
    category: "Outerwear",
    images: ["https://images.unsplash.com/photo-1548883354-7622d03aca27"],
    status: "IN_STOCK"
  },
  {
    _id: "mock-3",
    name: "Culture Code",
    price: 210.00,
    description: "Ultra-soft grade-A Mongolian cashmere tailored with an asymmetric silhouette.",
    category: "Knitwear",
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80"],
    status: "COMING_SOON"
  }
];

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const categories = ['All', 'Hoodies', 'Outerwear', 'Knitwear'];

  useEffect(() => {
    const fetchInventory = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch('http://localhost:5000/api/products', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        setProducts(data.length === 0 ? FALLBACK_PRODUCTS : data);
      } catch (error) {
        console.error("Backend offline or timed out:", error);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const uniqueId = `${product._id}-${product.selectedSize || 'M'}`;
      const existing = prevCart.find(item => item.cartId === uniqueId);
      if (existing) {
        return prevCart.map(item => item.cartId === uniqueId ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
      }
      return [...prevCart, { ...product, cartId: uniqueId, quantity: 1, selectedSize: product.selectedSize || 'M' }];
    });
    setToastMessage(`${product.name} Added`);
    setIsToastVisible(true);
  };

  const handleCheckoutOpen = () => {
    setIsCartOpen(false); 
    setIsCheckoutOpen(true); 
  };

  return (
    <div>
      <nav className="navbar">
        <h1 className="logo">AURA</h1>
        <button onClick={() => setIsCartOpen(true)} className="nav-btn">
          Bag ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
        </button>
      </nav>

      <header className="hero-header">
        <Hero3D />
        <div className="hero-text-container">
          <p className="hero-subtitle">The New Standard</p>
          <h2 className="hero-title">REDEFINE <br/><span>REALITY</span></h2>
        </div>
      </header>

      <main className="shop-main">
        <div className="shop-header">
          <div className="filter-container">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {isLoading ? (
            <div className="loading-spinner">Connecting to Database...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} onClick={() => setSelectedProduct(product)}>
                <ProductCard product={product} onAddToCart={(e) => { e.stopPropagation(); handleAddToCart(product); }} />
              </div>
            ))
          ) : (
            <div className="loading-spinner">Inventory Empty.</div>
          )}
        </div>
      </main>

      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} setCart={setCart} onCheckout={handleCheckoutOpen} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} onOrderSuccess={() => { setCart([]); setToastMessage("Order Processed"); setIsToastVisible(true); }} />
      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}

export default App;