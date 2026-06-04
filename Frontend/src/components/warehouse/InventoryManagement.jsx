import React from 'react';
import { Package, Search, Plus, Check, Edit2, UploadCloud, X } from 'lucide-react';

const InventoryManagement = ({
  warehouseAdmin, stock, medicines, searchQuery, setSearchQuery, updateMsg, setUpdateMsg,
  loading, showAddModal, setShowAddModal, editingStock, setEditingStock,
  newStock, setNewStock, showExistingMeds, setShowExistingMeds, updatingItems,
  handleUpdateStock, handleAddStock, handleOpenEdit, handleSelectExisting,
  handleImageUpload, handlePaste, filteredStock, setStock, token
}) => {

  return (
    <div className="module-container">
      <div className="dashboard-controls">
        <div>
          <h1>Inventory Management</h1>
          <p>Update real-time stock levels for {warehouseAdmin.location} location.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <div className="warehouse-search-bar" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '0.6rem 1.25rem', 
            gap: '0.75rem', 
            width: '100%',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  {item.boxNumber && (
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--primary)', display: 'inline-block' }}>
                      Box {item.boxNumber}
                    </span>
                  )}
                </div>
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

export default InventoryManagement;
