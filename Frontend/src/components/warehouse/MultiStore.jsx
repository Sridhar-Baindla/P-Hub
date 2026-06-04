import React from 'react';
import { Building2, MapPin, TrendingUp, Package, Users, ArrowRightLeft } from 'lucide-react';

const MultiStore = () => {
  const stores = [
    { id: 1, name: 'Jubilee Hills HQ', type: 'Main Hub', revenue: '₹1.2L', stockVal: '₹14.5L', staff: 12, status: 'Online' },
    { id: 2, name: 'Hitech City Branch', type: 'Retail', revenue: '₹85K', stockVal: '₹8.2L', staff: 5, status: 'Online' },
    { id: 3, name: 'Banjara Hills Clinic', type: 'Clinic Pharmacy', revenue: '₹45K', stockVal: '₹3.5L', staff: 3, status: 'Online' },
    { id: 4, name: 'KPHB Outlet', type: 'Retail', revenue: '₹32K', stockVal: '₹4.0L', staff: 4, status: 'Offline' }
  ];

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 color="var(--primary)" /> Multi-Store Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Monitor branches, transfer inventory, and view aggregate analytics</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ArrowRightLeft size={16} /> Inter-Store Stock Transfer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {stores.map(store => (
          <div key={store.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={18} color="var(--primary)" />
                  <h3 style={{ margin: 0 }}>{store.name}</h3>
                </div>
                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  {store.type}
                </span>
              </div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: store.status === 'Online' ? 'var(--success)' : 'var(--error)' }}></div>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={14}/> Daily Revenue</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--success)', marginTop: '0.25rem' }}>{store.revenue}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Package size={14}/> Stock Value</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{store.stockVal}</div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', background: 'var(--background)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={14} /> {store.staff} Active Staff
              </div>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>View Dashboard</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiStore;
