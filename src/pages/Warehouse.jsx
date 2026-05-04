import React, { useState, useEffect, useContext } from 'react';
import { Package, MapPin, LogOut, Check, Save, ArrowLeft } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Warehouse.css';

const Warehouse = () => {
  const { user, login, logout } = useContext(AppContext);
  const [warehouseAdmin, setWarehouseAdmin] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Check if a warehouse admin is already in session
  useEffect(() => {
    const savedAdmin = localStorage.getItem('warehouseAdmin');
    if (savedAdmin) {
      const admin = JSON.parse(savedAdmin);
      setWarehouseAdmin(admin);
      fetchStock(admin.location);
    }
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch('http://localhost:5000/medicines');
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStock = async (location) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/stock?location=${location}`);
      const data = await res.json();
      setStock(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/warehouseAdmins?email=${loginData.email}&password=${loginData.password}`);
      const admins = await res.json();
      if (admins.length > 0) {
        const admin = admins[0];
        setWarehouseAdmin(admin);
        localStorage.setItem('warehouseAdmin', JSON.stringify(admin));
        fetchStock(admin.location);
      } else {
        setError('Invalid credentials for this location.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setWarehouseAdmin(null);
    localStorage.removeItem('warehouseAdmin');
    setStock([]);
  };

  const handleUpdateStock = async (stockId, newQuantity) => {
    try {
      await fetch(`http://localhost:5000/stock/${stockId}`, {
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

  if (!warehouseAdmin) {
    return (
      <div className="warehouse-login-container">
        <div className="warehouse-login-card">
          <div className="warehouse-icon-wrapper">
            <Package size={40} />
          </div>
          <h1>Warehouse Admin Login</h1>
          <p>Access your store's inventory management system.</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Store Email</label>
              <input 
                type="email" 
                placeholder="e.g. miyapur@phub.com" 
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label>Admin Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required 
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login to Store'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          {updateMsg && <div className="success-badge"><Check size={16} /> {updateMsg}</div>}
        </div>

        <div className="stock-grid">
          {stock.map(item => {
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
                  <h3>{medicine.name}</h3>
                  <p className="category">{medicine.category}</p>
                  
                  <div className="quantity-manager">
                    <label>Available Stock (Units)</label>
                    <div className="input-with-button">
                      <input 
                        type="number" 
                        defaultValue={item.quantity} 
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

        {stock.length === 0 && !loading && (
          <div className="empty-state">
            <Package size={60} />
            <h2>No items in stock</h2>
            <p>This warehouse doesn't have any items registered yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Warehouse;
