import { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useContext(AppContext);
  const [isLoginView, setIsLoginView] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isLoginView) {
        // Login Flow
        const response = await fetch(`http://localhost:5000/users?email=${formData.email}`);
        const users = await response.json();

        if (users.length > 0) {
          const user = users[0];
          if (user.password === formData.password) {
            login(user);
            onClose();
          } else {
            setErrorMsg('Invalid details. Please check your email and password.');
          }
        } else {
          setErrorMsg('Invalid details. User not found.');
        }
      } else {
        // Signup Flow
        // Check if user already exists
        const checkRes = await fetch(`http://localhost:5000/users?email=${formData.email}`);
        const existingUsers = await checkRes.json();

        if (existingUsers.length > 0) {
          setErrorMsg('User with this email already exists.');
          return;
        }

        const newUser = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'user'
        };

        const response = await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });

        const savedUser = await response.json();
        login(savedUser);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMsg('An error occurred. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLoginView ? 'Welcome Back' : 'Create an Account'}
        </h2>

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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
            {isLoginView ? 'Log In' : 'Sign Up'}
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
    </div>
  );
};

export default AuthModal;
