import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  UploadCloud,
  Lock,
  Users
} from 'lucide-react';
import './Admin.css';

// Initial Mock Data
const INITIAL_INVENTORY = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 150, price: 5.99, status: 'In Stock' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 12, price: 12.50, status: 'Low Stock' },
  { id: 3, name: 'Vitamin C 1000mg', category: 'Supplements', stock: 85, price: 15.00, status: 'In Stock' },
  { id: 4, name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 0, price: 8.49, status: 'Out of Stock' },
];

const Admin = () => {
  const { user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [managers, setManagers] = useState([]);
  
  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetch('http://localhost:5000/prescriptions')
        .then(res => res.json())
        .then(data => setPrescriptions(data))
        .catch(err => console.error(err));
    }
    if (activeTab === 'managers') {
      fetch('http://localhost:5000/warehouseAdmins')
        .then(res => res.json())
        .then(data => setManagers(data))
        .catch(err => console.error(err));
    }
  }, [activeTab]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveMedicine = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.get('name'),
      category: formData.get('category'),
      stock: parseInt(formData.get('stock')),
      price: parseFloat(formData.get('price')),
      status: parseInt(formData.get('stock')) > 20 ? 'In Stock' : parseInt(formData.get('stock')) > 0 ? 'Low Stock' : 'Out of Stock'
    };

    if (editingItem) {
      setInventory(inventory.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setInventory([...inventory, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this medicine?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div 
          className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} /> Dashboard
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={20} /> Inventory Manager
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={20} /> Order Operations
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <FileText size={20} /> Prescriptions
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'managers' ? 'active' : ''}`}
          onClick={() => setActiveTab('managers')}
        >
          <Users size={20} /> Store Managers
        </div>
        <div className="admin-nav-item" style={{ marginTop: 'auto' }}>
          <Settings size={20} /> Settings
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'inventory' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Inventory Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Add, edit, and track medicine stock.</p>
              </div>
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                <Plus size={20} /> Add New Medicine
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>₹{item.price.toFixed(2)}</td>
                      <td>{item.stock} units</td>
                      <td>
                        <span className={`badge ${item.status === 'In Stock' ? 'badge-success' : item.status === 'Low Stock' ? '' : ''}`} 
                              style={{ 
                                background: item.status === 'Out of Stock' ? 'rgba(239, 68, 68, 0.1)' : item.status === 'Low Stock' ? 'rgba(245, 158, 11, 0.1)' : '',
                                color: item.status === 'Out of Stock' ? 'var(--danger)' : item.status === 'Low Stock' ? 'var(--warning)' : ''
                              }}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="action-btn" onClick={() => handleOpenModal(item)}>
                            <Edit2 size={18} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'prescriptions' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Prescription Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>View and manage customer uploaded prescriptions.</p>
              </div>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID / User ID</th>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <th>Delivery Address</th>
                    <th>Uploaded Prescription</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>#{p.id}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>User: {p.userId}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{p.customerName}</td>
                      <td>{p.phone}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.address}>
                        {p.address}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                          <FileText size={16} />
                          <span style={{ fontSize: '0.9rem' }}>{p.fileName}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(p.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                           <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Review</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No prescriptions found in the database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'managers' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Store Manager Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Register and manage warehouse manager credentials.</p>
              </div>
              <button className="btn btn-primary" onClick={() => {
                const name = prompt("Manager Name:");
                const email = prompt("Manager Email:");
                const password = prompt("Manager Password:");
                const location = prompt("Location (e.g. Miyapur):");
                
                if (name && email && password && location) {
                  fetch('http://localhost:5000/warehouseAdmins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, location })
                  }).then(() => setActiveTab('managers'));
                }
              }}>
                <Plus size={20} /> Create New Manager
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Manager Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.location}</td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                           <button className="action-btn delete" onClick={() => {
                             if(window.confirm('Remove this manager?')) {
                               fetch(`http://localhost:5000/warehouseAdmins/${m.id}`, { method: 'DELETE' })
                                 .then(() => setActiveTab('managers'));
                             }
                           }}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className="action-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveMedicine}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="input-label">Medicine Name</label>
                    <input type="text" name="name" className="input-field" defaultValue={editingItem?.name} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select name="category" className="input-field" defaultValue={editingItem?.category || 'Pain Relief'}>
                      <option>Pain Relief</option>
                      <option>Antibiotics</option>
                      <option>Supplements</option>
                      <option>Allergy</option>
                      <option>Heart Health</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="input-label">Price (₹)</label>
                    <input type="number" name="price" step="0.01" className="input-field" defaultValue={editingItem?.price} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Stock Units</label>
                    <input type="number" name="stock" className="input-field" defaultValue={editingItem?.stock} required />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="input-label">Product Photo</label>
                  <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
                    <UploadCloud size={24} style={{ color: 'var(--text-secondary)', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: 'var(--primary)', fontWeight: 500 }}>Click to upload image</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>JPEG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span>Prescription Required (Rx)</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
