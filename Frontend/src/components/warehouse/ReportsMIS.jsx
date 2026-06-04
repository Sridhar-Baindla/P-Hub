import React, { useState, useEffect } from 'react';
import { PieChart, Download, FileText, Calendar, Filter } from 'lucide-react';
import { API_URL } from '../../config';

const ReportsMIS = () => {
  const [sales, setSales] = useState([]);
  
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${API_URL}/journal`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
        if (res.ok) {
          const data = await res.json();
          setSales(data.filter(d => d.category === 'Income'));
        }
      } catch (err) { console.error(err); }
    };
    fetchSales();
  }, []);

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePrint = () => window.print();

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PieChart color="var(--primary)" /> Reports & MIS
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Generate comprehensive business intelligence reports</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
        {/* Generator Form */}
        <div className="no-print" style={{ width: '350px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Report Configuration</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Report Type</label>
            <select className="btn" style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'left', width: '100%' }}>
              <option>Sales Summary Report</option>
              <option>GST Returns (GSTR-1/3B)</option>
              <option>Expiry Near/Expired Stock</option>
            </select>
          </div>

          <button onClick={handlePrint} className="btn btn-primary" style={{ marginTop: 'auto', padding: '1rem', fontSize: '1rem' }}>
            Generate & Print Report
          </button>
        </div>

        {/* PDF Preview Area */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="no-print" style={{ padding: '1rem', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <FileText size={18} color="var(--primary)" /> Preview: Sales Summary Report
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrint} className="btn" style={{ border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Download size={14} /> PDF</button>
            </div>
          </div>
          
          <div style={{ flex: 1, background: '#e0e0e0', padding: '2rem', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
            {/* Dummy PDF Paper */}
            <div className="print-area" style={{ width: '210mm', minHeight: '297mm', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '40px', color: 'black' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>eVitalRx Enterprise Hub</h1>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Sales Summary Report (Live Data)</p>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Reference</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Payment Mode</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{s.date}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{s.ref}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{s.accountHead}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>₹{s.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>No sales data recorded yet.</td>
                    </tr>
                  )}
                  <tr style={{ fontWeight: 'bold', background: '#f9f9f9' }}>
                    <td colSpan="3" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Grand Total Revenue:</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>₹{totalRevenue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .module-container { height: auto !important; padding: 0 !important; }
          .print-area { box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportsMIS;
