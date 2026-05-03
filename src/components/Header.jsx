import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pill, ShoppingCart, User, Search, Bell, X, LogOut, Check, Menu } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, login, logout, cartCount } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    // Fetch notifications
    if (user) {
      fetch(`http://localhost:5000/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      fetch(`http://localhost:5000/medicines?name_like=${query}`)
        .then(res => res.json())
        .then(data => setSearchResults(data));
    } else {
      setSearchResults([]);
    }
  };

  const markAsRead = (id) => {
    fetch(`http://localhost:5000/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true })
    }).then(() => {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    });
  };

  const markAllAsRead = () => {
    const unread = notifications.filter(n => !n.read);
    Promise.all(unread.map(n => 
      fetch(`http://localhost:5000/notifications/${n.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
    )).then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    });
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setNotifications([]);
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar">
      <div className="container nav-content relative">
        <Link to="/" className="logo">
          <Pill size={28} color="var(--primary)" />
          P-Hub
        </Link>
        
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" className={`nav-link ${location.pathname.startsWith('/about') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/medicines" className={`nav-link ${location.pathname.startsWith('/medicines') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Medicines</Link>
          <Link to="/prescription" className={`nav-link ${location.pathname.startsWith('/prescription') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Upload Prescription</Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
          )}
        </nav>
        
        <div className="nav-actions">
          <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Search */}
          <div className="icon-wrapper">
            <button className="icon-btn" aria-label="Search" onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? <X size={20} /> : <Search size={20} />}
            </button>
            {showSearch && (
              <div className="dropdown-menu" style={{ right: 'auto', left: '-250px' }}>
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <div style={{ marginTop: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {searchResults.map(item => (
                      <Link 
                        key={item.id} 
                        to="/medicines" 
                        className="dropdown-item"
                        onClick={() => setShowSearch(false)}
                      >
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>${item.price.toFixed(2)}</div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchQuery.length > 2 && searchResults.length === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No medicines found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="icon-wrapper">
            <button className="icon-btn" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="badge">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="dropdown-menu">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '1rem 0' }}>No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div style={{ fontSize: '0.9rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="icon-wrapper" aria-label="Cart" style={{ textDecoration: 'none' }}>
            <div className="icon-btn">
              <ShoppingCart size={20} />
            </div>
            {cartCount > 0 && (
              <span className="badge">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login / User Profile */}
          {user ? (
            <div className="icon-wrapper" style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="user-avatar" title="Profile">
                  {user.name.charAt(0)}
                </div>
              </Link>
              <button onClick={handleLogout} className="icon-btn" aria-label="Logout" title="Logout" style={{ color: 'var(--accent)' }}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <User size={18} />
              <span style={{ opacity: 0.7, fontWeight: 400 }}>Username</span>
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

export default Header;
