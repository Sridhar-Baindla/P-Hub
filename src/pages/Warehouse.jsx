import { useState, useEffect, useCallback, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, MapPin, LogOut, Check, Plus, X, Edit2, UploadCloud, Search } from 'lucide-react';
import './Warehouse.css';
import { API_URL } from '../config';
import { AppContext } from '../context/AppContext';

const Warehouse = () => {
  const { user: warehouseAdmin, logout: handleLogout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, orders
  const [orders, setOrders] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState({
    name: '', description: '', manufacturer: '', price: '', 
    discountedPrice: '', expiryDate: '', category: 'General', quantity: 0, image: ''
  });
  const [showExistingMeds, setShowExistingMeds] = useState(false);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/medicines`);
      const data = await res.json();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchStock = useCallback(async (location) => {
    try {
      const res = await fetch(`${API_URL}/stock?location=${location}`);
      const data = await res.json();
      setStock(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (warehouseAdmin && warehouseAdmin.role === 'warehouse_manager') {
      fetchMedicines();
      fetchStock(warehouseAdmin.location);
      fetchOrders();
    }
  }, [warehouseAdmin, fetchMedicines, fetchStock, fetchOrders]);

  const approveOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setUpdateMsg('Order approved and OTP generated!');
        fetchOrders();
        setTimeout(() => setUpdateMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verifyOTP = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ otp: otpInputs[orderId] })
      });
      if (res.ok) {
        setUpdateMsg('Order delivered successfully!');
        fetchOrders();
        setTimeout(() => setUpdateMsg(''), 3000);
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
    }
  };



  const [updatingItems, setUpdatingItems] = useState({});

  const handleUpdateStock = async (stockId, newQuantity) => {
    setUpdatingItems(prev => ({ ...prev, [stockId]: true }));
    try {
      const quantity = parseInt(newQuantity) || 0;
      const res = await fetch(`${API_URL}/stock/${stockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      if (res.ok) {
        setStock(prev => prev.map(s => s.id === stockId ? { ...s, quantity } : s));
        setUpdateMsg('Stock level updated!');
        setTimeout(() => setUpdateMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [stockId]: false }));
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStock) {
        // 1. Update medicine details
        const medRes = await fetch(`${API_URL}/medicines/${editingStock.medicineId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newStock.name,
            description: newStock.description,
            manufacturer: newStock.manufacturer,
            price: parseFloat(newStock.price) || 0,
            discountedPrice: newStock.discountedPrice ? parseFloat(newStock.discountedPrice) : null,
            expiryDate: newStock.expiryDate,
            category: newStock.category,
            ...(newStock.image && { image: newStock.image })
          })
        });

        if (!medRes.ok) throw new Error('Failed to update medicine details');

        // 2. Update stock quantity
        const stockRes = await fetch(`${API_URL}/stock/${editingStock.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: parseInt(newStock.quantity) || 0
          })
        });

        if (!stockRes.ok) throw new Error('Failed to update stock quantity');
        
        setUpdateMsg('Item details and stock updated!');
      } else {
        // Unified creation flow
        const response = await fetch(`${API_URL}/admin/add-inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newStock,
            price: parseFloat(newStock.price) || 0,
            discountedPrice: newStock.discountedPrice ? parseFloat(newStock.discountedPrice) : null,
            quantity: parseInt(newStock.quantity) || 0,
            location: warehouseAdmin.location
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add inventory');
        }
        
        setUpdateMsg('New medicine and stock added successfully!');
      }

      // Refresh data
      await fetchMedicines();
      await fetchStock(warehouseAdmin.location);
      
      setShowAddModal(false);
      setEditingStock(null);
      setNewStock({ name: '', description: '', manufacturer: '', price: '', discountedPrice: '', expiryDate: '', category: 'General', quantity: 0, image: '' });
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item, medicine) => {
    setEditingStock(item);
    setNewStock({
      name: medicine.name,
      description: medicine.description || '',
      manufacturer: medicine.manufacturer || '',
      price: medicine.price || 0,
      discountedPrice: medicine.discountedPrice || '',
      expiryDate: medicine.expiryDate || '',
      category: medicine.category || 'General',
      quantity: item.quantity || 0,
      image: medicine.image || ''
    });
    setShowAddModal(true);
  };

  const handleSelectExisting = (med) => {
    setNewStock({
      ...newStock,
      name: med.name,
      description: med.description || '',
      manufacturer: med.manufacturer || '',
      price: med.price || 0,
      discountedPrice: med.discountedPrice || '',
      expiryDate: med.expiryDate || '',
      category: med.category || 'General',
      image: med.image || ''
    });
    setShowExistingMeds(false);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewStock({ ...newStock, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        handleImageUpload(blob);
      }
    }
  };

  if (!warehouseAdmin) {
    return <Navigate to="/warehouse/login" replace />;
  }

  const filteredStock = stock.filter(item => {
    const q = searchQuery.toLowerCase();
    return (item.name || '').toLowerCase().includes(q) || 
           (item.description || '').toLowerCase().includes(q) ||
           (item.manufacturer || '').toLowerCase().includes(q) ||
           (item.category || '').toLowerCase().includes(q) ||
           (item.expiryDate && item.expiryDate.toLowerCase().includes(q)) ||
           (item.quantity || 0).toString().includes(q);
  });

  return (
    <div className="warehouse-dashboard">
      <header className="warehouse-header">
        <div className="container header-flex">
          <div className="store-info">
            <Package size={24} color="var(--primary)" />
            <div>
              <h2>{warehouseAdmin.location} Logistics Hub</h2>
              <p>Active Manager: {warehouseAdmin.name}</p>
            </div>
          </div>
          <div className="header-nav">
             <button className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
             <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Fulfillment</button>
          </div>
          <button onClick={handleLogout} className="logout-link">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="container warehouse-main">
        {activeTab === 'inventory' ? (
          <>
            <div className="dashboard-controls">
              <div>
                <h1>Inventory Management</h1>
                <p>Update real-time stock levels for {warehouseAdmin.location} location.</p>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div className="warehouse-search-bar" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '0.6rem 1.25rem', 
                  gap: '0.75rem', 
                  minWidth: '350px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Search size={18} color="var(--text-secondary)" />
                  <input 
                    type="text" 
                    placeholder="Search name, formula, company, stock..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      border: 'none', 
                      background: 'none', 
                      outline: 'none', 
                      width: '100%',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                {updateMsg && <div className="success-badge"><Check size={16} /> {updateMsg}</div>}
                <button onClick={() => { setEditingStock(null); setShowAddModal(true); }} className="btn btn-primary add-stock-btn" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={18} /> Add Stock
                </button>
              </div>
            </div>

            <div className="stock-grid">
              {filteredStock.map(item => (
                <div key={item.id} className="stock-card">
                  <div className="stock-img-container">
                    <img src={item.image} alt={item.name} />
                    {item.quantity < 20 && (
                      <span className="low-stock-pill">Low Stock</span>
                    )}
                  </div>
                  <div className="stock-info">
                    <div className="stock-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3>{item.name}</h3>
                      <button className="edit-stock-btn" onClick={() => handleOpenEdit(item, item)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <Edit2 size={18} />
                      </button>
                    </div>
                    <p className="category">{item.category || 'General'} • {item.manufacturer || 'Unknown'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
                      <p className="price-info" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.discountedPrice ? (
                          <>
                            <span style={{ color: 'var(--primary)' }}>₹{item.discountedPrice}</span>
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>₹{item.price}</span>
                          </>
                        ) : (
                          <span>₹{item.price}</span>
                        )}
                      </p>
                      {item.expiryDate && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          Exp: {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                      
                      <div className="quantity-manager">
                        <label>Available Stock (Units)</label>
                        <div className={`input-with-button ${updatingItems[item.id] ? 'loading' : ''}`} style={{ position: 'relative' }}>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setStock(stock.map(s => s.id === item.id ? { ...s, quantity: val } : s));
                            }}
                            onBlur={(e) => handleUpdateStock(item.id, e.target.value)}
                            min="0"
                            disabled={updatingItems[item.id]}
                            style={{ opacity: updatingItems[item.id] ? 0.5 : 1 }}
                          />
                          <div className="unit-label">Units</div>
                          {updatingItems[item.id] && (
                            <span style={{ position: 'absolute', right: '10px', top: '-20px', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>Saving...</span>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              )
            )}
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-controls">
              <div>
                <h1>Order Fulfillment</h1>
                <p>Review, approve, and verify delivery for customer orders.</p>
              </div>
              {updateMsg && <div className="success-badge"><Check size={16} /> {updateMsg}</div>}
            </div>

            <div className="data-table-container" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--background)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Customer Info</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Items</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Approval Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>#{order.id}</td>
                      <td style={{ padding: '1rem' }}>
                         <div style={{ fontWeight: 600 }}>{order.contactNumber}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.shippingAddress}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{JSON.parse(order.items || '[]').length} items</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>₹{order.totalAmount}</td>
                      <td style={{ padding: '1rem' }}>
                         <span className={`badge badge-${order.deliveryStatus === 'Approved' ? 'success' : order.deliveryStatus === 'Delivered' ? 'primary' : 'warning'}`}>
                           {order.deliveryStatus || 'Pending Review'}
                         </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {!order.deliveryStatus ? (
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => approveOrder(order.id)}>
                            Approve Order
                          </button>
                        ) : order.deliveryStatus === 'Approved' ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <input 
                              type="text" 
                              placeholder="Enter OTP" 
                              className="input-field" 
                              style={{ width: '100px', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                              value={otpInputs[order.id] || ''}
                              onChange={(e) => setOtpInputs({...otpInputs, [order.id]: e.target.value})}
                            />
                            <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => verifyOTP(order.id)}>
                              Verify & Deliver
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>Order Handover Complete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {filteredStock.length === 0 && !loading && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
            {searchQuery ? (
              <>
                <Search size={60} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h2>No matching results</h2>
                <p>We couldn't find any medicine matching "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} className="btn" style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Clear Search</button>
              </>
            ) : (
              <>
                <Package size={60} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h2>No items in stock</h2>
                <p>This warehouse doesn't have any items registered yet.</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content warehouse-modal">
            <button className="modal-close" onClick={() => { setShowAddModal(false); setEditingStock(null); }}>
              <X size={24} />
            </button>
            <h2>{editingStock ? 'Edit Stock Item' : 'Register New Stock'}</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              {editingStock ? 'Update the medicine details and current inventory level.' : 'Enter the medicine details to add it to your inventory.'}
            </p>
            
            <form onSubmit={handleAddStock} className="add-stock-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Drug Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol" 
                    value={newStock.name}
                    onChange={(e) => {
                      setNewStock({...newStock, name: e.target.value});
                      if (!editingStock) setShowExistingMeds(e.target.value.length > 0);
                    }}
                    required 
                    autoComplete="off"
                  />
                  {showExistingMeds && !editingStock && (
                    <div className="autocomplete-dropdown" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 100,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {medicines
                        .filter(m => m.name.toLowerCase().includes(newStock.name.toLowerCase()))
                        .map(m => (
                          <div 
                            key={m.id} 
                            className="autocomplete-item"
                            onClick={() => handleSelectExisting(m)}
                          >
                            <span className="med-name">{m.name}</span>
                            <span className="med-meta">{m.manufacturer} • {m.category}</span>
                          </div>
                        ))}
                      <div 
                        className="autocomplete-item"
                        style={{ color: 'var(--primary)', fontStyle: 'italic' }}
                        onClick={() => setShowExistingMeds(false)}
                      >
                        + Create as new medicine
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Formula Name / Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 500mg Composition" 
                    value={newStock.description}
                    onChange={(e) => setNewStock({...newStock, description: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Manufacturer / Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. GSK Pharmaceuticals" 
                  value={newStock.manufacturer}
                  onChange={(e) => setNewStock({...newStock, manufacturer: e.target.value})}
                  required 
                />
              </div>


              <div className="form-row">
                <div className="form-group">
                  <label>Selling Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={newStock.price}
                    onChange={(e) => setNewStock({...newStock, price: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Discounted Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={newStock.discountedPrice}
                    onChange={(e) => setNewStock({...newStock, discountedPrice: e.target.value})}
                  />
                </div>
              </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Product Image (Click to Upload or Paste Image)</label>
                  <div 
                    className="image-upload-zone"
                    onPaste={handlePaste}
                    onClick={() => document.getElementById('file-upload').click()}
                    tabIndex="0"
                    style={{ 
                      border: '2px dashed var(--border)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '2rem', 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      background: newStock.image ? 'none' : 'var(--surface-hover)',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {newStock.image ? (
                      <img src={newStock.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain' }} />
                    ) : (
                      <>
                        <UploadCloud size={40} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click to upload or press <b>Ctrl+V</b> to paste</p>
                      </>
                    )}
                    <input 
                      id="file-upload"
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newStock.category}
                    onChange={(e) => setNewStock({...newStock, category: e.target.value})}
                  >
                    <option>General</option>
                    <option>Pain Relief</option>
                    <option>Antibiotics</option>
                    <option>Supplements</option>
                    <option>Cardiac</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Date (Month/Year)</label>
                  <input 
                    type="month" 
                    value={newStock.expiryDate}
                    onChange={(e) => setNewStock({...newStock, expiryDate: e.target.value})}
                    required 
                  />
                </div>

              <div className="form-group">
                <label>Initial Stock Quantity</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Processing...' : (editingStock ? 'Update Inventory' : 'Add to Inventory')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
