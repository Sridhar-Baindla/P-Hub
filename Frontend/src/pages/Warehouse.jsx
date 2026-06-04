import { useState, useEffect, useCallback, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, MapPin, LogOut, User, X } from 'lucide-react';
import './Warehouse.css';
import { API_URL } from '../config';
import { AppContext } from '../context/AppContext';

// Import Layout Components
import Sidebar from '../components/warehouse/Sidebar';

// Import Feature Modules
import DashboardOverview from '../components/warehouse/DashboardOverview';
import SalesManagement from '../components/warehouse/SalesManagement';
import PurchaseManagement from '../components/warehouse/PurchaseManagement';
import InventoryManagement from '../components/warehouse/InventoryManagement';
import ProductCatalogue from '../components/warehouse/ProductCatalogue';
import CRM from '../components/warehouse/CRM';
import DistributorManagement from '../components/warehouse/DistributorManagement';
import FinancialAccounting from '../components/warehouse/FinancialAccounting';
import ReportsMIS from '../components/warehouse/ReportsMIS';
import QRBarcode from '../components/warehouse/QRBarcode';
import MultiStore from '../components/warehouse/MultiStore';
import Logistics from '../components/warehouse/Logistics';
import Marketplace from '../components/warehouse/Marketplace';
import MobileAppSync from '../components/warehouse/MobileAppSync';
import Integrations from '../components/warehouse/Integrations';
import SecurityAdmin from '../components/warehouse/SecurityAdmin';
import ClinicFeatures from '../components/warehouse/ClinicFeatures';
import SahaAI from '../components/warehouse/SahaAI';

