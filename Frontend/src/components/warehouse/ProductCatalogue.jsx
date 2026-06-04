import React, { useState, useEffect } from 'react';
import { Library, Search, Filter, Plus, Edit2, Trash2, Download, X } from 'lucide-react';
import { API_URL } from '../../config';

const ProductCatalogue = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', salt: '', category: 'FMCG/OTC', manufacturer: '', price: '', quantity: '' });

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/medicines`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProd.name,
        description: newProd.salt,
        category: newProd.category,
        manufacturer: newProd.manufacturer,
        price: Number(newProd.price),
        discountedPrice: Number(newProd.price),
        quantity: Number(newProd.quantity),
        location: 'HQ' // Default location for admin
      };
      
      const res = await fetch(`${API_URL}/admin/add-inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewProd({ name: '', salt: '', category: 'FMCG/OTC', manufacturer: '', price: '', quantity: '' });
        fetchProducts(); // Refresh list
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library color="var(--primary)" /> Product Master
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Comprehensive catalogue of all medicines and OTC products</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search by Product Name, Salt, or Manufacturer" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
          </div>
          <select className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
            <option>All Categories</option>
            <option>Prescription</option>
            <option>FMCG/OTC</option>
            <option>Supplements</option>
          </select>
          <button className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} /> Advanced Filter
          </button>
        </div>
        
        {/* Data Grid */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', position: 'sticky', top: 0, zIndex: 1, boxShadow: '0 1px 0 var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', width: '80px' }}>ID</th>
                <th style={{ padding: '1rem', width: '250px' }}>Product Details</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Manufacturer</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>MRP</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-bg">
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{prod.boxNumber || prod.id.substring(0,6)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prod.description || '-'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500,
                      background: prod.category === 'Prescription' ? 'var(--error-light)' : 'var(--success-light)',
                      color: prod.category === 'Prescription' ? 'var(--error)' : 'var(--success)'
                    }}>
                      {prod.category || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{prod.manufacturer || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>₹{(prod.price || 0).toFixed(2)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, color: prod.totalStock < 50 ? 'var(--warning)' : 'var(--success)' }}>
                      {prod.totalStock || 0}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={16}/></button>
                      <button style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found in DB. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '500px', padding: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Add New Product</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Product Name</label>
                <input required type="text" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Salt / Description</label>
                <input type="text" value={newProd.salt} onChange={e => setNewProd({...newProd, salt: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                  <select value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }}>
                    <option>Prescription</option>
                    <option>FMCG/OTC</option>
                    <option>Supplements</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Manufacturer</label>
                  <input type="text" value={newProd.manufacturer} onChange={e => setNewProd({...newProd, manufacturer: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>MRP (₹)</label>
                  <input required type="number" step="0.01" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Opening Stock Qty</label>
                  <input required type="number" value={newProd.quantity} onChange={e => setNewProd({...newProd, quantity: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--border)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogue;
