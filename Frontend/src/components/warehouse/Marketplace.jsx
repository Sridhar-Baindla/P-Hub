import React from 'react';
import { Globe, ShoppingCart, Star, Filter, Search } from 'lucide-react';

const Marketplace = () => {
  const products = [
    { id: 1, name: 'Dolo 650 (Box of 150)', supplier: 'Micro Labs Direct', price: 245.00, mrp: 450.00, rating: 4.8, type: 'B2B Wholesale' },
    { id: 2, name: 'Volini Gel 30g (Pack of 10)', supplier: 'Sun Pharma Hub', price: 850.00, mrp: 1150.00, rating: 4.5, type: 'B2B Wholesale' },
    { id: 3, name: 'Shelcal 500 (Bottle of 60)', supplier: 'Torrent Pharma', price: 85.00, mrp: 119.50, rating: 4.9, type: 'Distributor' },
    { id: 4, name: 'Vicks Vaporub 50g (Pack of 20)', supplier: 'P&G Health', price: 1200.00, mrp: 1700.00, rating: 4.7, type: 'B2B Wholesale' }
  ];

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe color="var(--primary)" /> B2B Marketplace
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Procure inventory directly from manufacturers and mega-distributors</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <ShoppingCart size={18} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>Cart (0)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search bulk medicines, surgicals, or suppliers..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
        </div>
        <button className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', overflowY: 'auto' }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '150px', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
              [Product Image Placeholder]
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>{p.supplier}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star size={12} /> {p.rating}</span>
                <span style={{ color: 'var(--text-secondary)' }}>• {p.type}</span>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{p.price.toFixed(2)}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>MRP: ₹{p.mrp.toFixed(2)}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% Margin</span>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={16} /> Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
