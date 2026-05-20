import { useState, useContext, useEffect } from 'react';
import { User, MapPin, Package, LogOut, Download, CheckCircle, Clock } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { generateInvoice } from '../utils/invoiceGenerator';

const Profile = () => {
  const { user, logout, authenticatedFetch, token } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'orders' && user && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      authenticatedFetch(`${API_URL}/orders`)
        .then(res => res.json())
        .then(data => {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab, user, token, authenticatedFetch]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Please login to view your profile</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>Log In</button>
      </div>
    );
  }

  return (
    <div className="container profile-layout" style={{ padding: '4rem 0' }}>
      <aside className="profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {user.name.substring(0, 2)}
          </div>
          <h3 style={{ marginBottom: '0.25rem' }}>{user.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.email}</p>
          <span className="badge badge-success" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.7rem' }}>
            {user.role === 'admin' ? 'Administrator' : 'Verified Member'}
          </span>
        </div>
        
        <button onClick={() => setActiveTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'profile' ? 'var(--primary)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
          <User size={20} /> My Profile
        </button>
        <button onClick={() => setActiveTab('orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
          <Package size={20} /> My Orders
        </button>
        <button onClick={() => setActiveTab('addresses')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: activeTab === 'addresses' ? 'var(--primary)' : 'transparent', color: activeTab === 'addresses' ? 'white' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
          <MapPin size={20} /> Saved Addresses
        </button>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: 'var(--danger)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontWeight: 500, marginTop: 'auto', background: 'transparent', cursor: 'pointer', border: 'none' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="profile-main" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: '500px' }}>
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Personal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" className="input-field" defaultValue={user.name} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                <input type="email" className="input-field" defaultValue={user.email} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: '#f8f9fa' }} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => alert('Profile updated!')}>Save Changes</button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Order History</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', background: 'var(--background)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Order #{order.id}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Placed on {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: order.status === 'Confirmed' ? 'var(--success)' : 'var(--primary)', fontWeight: 600 }}>
                          {order.status === 'Confirmed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {order.status}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setTrackingOrder(order)}
                            style={{ 
                              background: 'var(--primary)', 
                              border: 'none', 
                              color: 'white', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.4rem',
                              fontSize: '0.85rem', 
                              fontWeight: 600,
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-md)'
                            }}
                          >
                            <Package size={14} /> Track Order
                          </button>
                          <button 
                            onClick={() => generateInvoice(order)}
                            style={{ 
                              background: 'rgba(37, 99, 235, 0.1)', 
                              border: 'none', 
                              color: 'var(--primary)', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.4rem',
                              fontSize: '0.85rem', 
                              fontWeight: 600,
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-md)',
                            }}
                            title="Download PDF Invoice"
                          >
                            <Download size={14} /> Invoice
                          </button>
                        </div>
                      </div>
                    </div>

                    {order.otp && order.deliveryStatus === 'Approved' && (
                      <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>DELIVERY VERIFICATION OTP</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '4px', color: 'var(--primary)' }}>{order.otp}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Share this with the delivery partner to confirm handover</div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total Amount</span>
                      <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Package size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
                <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>Browse Medicines</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Saved Addresses</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your delivery locations for faster checkout.</p>
            {/* Address list would go here, similar to suggested addresses in checkout */}
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>+ Add New Address</button>
          </div>
        )}
      </main>

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setTrackingOrder(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
            <h2 style={{ marginBottom: '1.5rem' }}>Track Order #{trackingOrder.id}</h2>
            
            <div style={{ marginLeft: '1rem', position: 'relative' }}>
              {/* Timeline Line */}
              <div style={{ position: 'absolute', left: '11px', top: '20px', bottom: '40px', width: '2px', background: 'var(--border)', zIndex: 1 }}></div>
              
              {[
                { label: 'Order Confirmed', status: ['Pending Review', 'Approved', 'Shipped', 'Out for Delivery', 'Delivered'] },
                { label: 'Order Shipped', status: ['Shipped', 'Out for Delivery', 'Delivered'] },
                { label: 'Out for Delivery', status: ['Out for Delivery', 'Delivered'] },
                { label: 'Delivered', status: ['Delivered'] }
              ].map((step, idx) => {
                const isCompleted = trackingOrder.deliveryStatus ? step.status.includes(trackingOrder.deliveryStatus) : idx === 0;
                return (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '40px', paddingBottom: '2.5rem', zIndex: 2 }}>
                    <div style={{ 
                      position: 'absolute', left: '0', top: '4px', width: '24px', height: '24px', borderRadius: '50%', 
                      background: isCompleted ? 'var(--primary)' : 'var(--surface)', 
                      border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isCompleted && <CheckCircle size={14} color="white" />}
                    </div>
                    <div style={{ fontWeight: isCompleted ? 700 : 500, color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setTrackingOrder(null)}>Close Tracking</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
