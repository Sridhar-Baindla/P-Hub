import React from 'react';
import { Link, Zap, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

const Integrations = () => {
  const plugins = [
    { name: 'Tally ERP 9', type: 'Accounting', status: 'Connected', desc: 'Sync daily ledgers, sales, and purchases to Tally.', icon: '📊', color: 'var(--success)' },
    { name: 'ONDC Network', type: 'Marketplace', status: 'Available', desc: 'List your pharmacy inventory on the ONDC platform.', icon: '🛒', color: 'var(--text-secondary)' },
    { name: 'Razorpay POS', type: 'Payments', status: 'Connected', desc: 'Accept UPI and Card payments directly from the billing screen.', icon: '💳', color: 'var(--success)' },
    { name: 'EkaCare EMR', type: 'Clinical', status: 'Error', desc: 'Fetch digital prescriptions directly from EkaCare doctors.', icon: '🩺', color: 'var(--error)' },
    { name: 'WhatsApp Business', type: 'Communication', status: 'Available', desc: 'Send automated refill reminders and invoices via WhatsApp.', icon: '💬', color: 'var(--text-secondary)' },
    { name: 'Dunzo Delivery', type: 'Logistics', status: 'Available', desc: 'Automate local deliveries for app orders via Dunzo.', icon: '🛵', color: 'var(--text-secondary)' }
  ];

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link color="var(--primary)" /> API & Integrations
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Connect your pharmacy with third-party software and networks</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
        {plugins.map((p, idx) => (
          <div key={idx} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', width: '50px', height: '50px', background: 'var(--background)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)' }}>
                  {p.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{p.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.type}</span>
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
              {p.desc}
            </p>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: p.color }}>
                {p.status === 'Connected' && <ShieldCheck size={16} />}
                {p.status === 'Error' && <AlertCircle size={16} />}
                {p.status === 'Available' && <Zap size={16} color="var(--text-secondary)" />}
                {p.status}
              </div>
              <button className="btn" style={{ 
                background: p.status === 'Connected' ? 'var(--background)' : 'var(--primary)', 
                color: p.status === 'Connected' ? 'var(--error)' : 'white',
                border: p.status === 'Connected' ? '1px solid var(--error)' : 'none',
                padding: '0.5rem 1rem'
              }}>
                {p.status === 'Connected' ? 'Disconnect' : p.status === 'Error' ? 'Fix Connection' : 'Connect API'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
