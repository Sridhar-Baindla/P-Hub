import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, ScanLine, User, Plus, Trash2, Printer, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config';

const SalesManagement = () => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [customer, setCustomer] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.rate * item.qty), 0);
  const totalGst = cart.reduce((acc, item) => acc + ((item.rate * item.qty) * (item.gst/100)), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + ((item.mrp - item.rate) * item.qty), 0);
  const netPayable = subtotal + totalGst;

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/medicines?q=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToCart = (med) => {
    const existing = cart.find(i => i.medicineId === med.id);
    if (existing) {
      setCart(cart.map(i => i.medicineId === med.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, {
        medicineId: med.id,
        name: med.name,
        batch: med.boxNumber || 'GEN-1',
        expiry: med.expiryDate || '12/28',
        qty: 1,
        mrp: med.price || 0,
        rate: med.discountedPrice || med.price || 0,
        discount: med.price - (med.discountedPrice || med.price),
        gst: 12
      }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(i => i.medicineId === id ? { ...i, qty: newQty } : i));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.medicineId !== id));
  };

  const handleGenerateInvoice = async (paymentMode) => {
    if (cart.length === 0) return alert('Cart is empty!');
    setLoading(true);
    try {
      const payload = {
        invoiceNo: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        customerName: customer || 'Guest Customer',
        customerPhone: '',
        totalAmount: netPayable.toFixed(2),
        subtotal,
        totalGst,
        totalDiscount,
        netPayable,
        paymentMode,
        items: cart
      };
      
      const res = await fetch(`${API_URL}/sales/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMsg('Invoice generated successfully & Stock deducted!');
        setCart([]);
        setCustomer('');
        setTimeout(() => setMsg(''), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="module-container" style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
      {/* Left: Billing Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Top Controls */}
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search Medicine by Name or Salt..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} 
            />
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '0.25rem', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                {searchResults.map(res => (
                  <div key={res.id} onClick={() => addToCart(res)} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} className="hover-bg">
                    <div>
                      <div style={{ fontWeight: 600 }}>{res.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stock: {res.totalStock}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{res.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ScanLine size={18} /> Barcode (F3)
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <User size={18} color="var(--primary)" />
            <input type="text" placeholder="Customer Mobile..." value={customer} onChange={(e) => setCustomer(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '130px' }} />
          </div>
        </div>

        {/* Cart Table */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>S.No</th>
                <th style={{ padding: '0.75rem 1rem' }}>Product Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Batch & Exp</th>
                <th style={{ padding: '0.75rem 1rem' }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem' }}>MRP</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rate</th>
                <th style={{ padding: '0.75rem 1rem' }}>GST%</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={item.medicineId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{idx + 1}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.batch}<br/><span style={{ color: 'var(--text-secondary)' }}>{item.expiry}</span></td>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQty(item.medicineId, item.qty - 1)} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>-</button>
                    <span style={{ width: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.medicineId, item.qty + 1)} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>+</button>
                  </td>
                  <td style={{ padding: '1rem' }}>₹{item.mrp}</td>
                  <td style={{ padding: '1rem' }}>₹{item.rate}</td>
                  <td style={{ padding: '1rem' }}>{item.gst}%</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>₹{(item.rate * item.qty).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => removeFromCart(item.medicineId)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Scan a barcode or search for a medicine to begin billing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Payment & Summary */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} /> Bill Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total GST:</span>
            <span>+ ₹{totalGst.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--success)' }}>
            <span>Total Savings:</span>
            <span>- ₹{totalDiscount.toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Net Payable:</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>₹{netPayable.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Payment Mode</h4>
          {msg && <div style={{ padding: '0.75rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16}/> {msg}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn" onClick={() => handleGenerateInvoice('Cash')} disabled={loading} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              <Banknote size={24} /> Cash
            </button>
            <button className="btn" onClick={() => handleGenerateInvoice('UPI')} disabled={loading} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <Smartphone size={24} /> UPI
            </button>
            <button className="btn" onClick={() => handleGenerateInvoice('Card')} disabled={loading} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <CreditCard size={24} /> Card
            </button>
            <button className="btn" onClick={() => handleGenerateInvoice('Credit')} disabled={loading} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <User size={24} /> Credit
            </button>
          </div>
          
          <button className="btn btn-primary" onClick={() => handleGenerateInvoice('Cash')} disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <Printer size={20} /> {loading ? 'Processing...' : 'Generate Invoice (F8)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;
