// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';

const AdminDashboard = ({ isOpen, onClose, products = [], onProductDeleted }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [data, setData] = useState(null);
  const [localProducts, setLocalProducts] = useState(products);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [newCatName, setNewCatName] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', originalPrice: '', description: '', category: '', images: '', status: 'IN_STOCK'
  });

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/analytics'),
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/categories'),
        fetch('http://localhost:5000/api/orders')
      ]);
      
      if (analyticsRes.ok) setData(await analyticsRes.json());
      if (productsRes.ok) setLocalProducts(await productsRes.json());
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(catData);
        if (catData.length > 0 && !newProduct.category) {
          setNewProduct(prev => ({ ...prev, category: catData[0].name }));
        }
      }
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (err) {
      console.warn("Backend offline state fallback:", err);
    }
  }, [newProduct.category]);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, fetchData]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCategories(prev => [...prev, data.category].sort((a,b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      alert("Category created successfully!");
    } catch (err) {
      alert(`Failed to create category: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c._id !== catId));
      }
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewProduct(prev => ({ ...prev, images: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setNewProduct({
      name: product.name, price: product.price, originalPrice: product.originalPrice || '',
      description: product.description || '', category: product.category || (categories[0]?.name || ''), 
      images: '', status: product.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: '', price: '', originalPrice: '', description: '', category: categories[0]?.name || '', images: '', status: 'IN_STOCK' });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const productPayload = {
      name: newProduct.name, price: parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : null,
      description: newProduct.description, category: newProduct.category || categories[0]?.name || "General",
      images: newProduct.images ? [newProduct.images] : [], status: newProduct.status || "IN_STOCK"
    };

    const url = editingId ? `http://localhost:5000/api/admin/products/${editingId}` : 'http://localhost:5000/api/admin/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productPayload) });
      if (!res.ok) throw new Error('Failed to save product');
      alert(`Artifact ${editingId ? 'updated' : 'added'} successfully.`);
      window.location.href = 'http://localhost:5173/?admin=true';
    } catch (err) {
      alert('Operation failed. Check backend connection.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Remove this artifact?")) return;
    try {
      await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE' });
      if (onProductDeleted) onProductDeleted(id);
      setLocalProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.warn("Backend offline.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === 'PENDING' ? 'DISPATCHED' : 'DELIVERED';
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }} />
      <div style={{ background: '#0a0a0a', border: '1px solid #222', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', position: 'relative', color: '#fff', boxSizing: 'border-box' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px' }}>[✕]</button>

        <h2 style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: '400', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '15px', marginTop: 0 }}>
          ATELIER CONTROL PORTAL
        </h2>

        <div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('analytics')} style={{ background: activeTab === 'analytics' ? '#fff' : 'transparent', color: activeTab === 'analytics' ? '#000' : '#888', border: '1px solid #333', padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' }}>SALES & ANALYTICS</button>
            <button onClick={() => setActiveTab('inventory')} style={{ background: activeTab === 'inventory' ? '#fff' : 'transparent', color: activeTab === 'inventory' ? '#000' : '#888', border: '1px solid #333', padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' }}>INVENTORY MANAGEMENT</button>
            <button onClick={() => setActiveTab('categories')} style={{ background: activeTab === 'categories' ? '#fff' : 'transparent', color: activeTab === 'categories' ? '#000' : '#888', border: '1px solid #333', padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' }}>CATEGORY MANAGER</button>
            <button onClick={() => setActiveTab('orders')} style={{ background: activeTab === 'orders' ? '#fff' : 'transparent', color: activeTab === 'orders' ? '#000' : '#888', border: '1px solid #333', padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' }}>ORDER DISPATCH</button>
          </div>

          {activeTab === 'analytics' && data && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: '#111', border: '1px solid #222', padding: '24px' }}>
                <p style={{ color: '#666', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Total Acquisitions</p>
                <p style={{ fontSize: '32px', fontWeight: '300', marginTop: '10px', color: '#fff' }}>{data.totalOrders}</p>
              </div>
              <div style={{ background: '#111', border: '1px solid #222', padding: '24px' }}>
                <p style={{ color: '#666', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Gross Revenue</p>
                <p style={{ fontSize: '32px', fontWeight: '300', marginTop: '10px', color: '#d4af37' }}>${data.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <form onSubmit={handleCreateCategory} style={{ background: '#111', border: '1px solid #222', padding: '20px', marginBottom: '30px', display: 'flex', gap: '15px' }}>
                <input 
                  type="text" 
                  placeholder="New Category Name (e.g. Timepieces)" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none' }} 
                  required 
                />
                <button type="submit" style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', fontSize: '11px', letterSpacing: '1px', fontWeight: '600', cursor: 'pointer' }}>
                  ADD CATEGORY
                </button>
              </form>

              <h3 style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '15px' }}>Allowed Store Categories</h3>
              <div style={{ border: '1px solid #222' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td style={{ padding: '20px', color: '#666', textAlign: 'center' }}>No categories created yet.</td></tr>
                    ) : (
                      categories.map(cat => (
                        <tr key={cat._id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                          <td style={{ padding: '14px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat.name}</td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteCategory(cat._id)} style={{ background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '4px 10px', cursor: 'pointer', fontSize: '11px' }}>REMOVE</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div style={{ border: '1px solid #222', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#121212', borderBottom: '1px solid #222', color: '#666' }}>
                    <th style={{ padding: '14px', fontWeight: '400' }}>Client Email</th>
                    <th style={{ padding: '14px', fontWeight: '400' }}>Destination</th>
                    <th style={{ padding: '14px', fontWeight: '400' }}>Total</th>
                    <th style={{ padding: '14px', fontWeight: '400' }}>Status</th>
                    <th style={{ padding: '14px', fontWeight: '400', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '14px', color: '#fff' }}>{order.customer?.email}</td>
                      <td style={{ padding: '14px', color: '#aaa', fontSize: '12px' }}>
                        {order.customer?.address}, {order.customer?.city}, {order.customer?.country}
                      </td>
                      <td style={{ padding: '14px', color: '#d4af37' }}>${order.totalAmount?.toFixed(2)}</td>
                      <td style={{ padding: '14px', color: (order.status || 'PENDING') === 'PENDING' ? '#ff9800' : '#4caf50' }}>
                        {order.status || 'PENDING'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        {(order.status || 'PENDING') === 'PENDING' ? (
                          <button onClick={() => handleUpdateOrderStatus(order._id, 'PENDING')} style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '10px', fontWeight: '600' }}>DISPATCH</button>
                        ) : (
                          <span style={{ color: '#666', fontSize: '10px' }}>FULFILLED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <form onSubmit={handleSubmitProduct} style={{ background: '#111', border: '1px solid #222', padding: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: editingId ? '#d4af37' : '#aaa', margin: 0 }}>
                    {editingId ? 'Modify Artifact' : 'Add New Artifact'}
                  </h3>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} style={{ background: 'transparent', border: '1px solid #666', color: '#aaa', padding: '4px 10px', fontSize: '10px', cursor: 'pointer' }}>CANCEL EDIT</button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input type="text" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none' }} required />
                  <input type="number" placeholder="Active Price ($)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none' }} required />
                  <input type="number" placeholder="Original Price (For Offer)" value={newProduct.originalPrice} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} style={{ background: '#1a1a1a', border: '1px dashed #d4af37', color: '#d4af37', padding: '10px', fontSize: '13px', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none', textTransform: 'uppercase' }}
                    required
                  >
                    {categories.length === 0 ? (
                      <option value="">Please add a category first</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))
                    )}
                  </select>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Browse Image from Laptop</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', padding: '6px', fontSize: '11px', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <select value={newProduct.status} onChange={e => setNewProduct({...newProduct, status: e.target.value})} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none' }}>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock (Blurred)</option>
                    <option value="UPCOMING">Upcoming (Blurred + ⏳)</option>
                  </select>
                  <input type="text" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', fontSize: '13px', outline: 'none' }} />
                </div>

                <button type="submit" disabled={categories.length === 0} style={{ background: categories.length === 0 ? '#333' : (editingId ? '#d4af37' : '#fff'), color: categories.length === 0 ? '#777' : '#000', border: 'none', padding: '10px 20px', fontSize: '11px', letterSpacing: '1px', fontWeight: '600', cursor: categories.length === 0 ? 'not-allowed' : 'pointer' }}>
                  {categories.length === 0 ? 'CREATE A CATEGORY FIRST' : (editingId ? 'UPDATE ARTIFACT' : 'PUBLISH TO STOREFRONT')}
                </button>
              </form>

              <h3 style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '15px' }}>Active Inventory Catalog</h3>
              <div style={{ border: '1px solid #222', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#121212', borderBottom: '1px solid #222', color: '#666' }}>
                      <th style={{ padding: '14px', fontWeight: '400' }}>Name</th>
                      <th style={{ padding: '14px', fontWeight: '400' }}>Category</th>
                      <th style={{ padding: '14px', fontWeight: '400' }}>Price</th>
                      <th style={{ padding: '14px', fontWeight: '400', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localProducts.map(prod => (
                      <tr key={prod._id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={{ padding: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {prod.images && prod.images[0] && (
                            <img src={prod.images[0]} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '3px' }} />
                          )}
                          {prod.name}
                        </td>
                        <td style={{ padding: '14px', color: '#888' }}>{prod.category}</td>
                        <td style={{ padding: '14px', color: prod.originalPrice ? '#d4af37' : '#fff' }}>
                          ${prod.price?.toFixed(2)}
                          {prod.originalPrice && <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '10px', marginLeft: '5px' }}>${prod.originalPrice}</span>}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button onClick={() => handleEditClick(prod)} style={{ background: 'transparent', border: '1px solid #888', color: '#aaa', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', marginRight: '10px' }}>EDIT</button>
                          <button onClick={() => handleDeleteProduct(prod._id)} style={{ background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '4px 10px', cursor: 'pointer', fontSize: '11px' }}>REMOVE</button>
                        </td>
                      </tr>
                    ))}
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