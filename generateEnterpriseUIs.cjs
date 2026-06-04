const fs = require('fs');
const path = require('path');

const modulesInfo = [
  { name: 'DashboardOverview', title: 'Business Dashboard', icon: 'LayoutDashboard', fields: ['metric', 'value', 'trend'] },
  { name: 'SalesManagement', title: 'Sales & POS', icon: 'ShoppingCart', fields: ['invoiceNo', 'customerName', 'totalAmount', 'status'] },
  { name: 'PurchaseManagement', title: 'Purchase Orders', icon: 'Truck', fields: ['poNumber', 'distributor', 'amount', 'status'] },
  { name: 'ProductCatalogue', title: 'Medicine Database', icon: 'Library', fields: ['productName', 'manufacturer', 'mrp', 'hsnCode'] },
  { name: 'CRM', title: 'Customer Relations', icon: 'Users', fields: ['customerName', 'phone', 'loyaltyPoints', 'lastVisit'] },
  { name: 'DistributorManagement', title: 'Distributors', icon: 'Briefcase', fields: ['distributorName', 'gstin', 'creditLimit', 'outstanding'] },
  { name: 'FinancialAccounting', title: 'Financial Ledger', icon: 'FileText', fields: ['transactionId', 'type', 'amount', 'date'] },
  { name: 'ReportsMIS', title: 'MIS Reports', icon: 'PieChart', fields: ['reportName', 'generatedBy', 'date', 'status'] },
  { name: 'QRBarcode', title: 'QR/Barcode System', icon: 'QrCode', fields: ['batchNo', 'product', 'codesGenerated', 'date'] },
  { name: 'MultiStore', title: 'Chain Management', icon: 'Building2', fields: ['storeName', 'location', 'dailyRevenue', 'manager'] },
  { name: 'Marketplace', title: 'B2B Marketplace', icon: 'Globe', fields: ['supplier', 'product', 'price', 'deliveryTime'] },
  { name: 'MobileAppSync', title: 'Mobile App Sync', icon: 'Smartphone', fields: ['device', 'user', 'lastSync', 'status'] },
  { name: 'Integrations', title: 'System Integrations', icon: 'Link', fields: ['platform', 'status', 'lastSync', 'health'] },
  { name: 'SecurityAdmin', title: 'Security & Audit', icon: 'Shield', fields: ['user', 'action', 'ipAddress', 'timestamp'] },
  { name: 'ClinicFeatures', title: 'Clinic Integration', icon: 'Stethoscope', fields: ['doctorName', 'specialty', 'prescriptions', 'status'] },
  { name: 'SahaAI', title: 'SahaAI Insights', icon: 'Sparkles', fields: ['insightType', 'recommendation', 'confidence', 'actionTaken'] }
];

const generateComponent = (mod) => `import React, { useState, useEffect } from 'react';
import { ${mod.icon}, Plus, Search, Check, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config';

const ${mod.name} = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ${mod.fields.map(f => `${f}: ''`).join(',\n    ')}
  });
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(\`\${API_URL}/warehouse-data/${mod.name.toLowerCase()}\`, {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(\`\${API_URL}/warehouse-data/${mod.name.toLowerCase()}\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\` 
        },
        body: JSON.stringify({ data: formData })
      });
      if (res.ok) {
        setMsg('Record added successfully!');
        fetchData();
        setShowModal(false);
        setFormData({ ${mod.fields.map(f => `${f}: ''`).join(', ')} });
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="module-container">
      <div className="dashboard-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <${mod.icon} size={28} color="var(--primary)" />
            <h1 style={{ margin: 0 }}>${mod.title}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Enterprise management interface for ${mod.title}.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {msg && <div className="success-badge"><Check size={16} /> {msg}</div>}
          <button className="btn" onClick={fetchData} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* KPI Cards Mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Records</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.length || 0}</h2>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Status</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>Online</h2>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Last Sync</p>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Just Now</h2>
        </div>
      </div>

      <div className="data-table-container" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Recent Records</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search..." style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
          </div>
        </div>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--background)' }}>
            <tr>
              ${mod.fields.map(f => `<th style={{ padding: '1rem', textTransform: 'capitalize' }}>${f.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('\n              ')}
              <th style={{ padding: '1rem', textAlign: 'right' }}>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="${mod.fields.length + 1}" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="${mod.fields.length + 1}" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found. Click "Add Record" to create one.</td></tr>
            ) : (
              data.map(row => (
                <tr key={row.id} style={{ borderTop: '1px solid var(--border)' }}>
                  ${mod.fields.map(f => `<td style={{ padding: '1rem' }}>{row.data?.['${f}'] || '-'}</td>`).join('\n                  ')}
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{new Date(row.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content warehouse-modal" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Add New ${mod.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'static' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              ${mod.fields.map(f => `
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>${f.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input 
                  type="text" 
                  value={formData['${f}']}
                  onChange={e => setFormData({...formData, '${f}': e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  required
                />
              </div>`).join('')}
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${mod.name};
`;

const dir = path.join(__dirname, 'Frontend', 'src', 'components', 'warehouse');

modulesInfo.forEach(mod => {
  // Only override if it's one of the placeholders, don't override Inventory/Logistics
  if (mod.name !== 'InventoryManagement' && mod.name !== 'Logistics') {
    fs.writeFileSync(path.join(dir, mod.name + '.jsx'), generateComponent(mod));
    console.log('Created ' + mod.name + '.jsx');
  }
});
