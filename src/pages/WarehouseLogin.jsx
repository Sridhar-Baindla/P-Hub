import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, MapPin, Eye, EyeOff } from 'lucide-react';
import './Warehouse.css';

import { API_URL } from '../config';

const WarehouseLogin = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/warehouseAdmins?email=${loginData.email}&password=${loginData.password}`);
      if (!res.ok) throw new Error('Server error');
      const admins = await res.json();
      if (admins.length > 0) {
        const admin = admins[0];
        localStorage.setItem('warehouseAdmin', JSON.stringify(admin));
        navigate('/warehouse');
      } else {
        setError('Invalid credentials for this location.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="warehouse-login-container">
      <div className="warehouse-login-card">
        <div className="warehouse-icon-wrapper">
          <Package size={40} />
        </div>
        <h1>Warehouse Hub</h1>
        <p>Login to manage your store's inventory and stock levels.</p>
        
        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Store Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="sridharshetty282002@gmail.com" 
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required 
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Manager Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>}
          <button type="submit" className="btn btn-primary login-btn" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Warehouse'}
          </button>
        </form>
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={14} /> Only for registered warehouse holders
        </div>
      </div>
    </div>
  );
};

export default WarehouseLogin;
