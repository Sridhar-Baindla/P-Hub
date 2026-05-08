import { useState, useEffect, useContext, useCallback } from 'react';
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { AppContext } from '../context/AppContext';
import { API_URL } from '../config';

const Cart = () => {
  const { user, token, fetchCartCount, authenticatedFetch } = useContext(AppContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(() => {
    if (!user || !token) return;
    authenticatedFetch(`${API_URL}/cart?_expand=medicine`)
      .then(res => res.json())
      .then(data => {
        setCartItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, token, authenticatedFetch]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await authenticatedFetch(`${API_URL}/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      fetchCart();
      fetchCartCount();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    try {
      await authenticatedFetch(`${API_URL}/cart/${id}`, {
        method: 'DELETE'
      });
      fetchCart();
      fetchCartCount();
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.medicine.price * item.quantity), 0);
  const deliveryFee = 50.00;
  const total = subtotal + deliveryFee;

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
        <ShoppingCart size={64} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
        <h1>Your cart is empty</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Add some medicines to your cart to see them here.</p>
        <Link to="/medicines" className="btn btn-primary">Browse Medicines</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1>Shopping Cart</h1>
      
      <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '2rem' }}>
        <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <img src={item.medicine.image} alt={item.medicine.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.25rem' }}>{item.medicine.name}</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>By PharmaLife</p>
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontWeight: 600 }}>
                    Exp: {item.medicine.expiryDate || 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.25rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={16} /></button>
                      <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.25rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{(item.medicine.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ margin: '1rem 0', height: '1px', background: 'var(--border)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontWeight: 700, fontSize: '1.25rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }} 
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
          >
            Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
