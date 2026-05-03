import React, { useState, useContext } from 'react';
import { User, MapPin, Package, Heart, LogOut } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Please login to view your profile</h2>
      </div>
    );
  }

  const handleSave = () => {
    alert("Profile saved successfully!");
  };

  return (
    <div className="container profile-layout" style={{ padding: '4rem 0' }}>
      <aside className="profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {user.name.substring(0, 2)}
          </div>
          <h3 style={{ marginBottom: '0.25rem' }}>{user.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.email}</p>
        </div>
        
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'profile' ? 'var(--primary)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500 }}
        >
          <User size={20} /> My Profile
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500 }}
        >
          <Package size={20} /> My Orders
        </button>
        <button 
          onClick={() => setActiveTab('addresses')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'addresses' ? 'var(--primary)' : 'transparent', color: activeTab === 'addresses' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500 }}
        >
          <MapPin size={20} /> Saved Addresses
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'wishlist' ? 'var(--primary)' : 'transparent', color: activeTab === 'wishlist' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500 }}
        >
          <Heart size={20} /> Wishlist
        </button>
        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: 'var(--danger)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500, marginTop: 'auto', background: 'transparent', cursor: 'pointer', border: 'none' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="profile-main" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Personal Information</h2>
            <div className="profile-grid">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" defaultValue={user.name} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" defaultValue={user.email} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={handleSave}>Save Changes</button>
          </div>
        )}
        {activeTab === 'orders' && (
          <div>
            <h2>My Orders</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No orders found.</p>
          </div>
        )}
        {activeTab === 'addresses' && (
          <div>
            <h2>Saved Addresses</h2>
            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="badge badge-success" style={{position: 'relative', top: '0', right: '0'}}>Home</span>
                <button style={{ color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
              </div>
              <p style={{ fontWeight: 500 }}>{user.name}</p>
              <p style={{ color: 'var(--text-secondary)' }}>123 Main St, Apt 4B<br/>New York, NY 10001<br/>United States</p>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>+ Add New Address</button>
          </div>
        )}
        {activeTab === 'wishlist' && (
          <div>
            <h2>Wishlist</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Your wishlist is empty.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
