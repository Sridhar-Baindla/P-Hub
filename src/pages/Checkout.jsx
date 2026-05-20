import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, CheckCircle, ArrowLeft, QrCode, History, Search, ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { API_URL } from '../config';
import './Checkout.css';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const cityPincodeMap = {
  'Hyderabad': '500001', 'Mumbai': '400001', 'Delhi': '110001',
  'Bangalore': '560001', 'Chennai': '600001', 'Pune': '411001',
  'Kolkata': '700001', 'Ahmedabad': '380001', 'Surat': '395001', 'Jaipur': '302001'
};

const Checkout = () => {
  const { user, token, fetchCartCount, authenticatedFetch } = useContext(AppContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [previousAddresses, setPreviousAddresses] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [utr, setUtr] = useState('');
  const [showPhonePeOverlay, setShowPhonePeOverlay] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '', city: '', pincode: '', phone: ''
  });

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const cartRes = await authenticatedFetch(`${API_URL}/cart?_expand=medicine`);
        const cartData = await cartRes.json();
        
        if (cartData.length === 0) {
          navigate('/cart');
          return;
        }
        setCartItems(cartData);

        const ordersRes = await authenticatedFetch(`${API_URL}/orders`);
        const ordersData = await ordersRes.json();
        
        const addresses = ordersData.map(order => ({
          fullAddress: order.shippingAddress,
          phone: order.contactNumber
        })).filter((addr, index, self) => 
          index === self.findIndex((t) => t.fullAddress === addr.fullAddress)
        ).reverse();
        
        setPreviousAddresses(addresses);
      } catch (err) {
        console.error('Error loading checkout data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, token, navigate, authenticatedFetch]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.medicine.price * item.quantity), 0);
  const deliveryFee = 0.00;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'city') {
      const filtered = Object.keys(cityPincodeMap).filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowCityDropdown(value.length > 0 && filtered.length > 0);
    }
  };

  const selectCity = (city) => {
    setFormData({ ...formData, city, pincode: cityPincodeMap[city] || formData.pincode });
    setShowCityDropdown(false);
  };

  const selectPreviousAddress = (addr) => {
    const parts = addr.fullAddress.split(', ');
    const lastPart = parts.pop() || '';
    const cityPincode = lastPart.split(' - ');
    setFormData({
      address: parts.join(', '),
      city: cityPincode[0] || '',
      pincode: cityPincode[1] || '',
      phone: addr.phone
    });
  };

  const [phonePeState, setPhonePeState] = useState('idle'); // idle, processing, success
  const [showPhonePeOverlay, setShowPhonePeOverlay] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (paymentMethod === 'PhonePe' || paymentMethod === 'Google Pay' || paymentMethod === 'Paytm') {
      const upiUrl = `upi://pay?pa=6079090876081013@ybl&pn=PHUB%20Pharmacy&am=${total.toFixed(2)}&cu=INR`;
      setQrUrl(upiUrl);
      setShowPhonePeOverlay(true);
    } else {
      processOrder();
    }
  };

  const handleVerifyUtr = () => {
    if (!utr || utr.length < 12) {
      alert("Please enter a valid 12-digit UTR/Reference Number.");
      return;
    }
    setShowPhonePeOverlay(false);
    processOrder('Pending Verification', utr);
  };

  const processOrder = async (pStatus = 'Pending', providedUtr = '') => {
    setOrderPlacing(true);

    try {
      const order = {
        items: cartItems.map(item => ({
          medicineId: item.medicineId,
          name: item.medicine.name,
          price: item.medicine.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        shippingAddress: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        contactNumber: formData.phone,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : pStatus,
        transactionId: providedUtr // Save UTR here
      };

      const res = await authenticatedFetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (!res.ok) throw new Error('Order creation failed');

      // Clear cart
      for (const item of cartItems) {
        await authenticatedFetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' });
      }

      setOrderSuccess(true);
      fetchCartCount();
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message);
    } finally {
      setOrderPlacing(false);
    }
  };

  const PhonePeOverlay = () => (
    <div className="phonepe-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(255, 255, 255, 0.98)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="phonepe-brand" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#6739b7', fontWeight: 700, fontSize: '1.5rem' }}>Complete Your Payment</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Scan with any UPI App (GPay, PhonePe, Paytm)</p>
      </div>

      <div className="qr-image-wrapper" style={{ background: '#fff', padding: '15px', borderRadius: '10px', display: 'inline-block', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <QRCodeSVG value={qrUrl} size={200} level="H" />
      </div>
      <h3 style={{ marginTop: '1rem', color: '#1f2937' }}>Amount: ₹{total.toFixed(2)}</h3>

      <div style={{ marginTop: '2rem', width: '100%', maxWidth: '300px', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#4b5563' }}>Enter 12-digit UTR / Reference No:</label>
        <input 
          type="text" 
          value={utr} 
          onChange={(e) => setUtr(e.target.value)} 
          placeholder="e.g. 312345678901" 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', marginBottom: '1rem' }}
          maxLength={12}
        />
        <button 
          onClick={handleVerifyUtr}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', background: '#22c55e' }}
        >
          Verify & Place Order
        </button>
        <button 
          onClick={() => setShowPhonePeOverlay(false)}
          className="btn"
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#6b7280', marginTop: '0.5rem' }}
        >
          Cancel
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', width: '100%', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
        100% Secure UPI Transaction
      </div>
    </div>
  );

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading...</div>;

  if (orderSuccess) {
    return (
      <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
          <CheckCircle size={80} style={{ margin: '0 auto' }} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Your transaction is secure and confirmed.</p>
        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="container checkout-container">
      {showPhonePeOverlay && PhonePeOverlay()}
      <button onClick={() => navigate('/cart')} className="back-btn">
        <ArrowLeft size={20} /> Back to Cart
      </button>
      
      <h1>Secure Checkout</h1>
      
      <div className="checkout-layout">
        <div className="checkout-form-section">
          {previousAddresses.length > 0 && (
            <section className="checkout-section recent-addresses">
              <h2 className="section-title"><History size={22} /> Suggested Addresses</h2>
              <div className="address-suggestions">
                {previousAddresses.slice(0, 2).map((addr, idx) => (
                  <div key={idx} className="address-card" onClick={() => selectPreviousAddress(addr)}>
                    <p>{addr.fullAddress}</p>
                    <small>{addr.phone}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="checkout-section">
            <h2 className="section-title"><MapPin size={22} /> Shipping Address</h2>
            <div className="form-group">
              <label>Full Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="House No, Street, Landmark" required />
            </div>
            <div className="form-row">
              <div className="form-group city-input-group">
                <label>City</label>
                <div className="input-with-icon">
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Search City..." autoComplete="off" required />
                  <Search size={16} className="input-icon" />
                </div>
                {showCityDropdown && (
                  <div className="dropdown-list">
                    {citySuggestions.map(city => (
                      <div key={city} className="dropdown-item" onClick={() => selectCity(city)}>{city}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Auto-filled" required />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2 className="section-title"><Phone size={22} /> Contact Information</h2>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit mobile number" required />
            </div>
          </section>

          <section className="checkout-section">
            <h2 className="section-title"><CreditCard size={22} /> Secure Payment</h2>
            <div className="payment-options">
              {[
                { id: 'PhonePe', name: 'PhonePe', icon: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png' },
                { id: 'Google Pay', name: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png' },
                { id: 'Paytm', name: 'Paytm', icon: 'https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.png' },
                { id: 'COD', name: 'Cash on Delivery', icon: null }
              ].map(method => (
                <div 
                  key={method.id} 
                  className={`payment-option ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => { setPaymentMethod(method.id); setShowQR(['PhonePe', 'Google Pay', 'Paytm'].includes(method.id)); }}
                >
                  <div className="radio-circle"></div>
                  <span>{method.name}</span>
                  {method.icon && <img src={method.icon} alt={method.name} className="payment-icon-img" />}
                </div>
              ))}
            </div>

            {/* Inline QR Code removed. Displayed in Overlay after Place Order */}
          </section>
        </div>

        <div className="checkout-summary-section">
          <div className="sticky-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.medicine.name} x {item.quantity}</span>
                  <span>₹{(item.medicine.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Delivery Fee</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span></div>
            <div className="summary-total"><span>Total Amount</span><span>₹{total.toFixed(2)}</span></div>
            
            <button 
              className="btn btn-primary place-order-btn" 
              onClick={handlePlaceOrder}
              disabled={orderPlacing || !formData.address || !formData.phone || !paymentMethod}
            >
              {orderPlacing ? (['PhonePe', 'Google Pay', 'Paytm'].includes(paymentMethod) ? 'Contacting Gateway...' : 'Processing...') : 'Pay & Place Order'}
            </button>
            <div className="security-badge">
              <ShieldCheck size={14} /> 256-bit SSL Secure Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
