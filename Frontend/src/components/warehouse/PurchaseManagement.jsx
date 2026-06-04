import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Filter, CheckCircle, Clock, FileText, Upload, X } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../../config';
import { io } from 'socket.io-client';

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  
  const [showPOModal, setShowPOModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Auto-suggest states
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // PO Items
  const [poItems, setPoItems] = useState([{ medicineId: '', name: '', qty: 10, rate: 0 }]);
  const [activeItemSearchIndex, setActiveItemSearchIndex] = useState(null);
  
  // File upload
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    fetchPurchases();
    fetchDropdowns();

    // Socket listener for real-time updates
    const socket = io(SOCKET_URL);
    socket.on('inventory_update', () => {
      fetchPurchases(); // refresh list if someone else adds a PO
    });
    return () => socket.disconnect();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${API_URL}/purchases`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setPurchases(await res.json());
    } catch(err) { console.error(err); }
  };

  const fetchDropdowns = async () => {
    try {
      const distRes = await fetch(`${API_URL}/distributors`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      if (distRes.ok) setDistributors(await distRes.json());
      
      const medRes = await fetch(`${API_URL}/medicines`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      if (medRes.ok) setMedicines(await medRes.json());
    } catch(err) { console.error(err); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedSupplier || poItems.length === 0 || !poItems[0].medicineId) return alert('Please select a valid supplier and at least one valid medicine from the database.');
    setLoading(true);
    try {
      const totalAmount = poItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
      const payload = { 
        supplierName: selectedSupplier, 
        items: poItems, 
        totalAmount,
        invoiceFile 
      };
      
      const res = await fetch(`${API_URL}/purchases`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowPOModal(false);
        resetForm();
        fetchPurchases();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create PO");
      }
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedSupplier('');
    setSupplierSearch('');
    setPoItems([{ medicineId: '', name: '', qty: 10, rate: 0 }]);
    setInvoiceFile(null);
    setFileName('');
  };

  const addPoItem = () => {
    setPoItems([...poItems, { medicineId: '', name: '', qty: 1, rate: 0 }]);
  };
  
  const removePoItem = (index) => {
    if (poItems.length > 1) {
      const newItems = [...poItems];
      newItems.splice(index, 1);
      setPoItems(newItems);
    }
  };

  const handleItemSearchChange = (val, index) => {
    const newItems = [...poItems];
    newItems[index].name = val;
    newItems[index].medicineId = ''; // reset id when typing
    setPoItems(newItems);
    setActiveItemSearchIndex(index);
  };

  const selectMedicine = (med, index) => {
    const newItems = [...poItems];
    newItems[index].medicineId = med.id || med._id;
    newItems[index].name = med.name;
    newItems[index].rate = med.price ? parseFloat((med.price * 0.7).toFixed(2)) : 0; // rough wholesale estimate
    setPoItems(newItems);
    setActiveItemSearchIndex(null);
  };

  const filteredDistributors = distributors.filter(d => d.name.toLowerCase().includes(supplierSearch.toLowerCase()));
  
  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck color="var(--primary)" /> Purchase Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage inward supply, PO generation, and vendor bills</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPOModal(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={16} /> Create Purchase Order
        </button>
      </div>

      <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search PO Number or Supplier Name" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
          </div>
          <button className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} /> Filter Status
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Date</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>PO Number</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Supplier</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Items</th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Total Amount</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border)' }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(po => (
                <tr key={po.id || po._id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-bg">
                  <td style={{ padding: '1rem' }}>{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{po.poNumber}</td>
                  <td style={{ padding: '1rem' }}>{po.supplierName}</td>
                  <td style={{ padding: '1rem' }}>{po.items?.length || 0} Products</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>₹{po.totalAmount?.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      background: po.status === 'Verified' ? 'var(--success-light)' : 'var(--warning-light)',
                      color: po.status === 'Verified' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {po.status === 'Verified' ? <CheckCircle size={12}/> : <Clock size={12}/>} {po.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {po.invoiceFile ? (
                      <button onClick={() => {
                        const win = window.open();
                        win.document.write(`<iframe src="${po.invoiceFile}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }} className="btn" style={{ padding: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                        <FileText size={14}/> View Bill
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No purchase orders found. Click "Create Purchase Order" to begin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Creation Modal */}
      {showPOModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Create Purchase Order & Receive Stock</h2>
              <button className="btn" onClick={() => { setShowPOModal(false); resetForm(); }} style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-secondary)" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Supplier Auto-Suggest */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Supplier / Distributor</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      required 
                      value={supplierSearch}
                      onChange={(e) => {
                        setSupplierSearch(e.target.value);
                        setSelectedSupplier(e.target.value); 
                        setShowSupplierDropdown(true);
                      }}
                      onFocus={() => setShowSupplierDropdown(true)}
                      placeholder="Search for a supplier..."
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }} 
                    />
                  </div>
                  {showSupplierDropdown && supplierSearch && (
                    <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', zIndex: 10, listStyle: 'none', padding: 0, margin: '4px 0 0 0', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {filteredDistributors.length > 0 ? filteredDistributors.map(d => (
                        <li 
                          key={d.id || d._id} 
                          style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                          onMouseDown={() => {
                            setSelectedSupplier(d.name);
                            setSupplierSearch(d.name);
                            setShowSupplierDropdown(false);
                          }}
                        >
                          {d.name}
                        </li>
                      )) : (
                        <li style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Press enter to add "{supplierSearch}" as new</li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Items Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>Purchase Items (Auto-Sync to Inventory)</label>
                    <button type="button" onClick={addPoItem} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                      <Plus size={14} /> Add Row
                    </button>
                  </div>
                  
                  {poItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                      
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input 
                          type="text" 
                          required 
                          placeholder="Search product database..." 
                          value={item.name}
                          onChange={(e) => handleItemSearchChange(e.target.value, index)}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: item.medicineId ? '1px solid var(--success)' : '1px solid var(--error)', background: 'var(--background)' }}
                        />
                        {activeItemSearchIndex === index && item.name && !item.medicineId && (
                          <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', zIndex: 10, listStyle: 'none', padding: 0, margin: '4px 0 0 0', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {medicines.filter(m => m.name.toLowerCase().includes(item.name.toLowerCase())).map(m => (
                              <li 
                                key={m.id || m._id} 
                                style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                                onMouseDown={() => selectMedicine(m, index)}
                              >
                                <strong>{m.name}</strong> - Stock: {m.totalStock || 0}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <input 
                        type="number" 
                        placeholder="Qty" 
                        required 
                        min="1"
                        value={item.qty} 
                        onChange={e => {
                          const newItems = [...poItems];
                          newItems[index].qty = Number(e.target.value);
                          setPoItems(newItems);
                        }} 
                        style={{ width: '80px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }} 
                      />
                      
                      <input 
                        type="number" 
                        placeholder="Rate (₹)" 
                        required 
                        min="0"
                        step="0.01"
                        value={item.rate} 
                        onChange={e => {
                          const newItems = [...poItems];
                          newItems[index].rate = Number(e.target.value);
                          setPoItems(newItems);
                        }} 
                        style={{ width: '100px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }} 
                      />

                      <button type="button" onClick={() => removePoItem(index)} className="btn" style={{ padding: '0.75rem', color: 'var(--error)', background: 'var(--error-light)', border: 'none', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Total Estimated: ₹{poItems.reduce((acc, item) => acc + (item.qty * item.rate), 0).toFixed(2)}
                  </div>
                </div>

                {/* File Upload Section */}
                <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)', textAlign: 'center' }}>
                  <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Upload Vendor Invoice / Bill</p>
                  <input 
                    type="file" 
                    id="invoice-upload" 
                    accept="image/*,.pdf" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="invoice-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    Select File
                  </label>
                  {fileName && (
                    <p style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} /> Attached: {fileName}
                    </p>
                  )}
                </div>

              </div>

              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
                <button type="button" onClick={() => { setShowPOModal(false); resetForm(); }} className="btn" style={{ border: '1px solid var(--border)' }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {loading ? 'Processing...' : <><CheckCircle size={18} /> Submit PO & Sync Stock</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagement;
