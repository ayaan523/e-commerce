import React, { useState, useEffect } from 'react';
import '../App.css';

const AdminDashboard = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/api/admin/analytics');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
      
      setAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-overlay">
      <div className="checkout-backdrop" onClick={onClose} />
      
      <div className="checkout-container" style={{ maxWidth: '800px', width: '90%' }}>
        <button onClick={onClose} className="checkout-close-btn" type="button">
          [✕]
        </button>

        <div className="checkout-step">
          <h2 className="checkout-title">Atelier Analytics & Sales</h2>

          {loading && <p style={{ color: '#888', textAlign: 'center' }}>Compiling ledger metrics...</p>}
          {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>Error: {error}</p>}

          {!loading && !error && analytics && (
            <div>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#111', padding: '20px', border: '1px solid #333', textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Acquisitions</p>
                  <p style={{ fontSize: '28px', fontWeight: '600', color: '#fff', marginTop: '5px' }}>{analytics.totalOrders}</p>
                </div>
                <div style={{ background: '#111', padding: '20px', border: '1px solid #333', textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gross Revenue</p>
                  <p style={{ fontSize: '28px', fontWeight: '600', color: '#d4af37', marginTop: '5px' }}>${analytics.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Product Performance Table */}
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', color: '#ccc' }}>
                Product Performance Ledger
              </h3>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #222' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #333', color: '#888' }}>
                      <th style={{ padding: '12px' }}>Artifact Name</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Units Sold</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.productBreakdown && analytics.productBreakdown.length > 0 ? (
                      analytics.productBreakdown.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '12px', color: '#fff' }}>{item.name}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#ccc' }}>{item.unitsSold}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#d4af37' }}>${item.revenueGenerated.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No acquisitions recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;