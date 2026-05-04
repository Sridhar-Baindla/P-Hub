import React, { useState, useEffect, useContext } from 'react';
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { API_URL } from '../config';

const Cart = () => {
  const { user, fetchCartCount } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = () => {
    fetch(`${API_URL}/cart?_expand=medicine&userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setCartItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdateQuantity = async (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    
    await fetch(`${API_URL}/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });
    fetchCart();
    fetchCartCount();
  };

  const handleRemove = async (id) => {
    await fetch(`${API_URL}/cart/${id}`, {
      method: 'DELETE'
    });
    fetchCart();
    fetchCartCount();
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.medicine.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading cart...</div>;
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Please login to view your cart</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <ShoppingCart size={40} />
              </div>
              <h2>Your cart is empty</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link to="/medicines" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div>
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.medicine.image} alt={item.medicine.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.medicine.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>₹{item.medicine.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                      ₹{(item.medicine.price * item.quantity).toFixed(2)}
                    </div>
                    <button onClick={() => handleRemove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="cart-summary" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.125rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={cartItems.length === 0}>
            Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
