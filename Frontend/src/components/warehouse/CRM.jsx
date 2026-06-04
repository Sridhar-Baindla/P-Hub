import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MessageSquare, Gift, Filter, Clock } from 'lucide-react';
import { API_URL } from '../../config';

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_URL}/customers`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setCustomers(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users color="var(--primary)" /> CRM & Loyalty
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage patient profiles, purchase history, and reward points</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, overflow: 'hidden' }}>
        {/* Main List */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search by Patient Name or Phone Number..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
            </div>
            <button className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Filter size={16} /> Filter Segment
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--background)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Patient Details</th>
                  <th style={{ padding: '1rem' }}>Total Visits</th>
                  <th style={{ padding: '1rem' }}>Lifetime Spend</th>
                  <th style={{ padding: '1rem' }}>Loyalty Points</th>
                  <th style={{ padding: '1rem' }}>Last Visit</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-bg">
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name || 'Guest Customer'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <Phone size={12}/> {c.phone}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{c.totalVisits}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>₹{c.totalSpent?.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Gift size={14}/> {c.loyaltyPoints}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> {c.lastVisit || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button className="btn" style={{ padding: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)' }}>
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No customers found. Generate invoices to build your database!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRM;
