import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import './MobilePaymentSimulator.css'; // We'll create some basic styles for mobile view

const MobilePaymentSimulator = () => {
  const { txnId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0.00';
  const method = searchParams.get('method') || 'UPI';

  const [status, setStatus] = useState('pending'); // pending, processing, success

  const handleApprove = () => {
    setStatus('processing');
    
    // Connect to WebSocket
    const socketUrl = API_URL || window.location.origin;
    const socket = io(socketUrl);

    // Emit the simulated webhook directly to the socket server
    fetch(`${API_URL || window.location.origin}/payments/simulate-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txnId, status: 'success' })
    }).then(res => {
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          socket.disconnect();
          // optionally close window or show a final message
        }, 3000);
      } else {
        alert('Failed to send webhook');
        setStatus('pending');
      }
    }).catch(err => {
      console.error(err);
      alert('Error connecting to server');
      setStatus('pending');
    });
  };

  if (status === 'success') {
    return (
      <div className="mobile-payment-container success">
        <CheckCircle size={80} color="#22c55e" />
        <h2>Payment Successful!</h2>
        <p>You can now check your desktop screen.</p>
        <p className="txn-id">Txn ID: {txnId}</p>
      </div>
    );
  }

  return (
    <div className="mobile-payment-container">
      <div className="payment-header">
        <h2>{method} Payment</h2>
        <p>Paying P-Hub Pharmacy</p>
      </div>
      
      <div className="payment-amount">
        <h1>₹{amount}</h1>
      </div>

      <div className="payment-details">
        <div className="detail-row">
          <span>To</span>
          <strong>P-Hub Merchant Account</strong>
        </div>
        <div className="detail-row">
          <span>Transaction ID</span>
          <strong>{txnId}</strong>
        </div>
      </div>

      <button 
        className={`approve-btn ${status === 'processing' ? 'processing' : ''}`}
        onClick={handleApprove}
        disabled={status === 'processing'}
      >
        {status === 'processing' ? 'Processing...' : `Pay ₹${amount}`}
      </button>

      <div className="secure-footer">
        <ShieldCheck size={16} /> 100% Secure Transaction
      </div>
    </div>
  );
};

export default MobilePaymentSimulator;
