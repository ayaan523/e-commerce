// src/components/CartDrawer.jsx
import React from 'react';

const CartDrawer = ({ isOpen, onClose, cart, setCart, onCheckout }) => {
  if (!isOpen) return null;

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === id) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.cartId !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.3s ease' }}>
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)' }} 
      />

      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', height: '100%', background: '#0c0c0c', borderLeft: '1px solid #222', boxSizing: 'border-box', boxShadow: '-10px 0 30px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '32px', color: '#fff', boxSizing: 'border-box' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '13px', letterSpacing: '2.5px', fontWeight: '500', textTransform: 'uppercase', margin: 0 }}>Acquisition Bag ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</h2>
              <button 
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#888'}
              >
                Close [✕]
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 230px)', padding: '20px 0' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '80px' }}>
                  <p style={{ color: '#555', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
                    Your bag contains no artifacts.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #161616', paddingBottom: '20px', alignItems: 'center' }}>
                    <img 
                      src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'} 
                      alt={item.name} 
                      style={{ width: '75px', height: '75px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #222' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#777', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>Size {item.selectedSize || 'Standard'}</p>
                      <h3 style={{ fontSize: '12px', fontWeight: '400', letterSpacing: '1px', marginBottom: '6px', marginTop: 0, color: '#fff' }}>{item.name}</h3>
                      <p style={{ color: '#d4af37', fontSize: '12px', marginBottom: '12px', marginTop: 0, fontWeight: '500' }}>${item.price.toFixed(2)}</p>
                      
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #222', borderRadius: '4px', background: '#111' }}>
                        <button onClick={() => updateQuantity(item.cartId, -1)} style={{ background: 'transparent', border: 'none', color: '#aaa', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>−</button>
                        <span style={{ fontSize: '11px', padding: '0 8px', color: '#fff' }}>{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} style={{ background: 'transparent', border: 'none', color: '#aaa', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.cartId)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', alignSelf: 'flex-start', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.color = '#fff'}
                      onMouseLeave={(e) => e.target.style.color = '#555'}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #222', paddingTop: '20px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'baseline' }}>
              <span style={{ color: '#777', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Subtotal</span>
              <span style={{ color: '#d4af37', fontSize: '18px', fontWeight: '400' }}>${subtotal.toFixed(2)}</span>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={onCheckout}
              style={{ 
                width: '100%', 
                background: cart.length === 0 ? '#1a1a1a' : '#fff', 
                color: cart.length === 0 ? '#444' : '#000', 
                border: 'none', 
                padding: '14px', 
                fontSize: '10px', 
                letterSpacing: '2px', 
                fontWeight: '600', 
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer', 
                textTransform: 'uppercase',
                borderRadius: '8px',
                transition: 'background 0.2s, transform 0.1s'
              }}
            >
              Proceed to Secure Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;