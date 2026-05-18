import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setErrorMsg('');
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const endpoint = isLoginView ? '/auth/login' : '/auth/register';
      const body = isLoginView 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      if (!isLoginView && !validatePassword(formData.password)) {
        setErrorMsg('Password must be 8+ chars with uppercase, lowercase, numbers & symbols.');
        setLoading(false);
        return;
      }

      // Hardcode relative path to guarantee Vite proxy matches it on all devices
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error("Non-JSON response received:", text);
        throw new Error(`Server error (${res.status}): Invalid response format.`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Authentication failed (Status: ${res.status}, Body: ${text || 'empty'})`);
      }

      // Handle successful login
      if (isLoginView) {
        const { user: userData, token: userToken } = data;
        
        // Ensure state updates and navigation happen reliably
        await login(userData, userToken);
        
        if (userData.role === 'admin') navigate('/admin');
        else if (userData.role === 'warehouse_manager') navigate('/warehouse');
        else navigate('/');
      } else {
        setIsLoginView(true);
        setErrorMsg('Registration successful! Please log in.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Auth error:', error);
      if (error.name === 'AbortError') {
        setErrorMsg('Connection timed out. Please check your internet/server.');
      } else {
        setErrorMsg(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', alignItems: 'center' }}>
      <div className="auth-card" style={{ maxWidth: '450px', width: '100%', background: 'var(--surface)', padding: 'max(1.5rem, 3vw)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{isLoginView ? 'Welcome Back' : 'Join P-Hub'}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isLoginView ? 'Sign in to access your prescriptions and orders' : 'Create an account to start ordering medicines'}
        </p>

        {errorMsg && (
          <div style={{ background: errorMsg.includes('successful') ? '#dcfce7' : '#fee2e2', color: errorMsg.includes('successful') ? '#15803d' : '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
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
                  className="auth-input"
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
                className="auth-input"
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
                className="auth-input"
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
      </div>
    </div>
  );
};

export default Login;
