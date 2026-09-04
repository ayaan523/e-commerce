// src/components/ClientProfile.jsx
import React, { useState, useEffect } from 'react';

const ClientProfile = ({ isOpen, onClose, currentUser, setCurrentUser }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'settings'
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', country: '' });

  useEffect(() => {
    if (isOpen && currentUser) {
      setAddressForm(currentUser.defaultAddress || { street: '', city: '', state: '', country: '' });
      fetchOrderHistory();
    }
  }, [isOpen, currentUser]);

  const fetchOrderHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/orders/client/${currentUser.email}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, defaultAddress: addressForm })
      });
      
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('aura_user', JSON.stringify(data.user));
        alert("Shipping destination updated successfully.");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  if (!isOpen || !currentUser) return null;

  const inputStyle = {
    width: '100%', background: '#121212', border: '1px solid #222', color: '#fff', padding: '12px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', borderRadius: '6px'
  };

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', background: '#0c0c0c', border: '1px solid #222', padding: '40px', color: '#fff', borderRadius: '16px', boxSizing: 'border-box' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}>CLOSE [✕]</button>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
          {currentUser.picture ? (
            <img src={currentUser.picture} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #333', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', color: '#888' }}>
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '16px', letterSpacing: '3px', fontWeight: '400', textTransform: 'uppercase', margin: '0 0 5px 0' }}>
              {currentUser.name || 'Client Profile'}
            </h2>
            <p style={{ color: '#888', fontSize: '11px', letterSpacing: '1px', margin: 0 }}>{currentUser.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => setActiveTab('history')} style={{ background: activeTab === 'history' ? '#fff' : 'transparent', color: activeTab === 'history' ? '#000' : '#888', border: '1px solid #333', padding: '8px 16px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px' }}>Acquisitions</button>
          <button onClick={() => setActiveTab('settings')} style={{ background: activeTab === 'settings' ? '#fff' : 'transparent', color: activeTab === 'settings' ? '#000' : '#888', border: '1px solid #333', padding: '8px 16px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px' }}>Destination Settings</button>
        </div>

        {activeTab === 'history' && (
          <div>
            {isLoading ? (
              <p style={{ color: '#666', fontSize: '12px' }}>Retrieving ledger...</p>
            ) : orders.length === 0 ? (
              <p style={{ color: '#666', fontSize: '12px' }}>No acquisitions found on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {/* Active Orders Section */}
                {activeOrders.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '15px' }}>Active Transit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {activeOrders.map(order => (
                        <div key={order._id} style={{ background: '#121212', border: '1px solid #222', padding: '20px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                            <span style={{ fontSize: '10px', color: '#666', letterSpacing: '1px' }}>ID: {order._id.slice(-8).toUpperCase()}</span>
                            <span style={{ fontSize: '10px', letterSpacing: '1.5px', fontWeight: '600', color: '#d4af37' }}>{order.status}</span>
                          </div>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                              <span>{item.quantity}x {item.name}</span>
                              <span style={{ color: '#aaa' }}>${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Orders Section */}
                {pastOrders.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '15px', marginTop: activeOrders.length > 0 ? '10px' : '0' }}>Archived Deliveries</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {pastOrders.map(order => (
                        <div key={order._id} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '20px', borderRadius: '8px', opacity: 0.7 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                            <span style={{ fontSize: '10px', color: '#666', letterSpacing: '1px' }}>ID: {order._id.slice(-8).toUpperCase()}</span>
                            <span style={{ fontSize: '10px', letterSpacing: '1.5px', fontWeight: '600', color: '#4caf50' }}>DELIVERED</span>
                          </div>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: '#888' }}>
                              <span>{item.quantity}x {item.name}</span>
                              <span>${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={handleUpdateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ color: '#888', fontSize: '11px', marginBottom: '10px' }}>Update your default shipping details to accelerate future checkouts.</p>
            <input type="text" placeholder="Street Address" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} style={inputStyle} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} style={inputStyle} required />
              <input type="text" placeholder="State / Province" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} style={inputStyle} required />
            </div>
            <input type="text" placeholder="Country" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} style={inputStyle} required />
            
            <button type="submit" style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '14px', fontSize: '10px', letterSpacing: '2px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase', borderRadius: '8px', marginTop: '10px' }}>
              Save Destination
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;