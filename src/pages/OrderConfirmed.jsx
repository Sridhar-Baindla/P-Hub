import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Phone, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import './OrderConfirmed.css';

const OrderConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(7);
  const [paused, setPaused] = useState(false);

  // Retrieve state passed from Checkout
  const orderDetails = location.state || {};
  const {
    orderId = 'N/A',
    transactionId = 'N/A',
    total = 0,
    shippingAddress = 'N/A',
    contactNumber = 'N/A',
    items = [],
    paymentMethod = 'UPI'
  } = orderDetails;

  useEffect(() => {
    if (paused) return;

    if (countdown === 0) {
      navigate('/profile?tab=orders');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate, paused]);

  const handleGoToOrders = () => {
    navigate('/profile?tab=orders');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="order-confirmed-container container">
      <div className="success-banner">
        <div className="checkmark-wrapper">
          <CheckCircle size={80} className="animated-checkmark" />
        </div>
        <h1 className="text-gradient">Order Confirmed!</h1>
        <p className="subtitle">Thank you for choosing P-Hub Pharmacy. Your order is being processed.</p>
      </div>

      <div className="order-details-card card">
        <div className="card-header">
          <h2>Order Summary</h2>
          <span className="order-id-badge">Order ID: #{orderId}</span>
        </div>

        <div className="details-grid">
          <div className="detail-section">
            <h3><ShoppingBag size={18} /> Items Ordered</h3>
            <div className="items-list">
              {items.map((item, idx) => (
                <div key={idx} className="item-row">
                  <span className="item-name-qty">{item.name} <span className="qty">x{item.quantity}</span></span>
                  <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="total-row">
                <span>Total Amount Paid</span>
                <span className="grand-total">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3><MapPin size={18} /> Delivery Details</h3>
            <p className="shipping-address">{shippingAddress}</p>
            <p className="contact-number"><Phone size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> {contactNumber}</p>
          </div>

          <div className="detail-section">
            <h3><CreditCard size={18} /> Payment Information</h3>
            <p className="payment-info">Method: <strong>{paymentMethod}</strong></p>
            <p className="payment-info">Txn ID: <code className="txn-code">{transactionId}</code></p>
            <p className="payment-info">Status: <span className="status-paid">Paid</span></p>
          </div>
        </div>

        <div className="date-stamped">
          <Calendar size={16} /> Placed on {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      <div className="action-footer">
        <div className="redirect-info">
          <span>
            {paused ? (
              "Automatic redirect paused."
            ) : (
              `Redirecting to "My Orders" in ${countdown} seconds...`
            )}
          </span>
          <button onClick={() => setPaused(!paused)} className="btn-link">
            {paused ? "Resume Auto-redirect" : "Pause"}
          </button>
        </div>

        <div className="btn-group">
          <button onClick={handleGoToOrders} className="btn btn-primary">
            View My Orders <ArrowRight size={18} />
          </button>
          <button onClick={handleContinueShopping} className="btn btn-secondary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
