// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; 
import Hero3D from './components/Hero3D';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AuthModal from './components/AuthModal';
import ClientProfile from './components/ClientProfile';
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
  }
];

function App() {
  const [isAdminPortal, setIsAdminPortal] = useState(window.location.search.includes('admin=true'));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('aura_user')) || null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const dynamicCategories = ['All', ...Array.from(new Set([
    ...categories.map(c => c.name),
    ...products.map(p => p.category)
  ].filter(Boolean)))];

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminPortal(window.location.search.includes('admin=true'));
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    if (isAdminPortal) return;

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/api/products'),
          fetch('http://127.0.0.1:5000/api/categories')
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.length > 0 ? prodData : FALLBACK_PRODUCTS);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (error) {
        console.error("Backend offline:", error);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAdminPortal]);

  const handleProductDeleted = (deletedId) => {
    setProducts(prev => prev.filter(p => p._id !== deletedId));
    setToastMessage("Artifact Removed");
    setIsToastVisible(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('aura_user', JSON.stringify(user));
    setToastMessage(`Welcome, ${user.email.split('@')[0]}`);
    setIsToastVisible(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aura_user');
    setIsProfileOpen(false);
    setToastMessage("Signed Out");
    setIsToastVisible(true);
  };

  if (isAdminPortal) {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />;
    }
    return (
      <AdminDashboard 
        isOpen={true} 
        products={products}
        onProductDeleted={handleProductDeleted}
        onClose={() => {
          window.history.pushState({}, '', window.location.pathname);
          setIsAdminPortal(false);
          setIsAdminAuthenticated(false);
        }} 
      />
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory.toLowerCase() === 'all' || 
      (p.category && p.category.toString().trim().toLowerCase() === activeCategory.toString().trim().toLowerCase());
    
    const matchesSearch = searchQuery.trim() === '' || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    if (product.status && product.status !== 'IN_STOCK') return; 
    
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

  return (
    <div>
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px' }}>
        <h1 className="logo" style={{ margin: 0, letterSpacing: '3px' }}>AURA</h1>
        
        <div style={{ flex: 1, maxWidth: '320px', margin: '0 40px' }}>
          <input 
            type="text" 
            placeholder="Search artifacts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#121212',
              border: '1px solid #222',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '11px',
              letterSpacing: '1px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setIsProfileOpen(true)} 
                style={{ background: 'transparent', border: 'none', fontSize: '11px', color: '#d4af37', letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                {currentUser.email.split('@')[0]}
              </button>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 12px', cursor: 'pointer', fontSize: '10px', letterSpacing: '1px', borderRadius: '4px' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 16px', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px', borderRadius: '4px' }}>
              Sign In
            </button>
          )}

          <button onClick={() => setIsCartOpen(true)} className="nav-btn" style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 16px', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px', borderRadius: '4px' }}>
            Bag ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
          </button>
        </div>
      </nav>

      <header className="hero-header">
        <Hero3D />
        <div className="hero-text-container">
          <p className="hero-subtitle">The New Standard</p>
          <h2 className="hero-title">REDEFINE <br/><span>REALITY</span></h2>
        </div>
      </header>

      <main className="shop-main" style={{ padding: '40px' }}>
        <div className="shop-header" style={{ marginBottom: '30px' }}>
          <div className="filter-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-pill ${activeCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                style={{
                  background: activeCategory.toLowerCase() === cat.toLowerCase() ? '#fff' : '#141414',
                  color: activeCategory.toLowerCase() === cat.toLowerCase() ? '#000' : '#888',
                  border: '1px solid #222',
                  padding: '8px 16px',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '20px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {isLoading ? (
            <div className="loading-spinner" style={{ color: '#666', fontSize: '12px', letterSpacing: '1px' }}>Connecting to Database...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={product._id} 
                onClick={() => setSelectedProduct(product)} 
                style={{ cursor: 'pointer' }}
              >
                <ProductCard 
                  product={product} 
                  onAddToCart={(e) => { 
                    e.stopPropagation(); 
                    handleAddToCart(product); 
                  }} 
                />
              </div>
            ))
          ) : (
            <div className="loading-spinner" style={{ color: '#666', fontSize: '12px', letterSpacing: '1px' }}>No inventory found matching your query.</div>
          )}
        </div>
      </main>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart} 
      />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={setCart} 
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} 
      />
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        cart={cart} 
        currentUser={currentUser}
        onOrderSuccess={() => { setCart([]); setToastMessage("Order Processed"); setIsToastVisible(true); }} 
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
      <ClientProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
      />
      <Toast 
        message={toastMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />
    </div>
  );
}

export default App;