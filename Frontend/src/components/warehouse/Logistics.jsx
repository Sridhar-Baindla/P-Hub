import React from 'react';
import { Check } from 'lucide-react';

const Logistics = ({ orders, updateMsg, approveOrder, verifyOTP, updateDeliveryStatus }) => {
  return (
    <div className="module-container">
      <div className="dashboard-controls">
        <div>
          <h1>Order Fulfillment & Logistics (VitRun)</h1>
          <p>Review, approve, and verify delivery for customer orders.</p>
        </div>
        {updateMsg && <div className="success-badge"><Check size={16} /> {updateMsg}</div>}
      </div>

      <div className="data-table-container" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ background: 'var(--background)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Customer Info</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Items</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Approval Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(o => o.status === 'Confirmed').map(order => (
              <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>#{order.id}</td>
                <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.contactNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.shippingAddress}</div>
                </td>
                <td style={{ padding: '1rem' }}>{(order.items || []).length} items</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>₹{order.totalAmount}</td>
                <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${order.deliveryStatus === 'Approved' ? 'success' : order.deliveryStatus === 'Delivered' ? 'primary' : 'warning'}`}>
                      {order.deliveryStatus || 'Pending Review'}
                    </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {!order.deliveryStatus || order.deliveryStatus === 'Pending Review' ? (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => approveOrder(order.id)}>
                      Approve Order
                    </button>
                  ) : order.deliveryStatus === 'Approved' ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#3b82f6', color: 'white' }} onClick={() => updateDeliveryStatus(order.id, 'Shipped')}>
                        Mark Shipped
                      </button>
                    </div>
                  ) : order.deliveryStatus === 'Shipped' ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#f59e0b', color: 'white' }} onClick={() => updateDeliveryStatus(order.id, 'Out for Delivery')}>
                        Out for Delivery
                      </button>
                    </div>
                  ) : order.deliveryStatus === 'Out for Delivery' ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => verifyOTP(order.id, true)}>
                        Complete Handover
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Order Handover Complete</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logistics;
