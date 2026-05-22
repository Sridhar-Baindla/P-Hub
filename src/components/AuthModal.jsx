import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { API_URL } from '../config';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, checkDeviceLimit } = useContext(AppContext);
  const [isLoginView, setIsLoginView] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg('');
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setShowLimitReached(false);
    setLoading(true);

    try {
      if (isLoginView) {
        // Login Flow
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const text = await response.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          const preview = text.substring(0, 100).replace(/\n/g, ' ');
          throw new Error(`Server error (${response.status}): Expected JSON but received HTML/Text. Content: ${preview}...`);
        }

        if (!response.ok) {
          throw new Error(data.error || `Authentication failed with status ${response.status}`);
        }
        const canLogin = await checkDeviceLimit(data.user.id);

        if (!canLogin) {
          setShowLimitReached(true);
          setLoading(false);
          return;
        }

        // Await login to ensure session is fully established
        await login(data.user, data.token);
        onClose();
        
        // Redirection based on role
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'warehouse_manager') navigate('/warehouse');
      } else {
        // Signup Flow
        if (!validatePassword(formData.password)) {
          setErrorMsg('Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'user'
          })
        });

        const text = await response.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          throw new Error(`Server error (${response.status}): Invalid response format.`);
        }

        if (!response.ok) {
          throw new Error(data.error || `Failed to create account (Status: ${response.status}, Body: ${text || 'empty'})`);
        }

        await login(data.user, data.token);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMsg(error.message === 'Failed to fetch'
        ? `Cannot connect to server at ${API_URL}. Please ensure the backend is running and accessible from this device.`
        : error.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLoginView ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {showLimitReached && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center' }}>
            <strong>Device Limit Reached</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>You are logged in on 3 other devices. Please log out from one to continue.</p>
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLoginView && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isLoginView ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          {isLoginView ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLoginView(false); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLoginView(true); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
