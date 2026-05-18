import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Package, Mail, Lock, MapPin, Eye, EyeOff } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Warehouse.css';

const WarehouseLogin = () => {
  const { user, login } = useContext(AppContext);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user && user.role === 'warehouse_manager') {
    return <Navigate to="/warehouse" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Hardcode relative path to guarantee Vite proxy matches it on all devices
      const res = await fetch('/auth/warehouse/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error("Non-JSON response received:", text);
        throw new Error(`Server error (${res.status}): Invalid response format.`, { cause: err });
      }

      if (!res.ok) throw new Error(data.error || `Login failed (Status: ${res.status}, Body: ${text || 'empty'})`);

      const { token, admin } = data;

      // Await login to ensure context and localStorage are fully updated
      await login(admin, token);
      navigate('/warehouse');
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
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
                onChange={(e) => {
                  setLoginData({ ...loginData, email: e.target.value });
                  if (error) setError('');
                }}
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
                onChange={(e) => {
                  setLoginData({ ...loginData, password: e.target.value });
                  if (error) setError('');
                }}
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
          {error && <div className="error-msg" style={{ marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>}
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
