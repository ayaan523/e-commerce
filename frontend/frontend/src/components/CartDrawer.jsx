import React from 'react';
import '../App.css'; 

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
    <div className="drawer-overlay">
      {/* Backdrop */}
      <div 
        className="drawer-backdrop" 
        onClick={onClose}
      />

      <div className="drawer-wrapper">
        <div className="drawer-content">
          
          {/* Header */}
          <div>
            <div className="drawer-header">
              <h2 className="drawer-title">Your Bag</h2>
              <button 
                onClick={onClose}
                className="drawer-close-btn"
              >
                Close [✕]
              </button>
            </div>

            {/* Items List */}
            <div className="drawer-items-list">
              {cart.length === 0 ? (
                <p className="drawer-empty-text">Your bag is currently empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="cart-item">
                    <img src={item.images[0]} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <p className="cart-item-size">Size {item.selectedSize}</p>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">${item.price}</p>
                      
                      <div className="cart-qty-controls">
                        <button onClick={() => updateQuantity(item.cartId, -1)} className="cart-qty-btn">-</button>
                        <span className="cart-qty-text">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} className="cart-qty-btn">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.cartId)} className="cart-remove-btn">Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer / Checkout */}
          <div className="drawer-footer">
            <div className="drawer-subtotal-row">
              <span className="drawer-subtotal-label">Subtotal</span>
              <span className="drawer-subtotal-amount">${subtotal.toFixed(2)}</span>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={onCheckout}
              className="drawer-checkout-btn"
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;