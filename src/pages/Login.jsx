import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
  const { login, checkDeviceLimit } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginView) {
        // 1. Check Hardcoded Admin
        if (formData.email === 'admin@phub.com' && formData.password === 'admin123') {
          const adminUser = { name: 'Super Admin', email: formData.email, role: 'admin', id: 'admin-001' };
          
          const canLogin = await checkDeviceLimit(adminUser.id);
          if (!canLogin) {
            setShowLimitPopup(true);
            setLoading(false);
            return;
          }

          login(adminUser);
          navigate('/admin');
          return;
        }

        // 2. Check Customers
        const userRes = await fetch(`${API_URL}/users?email=${formData.email}`);
        if (!userRes.ok) throw new Error('Server error');
        const users = await userRes.json();

        if (users.length > 0) {
          const user = users[0];
          if (user.password === formData.password) {
            const canLogin = await checkDeviceLimit(user.id);
            if (!canLogin) {
              setShowLimitPopup(true);
              setLoading(false);
              return;
            }

            login({ ...user, role: user.role || 'customer' });
            navigate('/');
            return;
          } else {
            setErrorMsg('Invalid password.');
            setLoading(false);
            return;
          }
        }

        // 3. Check Warehouse Managers
        const warehouseRes = await fetch(`${API_URL}/warehouseAdmins?email=${formData.email}`);
        if (!warehouseRes.ok) throw new Error('Server error');
        const admins = await warehouseRes.json();

        if (admins.length > 0) {
          const admin = admins[0];
          if (admin.password === formData.password) {
            const canLogin = await checkDeviceLimit(admin.id);
            if (!canLogin) {
              setShowLimitPopup(true);
              setLoading(false);
              return;
            }

            // Log in as warehouse manager
            localStorage.setItem('warehouseAdmin', JSON.stringify(admin));
            // Also update global user state so header updates
            login({ ...admin, role: 'warehouse_manager' });
            navigate('/warehouse');
            return;
          } else {
            setErrorMsg('Invalid password.');
            setLoading(false);
            return;
          }
        }

        setErrorMsg('Invalid details. Account not found.');
      } else {
        if (!validatePassword(formData.password)) {
          setErrorMsg('Password must be 8+ chars with uppercase, lowercase, numbers & symbols.');
          setLoading(false);
          return;
        }

        const checkRes = await fetch(`${API_URL}/users?email=${formData.email}`);
        if (!checkRes.ok) throw new Error('Server error');
        const existingUsers = await checkRes.json();

        if (existingUsers.length > 0) {
          setErrorMsg('Email already registered.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role: 'user' })
        });

        const savedUser = await response.json();
        login(savedUser);
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMsg(error.message === 'Failed to fetch' 
        ? `Cannot connect to server at ${API_URL}. Please ensure the backend is running and accessible from this device.` 
        : 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="auth-card" style={{ maxWidth: '450px', width: '100%', background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{isLoginView ? 'Welcome Back' : 'Join P-Hub'}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isLoginView ? 'Sign in to access your prescriptions and orders' : 'Create an account to start ordering medicines'}
        </p>

        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLoginView && (
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                value={formData.password}
                onChange={handleChange}
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : (isLoginView ? 'Log In' : 'Sign Up')} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLoginView(!isLoginView)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        {showLimitPopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Lock size={30} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--navy)' }}>Device Limit Reached</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                You are currently logged in on 3 other devices. Please log out from one of those devices to log in here.
              </p>
              <button 
                onClick={() => setShowLimitPopup(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
