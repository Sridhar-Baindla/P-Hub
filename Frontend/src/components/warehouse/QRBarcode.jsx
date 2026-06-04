import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Printer, Search, Settings } from 'lucide-react';
import { API_URL } from '../../config';

const BarcodeCanvas = ({ text, value }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 150, 40);
    ctx.fillStyle = 'black';
    // Dummy barcode logic
    for(let i=0; i<30; i++) {
      const width = Math.random() > 0.5 ? 2 : 4;
      const space = Math.random() > 0.5 ? 2 : 4;
      ctx.fillRect(i * 5, 0, width, 40);
    }
  }, [value]);
  return <canvas ref={canvasRef} width={150} height={40} />;
};

const QRBarcode = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [qty, setQty] = useState(12);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await fetch(`${API_URL}/medicines`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        if (res.ok) setMedicines(await res.json());
      } catch(err) { console.error(err); }
    };
    fetchMeds();
  }, []);

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <QrCode color="var(--primary)" /> Barcode Print Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Generate thermal labels for physical inventory management</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Printer size={16} /> Print Labels
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        {/* Left: Configuration Form */}
        <div className="no-print" style={{ width: '350px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search product to print..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
              {filtered.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', zIndex: 10, maxHeight: '150px', overflowY: 'auto' }}>
                  {filtered.map(m => (
                    <div key={m.id} onClick={() => { setSelectedMed(m); setSearchQuery(''); }} style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                      {m.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedMed ? (
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Selected Item</h4>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedMed.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Batch: {selectedMed.boxNumber || 'GEN-1'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MRP: ₹{selectedMed.price}</div>
              </div>
            ) : (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Select a product</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Number of Labels</label>
              <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
            </div>
          </div>
        </div>

        {/* Right: Live Preview Grid */}
        <div style={{ flex: 1, background: '#e0e0e0', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="no-print" style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>
            Live Preview (Standard Barcode)
          </div>
          <div className="print-area" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', alignContent: 'start' }}>
            {selectedMed && Array(qty).fill(null).map((_, i) => (
              <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'black', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>SAHA PHARMACY</div>
                <div style={{ fontSize: '0.7rem', color: '#555' }}>{selectedMed.name}</div>
                <BarcodeCanvas value={selectedMed.id} />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', color: 'black' }}>
                  <span>₹{selectedMed.price}</span>
                  <span>B:{selectedMed.boxNumber || 'GEN-1'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .module-container { height: auto !important; }
          .print-area { padding: 0 !important; gap: 5px !important; }
        }
      `}</style>
    </div>
  );
};

export default QRBarcode;