const Warehouse = () => {
  const { user: warehouseAdmin, logout: handleLogout, showProfile, setShowProfile, token } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Shared State (mainly used by Inventory and Logistics modules initially)
  const [orders, setOrders] = useState([]);
  const [otpInputs] = useState({});
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
  const [updatingItems, setUpdatingItems] = useState({});

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

  // Logistics Handlers
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

  const verifyOTP = async (orderId, auto = false) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          otp: auto ? 'AUTO' : otpInputs[orderId],
          skipOTP: auto 
        })
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

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ deliveryStatus: status })
      });
      if (res.ok) {
        setUpdateMsg(`Order status updated to ${status}!`);
        fetchOrders();
        setTimeout(() => setUpdateMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inventory Handlers
  const handleUpdateStock = async (stockId, newQuantity) => {
    setUpdatingItems(prev => ({ ...prev, [stockId]: true }));
    try {
      const quantity = parseInt(newQuantity) || 0;
      const res = await fetch(`${API_URL}/stock/${stockId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
        const medRes = await fetch(`${API_URL}/medicines/${editingStock.medicineId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: newStock.name, description: newStock.description, manufacturer: newStock.manufacturer,
            price: parseFloat(newStock.price) || 0, discountedPrice: newStock.discountedPrice ? parseFloat(newStock.discountedPrice) : null,
            expiryDate: newStock.expiryDate, category: newStock.category, ...(newStock.image && { image: newStock.image })
          })
        });
        if (!medRes.ok) throw new Error('Failed to update medicine details');

        const stockRes = await fetch(`${API_URL}/stock/${editingStock.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ quantity: parseInt(newStock.quantity) || 0 })
        });
        if (!stockRes.ok) throw new Error('Failed to update stock quantity');
        setUpdateMsg('Item details and stock updated!');
      } else {
        const response = await fetch(`${API_URL}/admin/add-inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            ...newStock, price: parseFloat(newStock.price) || 0,
            discountedPrice: newStock.discountedPrice ? parseFloat(newStock.discountedPrice) : null,
            quantity: parseInt(newStock.quantity) || 0, location: warehouseAdmin.location
          })
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Failed to add inventory');
        setUpdateMsg('New medicine and stock added successfully!');
      }
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
      name: medicine.name, description: medicine.description || '', manufacturer: medicine.manufacturer || '',
      price: medicine.price || 0, discountedPrice: medicine.discountedPrice || '', expiryDate: medicine.expiryDate || '',
      category: medicine.category || 'General', quantity: item.quantity || 0, image: medicine.image || ''
    });
    setShowAddModal(true);
  };

  const handleSelectExisting = (med) => {
    setNewStock({
      ...newStock, medicineId: med.id || med._id, name: med.name, description: med.description || '',
      manufacturer: med.manufacturer || '', price: med.price || 0, discountedPrice: med.discountedPrice || '',
      expiryDate: med.expiryDate || '', category: med.category || 'General', image: med.image || ''
    });
    setShowExistingMeds(false);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewStock({ ...newStock, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        handleImageUpload(items[i].getAsFile());
      }
    }
  };

  if (!warehouseAdmin || warehouseAdmin.role !== 'warehouse_manager') {
    return <Navigate to="/warehouse/login" replace />;
  }

  const filteredStock = stock.filter(item => {
    const q = searchQuery.toLowerCase();
    return (item.name || '').toLowerCase().includes(q) || 
           (item.description || '').toLowerCase().includes(q) ||
           (item.manufacturer || '').toLowerCase().includes(q) ||
           (item.category || '').toLowerCase().includes(q) ||
           (item.boxNumber || '').toLowerCase().includes(q) ||
           (item.expiryDate && item.expiryDate.toLowerCase().includes(q)) ||
           (item.quantity || 0).toString().includes(q);
  });

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'sales': return <SalesManagement />;
      case 'purchase': return <PurchaseManagement />;
      case 'inventory': 
        return <InventoryManagement 
          warehouseAdmin={warehouseAdmin} stock={stock} setStock={setStock} medicines={medicines}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} updateMsg={updateMsg} setUpdateMsg={setUpdateMsg}
          loading={loading} showAddModal={showAddModal} setShowAddModal={setShowAddModal}
          editingStock={editingStock} setEditingStock={setEditingStock} newStock={newStock} setNewStock={setNewStock}
          showExistingMeds={showExistingMeds} setShowExistingMeds={setShowExistingMeds} updatingItems={updatingItems}
          handleUpdateStock={handleUpdateStock} handleAddStock={handleAddStock} handleOpenEdit={handleOpenEdit}
          handleSelectExisting={handleSelectExisting} handleImageUpload={handleImageUpload} handlePaste={handlePaste}
          filteredStock={filteredStock} token={token}
        />;
      case 'catalogue': return <ProductCatalogue />;
      case 'crm': return <CRM />;
      case 'distributor': return <DistributorManagement />;
      case 'finance': return <FinancialAccounting />;
      case 'reports': return <ReportsMIS />;
      case 'qr_barcode': return <QRBarcode />;
      case 'multistore': return <MultiStore />;
      case 'logistics': 
        return <Logistics 
          orders={orders} updateMsg={updateMsg} approveOrder={approveOrder} 
          verifyOTP={verifyOTP} updateDeliveryStatus={updateDeliveryStatus} 
        />;
      case 'marketplace': return <Marketplace />;
      case 'mobile': return <MobileAppSync />;
      case 'integrations': return <Integrations />;
      case 'security': return <SecurityAdmin />;
      case 'clinic': return <ClinicFeatures />;
      case 'ai': return <SahaAI />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="warehouse-dashboard" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="warehouse-header" style={{ flexShrink: 0, zIndex: 10 }}>
        <div className="container header-flex" style={{ maxWidth: '100%', padding: '0 2rem' }}>
          <div className="store-info">
            <Package size={24} color="var(--primary)" />
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => setShowProfile(true)}>
              <div className="manager-avatar" style={{ 
                width: '32px', height: '32px', background: 'var(--primary-light)', borderRadius: '50%', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 600
              }}>
                {warehouseAdmin.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{warehouseAdmin.location} Logistics Hub</h2>
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>Active Manager: {warehouseAdmin.name}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setShowProfile(true)} className="nav-link profile-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
              <User size={18} /> Profile
            </button>
            <button onClick={handleLogout} className="logout-link">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="warehouse-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="warehouse-main-content" style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--background)' }}>
          {renderActiveModule()}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setShowProfile(false)}>
              <X size={24} />
            </button>
            <div style={{ 
              width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '50%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', 
              fontSize: '2rem', fontWeight: 700, margin: '0 auto 1.5rem'
            }}>
              {warehouseAdmin.name.charAt(0)}
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Manager Profile</h2>
            <div style={{ textAlign: 'left', background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <div style={{ fontWeight: 600 }}>{warehouseAdmin.name}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Email</label>
                <div style={{ fontWeight: 600 }}>{warehouseAdmin.email}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Location</label>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--primary)" /> {warehouseAdmin.location}
                </div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setShowProfile(false)}>
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
