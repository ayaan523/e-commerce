// src/components/CheckoutModal.jsx
import React, { useState } from 'react';

const CheckoutModal = ({ isOpen, onClose, cart, onOrderSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    city: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const shippingCost = 25.00;
  const total = subtotal + (cart.length > 0 ? shippingCost : 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: formData,
          cart: cart,
          total: total
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Order submission failed');
      }
      
      setStep(3);
      setTimeout(() => {
        onOrderSuccess();
        onClose();
        setStep(1);
        setIsSubmitting(false);
      }, 3500);

    } catch (error) {
      console.error("Checkout execution error:", error);
      alert(`Checkout failed: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', 
    background: '#121212', 
    border: '1px solid #222', 
    color: '#fff', 
    padding: '12px 14px', 
    fontSize: '12px', 
    outline: 'none', 
    boxSizing: 'border-box',
    borderRadius: '6px'
  };

  const buttonStyle = {
    width: '100%', 
    background: isSubmitting ? '#444' : '#fff', 
    color: isSubmitting ? '#888' : '#000', 
    border: 'none', 
    padding: '14px', 
    fontSize: '10px', 
    letterSpacing: '2px', 
    fontWeight: '600', 
    cursor: isSubmitting ? 'wait' : 'pointer', 
    textTransform: 'uppercase',
    borderRadius: '8px'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '480px', background: '#0c0c0c', border: '1px solid #222', padding: '40px', color: '#fff', boxSizing: 'border-box', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.9)' }}>
        <button onClick={onClose} type="button" style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#777', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px' }}>
          CLOSE [✕]
        </button>

        {step === 1 && (
          <form onSubmit={handleNext}>
            <h2 style={{ fontSize: '13px', letterSpacing: '2.5px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '12px', marginTop: 0 }}>
              01 / Shipping Destination
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <input 
                type="email" name="email" required placeholder="Email Address for Manifest" value={formData.email} onChange={handleChange}
                style={inputStyle}
              />
              <input 
                type="text" name="address" required placeholder="Street Address" value={formData.address} onChange={handleChange}
                style={inputStyle}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <input 
                  type="text" name="city" required placeholder="City" value={formData.city} onChange={handleChange}
                  style={inputStyle}
                />
                <input 
                  type="text" name="country" required placeholder="Country" value={formData.country} onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" style={buttonStyle}>
              Proceed to Payment — ${total.toFixed(2)}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleComplete}>
            <h2 style={{ fontSize: '13px', letterSpacing: '2.5px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '12px', marginTop: 0 }}>
              02 / Secure Authentication
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <input 
                type="text" name="cardNumber" required placeholder="Card Number (XXXX XXXX XXXX XXXX)" value={formData.cardNumber} onChange={handleChange}
                style={inputStyle}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <input 
                  type="text" name="expiry" required placeholder="MM / YY" value={formData.expiry} onChange={handleChange}
                  style={inputStyle}
                />
                <input 
                  type="password" name="cvc" required placeholder="CVC" value={formData.cvc} onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} style={buttonStyle}>
              {isSubmitting ? 'Transmitting Secure Order...' : `Complete Acquisition — $${total.toFixed(2)}`}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #d4af37', color: '#d4af37', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', margin: '0 auto 20px auto', background: 'rgba(212, 175, 55, 0.05)' }}>
              <span>✓</span>
            </div>
            <h2 style={{ fontSize: '14px', letterSpacing: '2.5px', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase' }}>
              Acquisition Confirmed
            </h2>
            <p style={{ color: '#777', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
              Your order has been logged into the ledger.<br/>Receipt dispatched to <span style={{ color: '#fff' }}>{formData.email}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;