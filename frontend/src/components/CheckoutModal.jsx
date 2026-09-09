// src/components/CheckoutModal.jsx
import { useState } from 'react';
import { apiUrl } from '../api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutModal = ({ isOpen, onClose, cart, currentUser, onOrderSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    address: currentUser?.defaultAddress?.street || '',
    city: currentUser?.defaultAddress?.city || '',
    country: currentUser?.defaultAddress?.country || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const shippingCost = 25.00;
  const total = subtotal + (cart.length > 0 ? shippingCost : 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Initialize Order on Backend
      const orderRes = await fetch(apiUrl('/api/razorpay/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.message);

      // 2. Configure Razorpay Pop-up
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        name: 'AURA Atelier',
        description: 'Luxury Acquisition Transaction',
        order_id: orderData.razorpayOrder.id,
        handler: async function (response) {
          // 3. Complete and Verify Order
          try {
            const verifyRes = await fetch(apiUrl('/api/orders'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                formData,
                cart,
                razorpayResponse: response
              })
            });
            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) throw new Error(verifyData.message);
            
            setStep(3);
            setTimeout(() => {
              onOrderSuccess();
              onClose();
              setStep(1);
              setIsSubmitting(false);
            }, 3500);
          } catch (err) {
            alert(`Order confirmation failed: ${err.message}`);
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.email.split('@')[0],
          email: formData.email,
        },
        theme: {
          color: '#d4af37' // Matches the AURA brand gold
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        setIsSubmitting(false);
      });
      
      paymentObject.open();
    } catch (error) {
      alert(`Checkout initialization failed: ${error.message}`);
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
          <form onSubmit={handleProceedToReview}>
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
              Review & Pay — ₹{total.toFixed(2)}
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '13px', letterSpacing: '2.5px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '12px', marginTop: 0 }}>
              02 / Secure Authentication
            </h2>
            <div style={{ background: '#121212', border: '1px solid #222', padding: '20px', borderRadius: '6px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>Destination: <span style={{ color: '#fff' }}>{formData.email}</span></p>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>Total Items: <span style={{ color: '#fff' }}>{cart.length}</span></p>
              <div style={{ height: '1px', background: '#222', margin: '15px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>Total Payable</span>
                <span style={{ fontSize: '16px', color: '#d4af37', fontWeight: '600' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleRazorpayPayment} disabled={isSubmitting} style={buttonStyle}>
              {isSubmitting ? 'Initializing Gateway...' : `Launch Secure Gateway`}
            </button>
          </div>
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
              Your transaction has been securely processed via Razorpay.<br/>Ledger dispatched to <span style={{ color: '#fff' }}>{formData.email}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;