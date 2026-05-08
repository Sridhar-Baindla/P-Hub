import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Lock, ShieldCheck, Mail, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const { login, checkDeviceLimit } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // In a real app, this would be a secure endpoint
      if (formData.email === 'admin@phub.com' && formData.password === 'admin123') {
        const adminUser = {
          name: 'Super Admin',
          email: formData.email,
          role: 'admin',
          id: 'admin-001'
        };

        login(adminUser);
        navigate('/admin');
      } else {
        setErrorMsg('Invalid admin credentials.');
      }
    } catch (error) {
      setErrorMsg('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#0f172a', color: 'white', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '60px', height: '60px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldCheck size={32} color="#fbbf24" />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Gateway</h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Authorized Personnel Only. Please verify your identity.
        </p>

        {errorMsg && (
          <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #991b1b' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Admin ID / Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                name="email"
                className="form-input"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: 'var(--radius-md)', outline: 'none' }}
                placeholder="admin@phub.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Secret Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: 'var(--radius-md)', outline: 'none' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1rem', background: '#fbbf24', color: '#000', fontWeight: 700, border: 'none' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
