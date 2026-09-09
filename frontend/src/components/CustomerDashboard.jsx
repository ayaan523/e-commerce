import { useState, useEffect } from 'react';
import { apiUrl } from '../api'; // Adjust path if necessary

const CustomerDashboard = ({ currentUser, setCurrentUser, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addressForm, setAddressForm] = useState({
    street: currentUser?.defaultAddress?.street || '',
    city: currentUser?.defaultAddress?.city || '',
    country: currentUser?.defaultAddress?.country || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!currentUser?.email) return;
      try {
        const res = await fetch(apiUrl(`/api/orders/client/${currentUser.email}`), {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch ledger:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedger();
  }, [currentUser]);

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(apiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ defaultAddress: addressForm })
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        alert('Shipping destination updated successfully.');
      }
    } catch {
      alert('Update failed. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#121212', border: '1px solid #222', 
    color: '#fff', padding: '12px', fontSize: '12px', outline: 'none', 
    borderRadius: '4px', marginBottom: '12px', boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      
      {/* Header Profile Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '24px', letterSpacing: '2px', fontWeight: '400', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
            Client Dossier
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>{currentUser.email}</p>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', color: '#d4af37', border: '1px solid #d4af37', padding: '8px 16px', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Disconnect
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
        
        {/* Left Column: Logistics / Profile */}
        <div>
          <h2 style={{ fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px', color: '#ccc' }}>
            Default Destination
          </h2>
          <form onSubmit={handleAddressUpdate} style={{ background: '#0c0c0c', padding: '24px', border: '1px solid #222', borderRadius: '8px' }}>
            <input 
              type="text" placeholder="Street Address" value={addressForm.street} 
              onChange={e => setAddressForm({...addressForm, street: e.target.value})} style={inputStyle} 
            />
            <input 
              type="text" placeholder="City" value={addressForm.city} 
              onChange={e => setAddressForm({...addressForm, city: e.target.value})} style={inputStyle} 
            />
            <input 
              type="text" placeholder="Country" value={addressForm.country} 
              onChange={e => setAddressForm({...addressForm, country: e.target.value})} style={inputStyle} 
            />
            <button type="submit" disabled={isUpdating} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '12px', fontSize: '11px', letterSpacing: '1px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase', marginTop: '10px' }}>
              {isUpdating ? 'Syncing...' : 'Update Logistics'}
            </button>
          </form>
        </div>

        {/* Right Column: Order Ledger */}
        <div>
          <h2 style={{ fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px', color: '#ccc' }}>
            Acquisition Ledger
          </h2>
          
          {isLoading ? (
            <p style={{ color: '#666', fontSize: '12px' }}>Accessing secure records...</p>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #333', borderRadius: '8px' }}>
              <p style={{ color: '#666', fontSize: '12px', letterSpacing: '1px' }}>No acquisitions found in your dossier.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div key={order._id} style={{ background: '#0c0c0c', border: '1px solid #222', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#888', letterSpacing: '1px' }}>ID: {order._id.slice(-8).toUpperCase()}</span>
                    <span style={{ fontSize: '11px', color: order.status === 'PENDING' ? '#d4af37' : '#4caf50', letterSpacing: '1px' }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span style={{ color: '#888' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #222' }}>
                    <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Total Settled</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;