import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, MapPin, LogOut, Check, Plus, X, Edit2, UploadCloud, Search } from 'lucide-react';
import './Warehouse.css';
import { API_URL } from '../config';

const Warehouse = () => {
  const [warehouseAdmin, setWarehouseAdmin] = useState(() => {
    const saved = localStorage.getItem('warehouseAdmin');
    return saved ? JSON.parse(saved) : null;
  });
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    name: '',
    description: '',
    manufacturer: '',
    price: '',
    discountedPrice: '',
    expiryDate: '',
    category: 'General',
    quantity: 0,
    image: null
  });

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/medicines`);
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchStock = useCallback(async (location) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stock?location=${location}`);
      const data = await res.json();
      setStock(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a warehouse admin is already in session
  useEffect(() => {
    if (warehouseAdmin) {
      fetchStock(warehouseAdmin.location);
    }
    fetchMedicines();
  }, [warehouseAdmin, fetchStock, fetchMedicines]);

  const handleLogout = () => {
    setWarehouseAdmin(null);
    localStorage.removeItem('warehouseAdmin');
    setStock([]);
  };

  const handleUpdateStock = async (stockId, newQuantity) => {
    try {
      await fetch(`${API_URL}/stock/${stockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseInt(newQuantity) })
      });
      setStock(stock.map(s => s.id === stockId ? { ...s, quantity: parseInt(newQuantity) } : s));
      setUpdateMsg('Stock updated successfully!');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStock) {
        // Update existing medicine
        await fetch(`${API_URL}/medicines/${editingStock.medicineId}`, {
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

        // Update existing stock quantity
        await fetch(`${API_URL}/stock/${editingStock.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: parseInt(newStock.quantity)
          })
        });
        
        setUpdateMsg('Stock details updated!');
      } else {
        // Create new medicine
        const medResponse = await fetch(`${API_URL}/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newStock.name,
            description: newStock.description,
            manufacturer: newStock.manufacturer,
            price: parseFloat(newStock.price) || 0,
            discountedPrice: newStock.discountedPrice ? parseFloat(newStock.discountedPrice) : null,
            expiryDate: newStock.expiryDate,
            category: newStock.category,
            image: newStock.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            inStock: true
          })
        });
        const savedMed = await medResponse.json();

        // Create new stock entry
        await fetch(`${API_URL}/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicineId: savedMed.id,
            location: warehouseAdmin.location,
            quantity: parseInt(newStock.quantity)
          })
        });
        setUpdateMsg('New medicine added to stock!');
      }

      await fetchMedicines();
      await fetchStock(warehouseAdmin.location);
      
      setShowAddModal(false);
      setEditingStock(null);
      setNewStock({ name: '', description: '', manufacturer: '', price: '', discountedPrice: '', expiryDate: '', category: 'General', quantity: 0 });
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item, medicine) => {
    setEditingStock(item);
    setNewStock({
      editingStock: medicine.id,
      name: medicine.name,
      description: medicine.description,
      manufacturer: medicine.manufacturer,
      price: medicine.price,
      discountedPrice: medicine.discountedPrice || '',
      expiryDate: medicine.expiryDate || '',
      category: medicine.category || 'General',
      quantity: item.quantity,
      image: medicine.image
    });
    setShowAddModal(true);
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
    const medicine = medicines.find(m => m.id === item.medicineId);
    if (!medicine) return false;
    const q = searchQuery.toLowerCase();
    return (medicine.name || '').toLowerCase().includes(q) || 
           (medicine.description || '').toLowerCase().includes(q) ||
           (medicine.manufacturer || '').toLowerCase().includes(q) ||
           (medicine.category || '').toLowerCase().includes(q) ||
           (medicine.expiryDate && medicine.expiryDate.toLowerCase().includes(q)) ||
           (item.quantity || 0).toString().includes(q);
  });

  return (
    <div className="warehouse-dashboard">
      <header className="warehouse-header">
        <div className="container header-flex">
          <div className="store-info">
            <MapPin size={20} className="pin-icon" />
            <div>
              <h2>{warehouseAdmin.location} Warehouse</h2>
              <p>Manager: {warehouseAdmin.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-link">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="container warehouse-main">
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
          {filteredStock.map(item => {
            const medicine = medicines.find(m => m.id === item.medicineId);
            if (!medicine) return null;
            
            return (
              <div key={item.id} className="stock-card">
                <div className="stock-img-container">
                  <img src={medicine.image} alt={medicine.name} />
                  {item.quantity < 20 && (
                    <span className="low-stock-pill">Low Stock</span>
                  )}
                </div>
                <div className="stock-info">
                  <div className="stock-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3>{medicine.name}</h3>
                    <button className="edit-stock-btn" onClick={() => handleOpenEdit(item, medicine)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                      <Edit2 size={18} />
                    </button>
                  </div>
                  <p className="category">{medicine.category || 'General'} • {medicine.manufacturer || 'Unknown'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
                    <p className="price-info" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {medicine.discountedPrice ? (
                        <>
                          <span style={{ color: 'var(--primary)' }}>₹{medicine.discountedPrice}</span>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>₹{medicine.price}</span>
                        </>
                      ) : (
                        <span>₹{medicine.price}</span>
                      )}
                    </p>
                    {medicine.expiryDate && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Exp: {new Date(medicine.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="quantity-manager">
                    <label>Available Stock (Units)</label>
                    <div className="input-with-button">
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setStock(stock.map(s => s.id === item.id ? { ...s, quantity: val } : s));
                        }}
                        onBlur={(e) => handleUpdateStock(item.id, e.target.value)}
                        min="0"
                      />
                      <div className="unit-label">Units</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
                    onChange={(e) => setNewStock({...newStock, name: e.target.value})}
                    required 
                  />
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
