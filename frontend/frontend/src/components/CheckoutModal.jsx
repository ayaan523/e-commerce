import React, { useState } from 'react';
import '../App.css';

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
    console.log("Complete Order button clicked. Submitting order...");

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
      console.log("Server response received:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Order submission failed');
      }
      
      setStep(3);
      setTimeout(() => {
        onOrderSuccess();
        onClose();
        setStep(1);
      }, 4000);

    } catch (error) {
      console.error("Checkout execution error:", error);
      alert(`Checkout failed: ${error.message}`);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-backdrop" onClick={onClose} />

      <div className="checkout-container">
        <button onClick={onClose} className="checkout-close-btn" type="button">
          [✕]
        </button>

        {step === 1 && (
          <form onSubmit={handleNext} className="checkout-step">
            <h2 className="checkout-title">Shipping Details</h2>
            <div className="checkout-form-group">
              <input 
                type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange}
                className="checkout-input"
              />
              <input 
                type="text" name="address" required placeholder="Street Address" value={formData.address} onChange={handleChange}
                className="checkout-input"
              />
              <div className="checkout-grid-2">
                <input 
                  type="text" name="city" required placeholder="City" value={formData.city} onChange={handleChange}
                  className="checkout-input"
                />
                <input 
                  type="text" name="country" required placeholder="Country" value={formData.country} onChange={handleChange}
                  className="checkout-input"
                />
              </div>
            </div>
            <button type="submit" className="checkout-submit-btn">
              Continue to Payment — ${total.toFixed(2)}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleComplete} className="checkout-step">
            <h2 className="checkout-title">Secure Payment</h2>
            <div className="checkout-form-group">
              <input 
                type="text" name="cardNumber" required placeholder="Card Number (XXXX XXXX XXXX XXXX)" value={formData.cardNumber} onChange={handleChange}
                className="checkout-input"
              />
              <div className="checkout-grid-2">
                <input 
                  type="text" name="expiry" required placeholder="MM/YY" value={formData.expiry} onChange={handleChange}
                  className="checkout-input"
                />
                <input 
                  type="password" name="cvc" required placeholder="CVC" value={formData.cvc} onChange={handleChange}
                  className="checkout-input"
                />
              </div>
            </div>
            <button type="submit" className="checkout-submit-btn">
              Complete Order
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="checkout-step checkout-success">
            <div className="checkout-success-icon">
              <span>✓</span>
            </div>
            <h2 className="checkout-success-title">Order Confirmed</h2>
            <p className="checkout-success-text">
              Thank you for your acquisition.<br/>Receipt sent to {formData.email}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;