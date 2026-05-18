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
  Users,
  Activity
} from 'lucide-react';
import './Admin.css';
import { API_URL } from '../config';

// Initial Mock Data
const INITIAL_INVENTORY = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', stock: 150, price: 5.99, status: 'In Stock' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 12, price: 12.50, status: 'Low Stock' },
  { id: 3, name: 'Vitamin C 1000mg', category: 'Supplements', stock: 85, price: 15.00, status: 'In Stock' },
  { id: 4, name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 0, price: 8.49, status: 'Out of Stock' },
];

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';

const Admin = () => {
  const { user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('billing');
  const [inventory, setInventory] = useState([]);
  const [managers, setManagers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [billingCart, setBillingCart] = useState([]);
  const [billingSearchQuery, setBillingSearchQuery] = useState('');
  const [billCustomer, setBillCustomer] = useState({ name: '', phone: '' });
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 125400,
    activeOrders: 42,
    totalPatients: 1205,
    pendingRx: 8
  });

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const { subtotal, tax, total } = calculateTotal();
      
      // Professional Theme Colors (Clean & Minimalist)
      const primaryColor = [31, 41, 55]; // Dark Slate
      const accentColor = [37, 99, 235];  // PHUB Blue

      // 1. Clean Header
      const logoSize = 20;
      doc.addImage(logo, 'PNG', 14, 15, logoSize, logoSize);
      
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('PHUB PHARMACY', 14 + logoSize + 4, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Digital Healthcare Simplified', 14 + logoSize + 4, 31);
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: 'right' });
      doc.text(`Inv #: ${Date.now().toString().slice(-6)}`, pageWidth - 14, 31, { align: 'right' });

      doc.setDrawColor(229, 231, 235);
      doc.line(14, 40, pageWidth - 14, 40);

      // 2. Customer Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 14, 52);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Name: ${billCustomer.name || 'Walk-in Customer'}`, 14, 59);
      doc.text(`Phone: ${billCustomer.phone || 'N/A'}`, 14, 64);

      // 3. Table
      const tableData = billingCart.map(item => [
        item.name,
        item.category,
        `Rs. ${item.price.toFixed(2)}`,
        item.quantity,
        `Rs. ${(item.price * item.quantity).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 75,
        head: [['Medicine Name', 'Category', 'Price', 'Qty', 'Total']],
        body: tableData,
        theme: 'plain',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 10 },
        bodyStyles: { fillColor: null },
        styles: { fontSize: 9, lineWidth: 0.1, lineColor: [230, 230, 230] }
      });

      // 4. Summary
      // @ts-ignore
      const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 100) + 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Subtotal:`, pageWidth - 60, finalY);
      doc.setTextColor(0);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
      
      doc.setTextColor(100);
      doc.text(`GST (12%):`, pageWidth - 60, finalY + 7);
      doc.setTextColor(0);
      doc.text(`Rs. ${tax.toFixed(2)}`, pageWidth - 14, finalY + 7, { align: 'right' });

      doc.setFontSize(13);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total:`, pageWidth - 60, finalY + 16);
      doc.text(`Rs. ${total.toFixed(2)}`, pageWidth - 14, finalY + 16, { align: 'right' });

      // 5. Footer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150);
      doc.text('Thank you for choosing PHUB Pharmacy!', pageWidth / 2, finalY + 30, { align: 'center' });

      doc.save(`Invoice_${billCustomer.name || 'Customer'}.pdf`);
    } catch (error) {
      console.error("Error generating admin PDF:", error);
      alert("Error printing invoice: " + error.message);
    }
  };
  
  const [orders, setOrders] = useState([]);
  
  const fetchInventory = () => {
    fetch(`${API_URL}/medicines`)
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetch(`${API_URL}/prescriptions`)
        .then(res => res.json())
        .then(data => setPrescriptions(data))
        .catch(err => console.error(err));
    }
    if (activeTab === 'managers') {
      fetch(`${API_URL}/warehouseAdmins`)
        .then(res => res.json())
        .then(data => setManagers(data))
        .catch(err => console.error(err));
    }
    if (activeTab === 'orders') {
       const { token } = JSON.parse(localStorage.getItem('user_full_data') || '{}'); // Wait, AppContext has it
       // Since I don't have direct access to token here easily without passing it or using context properly
       // I'll use a fetch that includes the token if possible.
       // Actually, I'll just use the authenticatedFetch if I can, but Admin.jsx doesn't have it yet.
       // I'll add it.
    }
  }, [activeTab]);

  // For simplicity in this demo environment, I'll just fetch orders normally if the server allows or I'll fix the server.
  // I already updated the server to check for admin role.
  
  useEffect(() => {
    if (activeTab === 'orders') {
      const storedToken = localStorage.getItem('token');
      fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const storedToken = localStorage.getItem('token');
      fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
        .then(res => res.json())
        .then(data => setDashboardStats(data))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  const addToBilling = (med) => {
    setBillingCart(prev => {
      const exists = prev.find(item => item.id === med.id);
      if (exists) {
        return prev.map(item => item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const removeFromBilling = (id) => {
    setBillingCart(prev => prev.filter(item => item.id !== id));
  };

  const updateBillQty = (id, delta) => {
    setBillingCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = billingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.12; // 12% GST
    return { subtotal, tax, total: subtotal + tax };
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveMedicine = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const medData = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      manufacturer: formData.get('manufacturer') || 'PHUB Pharma',
      description: formData.get('description') || '',
      inStock: parseInt(formData.get('stock')) > 0,
      image: '/placeholder-medicine.jpg' // In a real app, this would be an uploaded URL
    };

    const method = editingItem ? 'PATCH' : 'POST';
    const url = editingItem ? `${API_URL}/medicines/${editingItem.id}` : `${API_URL}/medicines`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medData)
    }).then(() => {
      fetchInventory();
      setIsModalOpen(false);
    });
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this medicine?')) {
      fetch(`${API_URL}/medicines/${id}`, { method: 'DELETE' })
        .then(() => fetchInventory());
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const { subtotal, tax, total } = calculateTotal();

  const filteredInventory = inventory.filter(med => 
    med.name.toLowerCase().includes(billingSearchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(billingSearchQuery.toLowerCase())
  );

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
          className={`admin-nav-item ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <ShoppingCart size={20} /> Fast Billing
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Activity size={20} /> Order Operations
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={20} /> Inventory Manager
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
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="admin-header">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Admin. Here's what's happening today.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveTab('billing')}>
                  <ShoppingCart size={20} /> Fast Billing
                </button>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                  <Plus size={20} /> Add Medicine
                </button>
              </div>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="stat-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Daily Sales</p>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{dashboardStats.totalSales.toLocaleString()}</h2>
                <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem' }}>+12.5% from yesterday</p>
              </div>
              <div className="stat-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Patients</p>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{dashboardStats.totalPatients}</h2>
                <p style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>24 new today</p>
              </div>
              <div className="stat-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Orders</p>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{dashboardStats.activeOrders}</h2>
                <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.5rem' }}>5 urgent deliveries</p>
              </div>
              <div className="stat-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Rx</p>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{dashboardStats.pendingRx}</h2>
                <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Requires approval</p>
              </div>
            </div>

            <div className="activity-quick-actions">
               <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingCart size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>New order #OR-554{i} placed</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i*5} mins ago • ₹{(i * 123.45).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <button onClick={() => setActiveTab('billing')} style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                      <ShoppingCart size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600 }}>Fast Billing</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generate instant invoice</div>
                    </button>
                    <button onClick={() => setActiveTab('inventory')} style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', textAlign: 'left' }}>
                      <Package size={24} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600 }}>Manage Stock</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Update medicine levels</div>
                    </button>
                    <button onClick={() => setActiveTab('prescriptions')} style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', textAlign: 'left' }}>
                      <FileText size={24} style={{ color: 'var(--warning)', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600 }}>Approve Rx</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Review prescriptions</div>
                    </button>
                    <button style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', textAlign: 'left' }}>
                      <Users size={24} style={{ color: 'var(--info)', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600 }}>User Insights</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>View patient database</div>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="billing-container">
            <div className="billing-inventory">
              <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h1>Fast Billing (POS)</h1>
                  <p>Search and add medicines to create instant invoices.</p>
                </div>
              </div>
              
              <div className="search-bar" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
                <LayoutDashboard size={20} />
                <input 
                  type="text" 
                  placeholder="Search medicine by name or category..." 
                  value={billingSearchQuery}
                  onChange={(e) => setBillingSearchQuery(e.target.value)}
                />
              </div>

              <div className="billing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', paddingRight: '0.5rem' }}>
                {filteredInventory.map(med => (
                  <div key={med.id} className="billing-item-card" onClick={() => addToBilling(med)} style={{ 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <h4 style={{ marginBottom: '0.25rem' }}>{med.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{med.manufacturer}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>INR {med.price.toFixed(2)}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                        In Stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="billing-summary" style={{ background: 'var(--surface)', borderRadius: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3>Current Invoice</h3>
              </div>
              
              <div className="bill-items" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {billingCart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>No items added to bill yet.</p>
                  </div>
                ) : (
                  billingCart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--background)' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>INR {item.price.toFixed(2)} x {item.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); updateBillQty(item.id, -1); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={(e) => { e.stopPropagation(); updateBillQty(item.id, 1); }} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>+</button>
                        <button onClick={(e) => { e.stopPropagation(); removeFromBilling(item.id); }} style={{ marginLeft: '0.5rem', color: 'var(--danger)', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span>INR {subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>GST (12%)</span>
                    <span>INR {tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', marginTop: '0.5rem', color: 'var(--primary)' }}>
                    <span>Grand Total</span>
                    <span>INR {total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                   <input 
                    type="text" 
                    placeholder="Customer Name" 
                    className="input-field" 
                    style={{ marginBottom: '0.5rem', borderRadius: 'var(--radius-md)' }}
                    value={billCustomer.name}
                    onChange={(e) => setBillCustomer({...billCustomer, name: e.target.value})}
                   />
                   <input 
                    type="text" 
                    placeholder="Phone Number" 
                    className="input-field" 
                    style={{ borderRadius: 'var(--radius-md)' }}
                    value={billCustomer.phone}
                    onChange={(e) => setBillCustomer({...billCustomer, phone: e.target.value})}
                   />
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={generatePDF}
                  disabled={billingCart.length === 0}
                >
                  <FileText size={20} /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Order Operations</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track and manage all customer transactions.</p>
              </div>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Customer Info</th>
                    <th>Total Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>#{order.id}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{order.transactionId}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>
                         <div style={{ fontWeight: 500 }}>{order.contactNumber}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.shippingAddress}</div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>INR {order.totalAmount.toFixed(2)}</td>
                      <td><span className="badge badge-success">{order.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>View Details</button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No orders found in the database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}


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
                  {inventory.map(item => {
                    const status = (item.totalStock || 0) === 0 ? 'Out of Stock' : (item.totalStock || 0) < 20 ? 'Low Stock' : 'In Stock';
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td>
                          {item.discountedPrice ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{item.discountedPrice}</span>
                              <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>₹{item.price}</span>
                            </div>
                          ) : (
                            <span>₹{item.price}</span>
                          )}
                        </td>
                        <td>{item.totalStock || 0} units</td>
                        <td>
                          <span className={`badge ${status === 'In Stock' ? 'badge-success' : status === 'Low Stock' ? '' : ''}`} 
                                style={{ 
                                  background: status === 'Out of Stock' ? 'rgba(239, 68, 68, 0.1)' : status === 'Low Stock' ? 'rgba(245, 158, 11, 0.1)' : '',
                                  color: status === 'Out of Stock' ? 'var(--danger)' : status === 'Low Stock' ? 'var(--warning)' : ''
                                }}>
                            {status}
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
                    );
                  })}
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
                  fetch(`${API_URL}/warehouseAdmins`, {
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
                               fetch(`${API_URL}/warehouseAdmins/${m.id}`, { method: 'DELETE' })
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
