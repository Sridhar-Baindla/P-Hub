import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Check, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config';

const ClinicFeatures = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    prescriptions: '',
    status: ''
  });
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/warehouse-data/clinicfeatures`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
      const res = await fetch(`${API_URL}/warehouse-data/clinicfeatures`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ data: formData })
      });
      if (res.ok) {
        setMsg('Record added successfully!');
        fetchData();
        setShowModal(false);
        setFormData({ doctorName: '', specialty: '', prescriptions: '', status: '' });
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
            <Stethoscope size={28} color="var(--primary)" />
            <h1 style={{ margin: 0 }}>Clinic Integration</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Enterprise management interface for Clinic Integration.</p>
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
              <th style={{ padding: '1rem', textTransform: 'capitalize' }}>doctor Name</th>
              <th style={{ padding: '1rem', textTransform: 'capitalize' }}>specialty</th>
              <th style={{ padding: '1rem', textTransform: 'capitalize' }}>prescriptions</th>
              <th style={{ padding: '1rem', textTransform: 'capitalize' }}>status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found. Click "Add Record" to create one.</td></tr>
            ) : (
              data.map(row => (
                <tr key={row.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{row.data?.['doctorName'] || '-'}</td>
                  <td style={{ padding: '1rem' }}>{row.data?.['specialty'] || '-'}</td>
                  <td style={{ padding: '1rem' }}>{row.data?.['prescriptions'] || '-'}</td>
                  <td style={{ padding: '1rem' }}>{row.data?.['status'] || '-'}</td>
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
              <h2 style={{ margin: 0 }}>Add New Clinic Integration</h2>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'static' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>doctor Name</label>
                <input 
                  type="text" 
                  value={formData['doctorName']}
                  onChange={e => setFormData({...formData, 'doctorName': e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>specialty</label>
                <input 
                  type="text" 
                  value={formData['specialty']}
                  onChange={e => setFormData({...formData, 'specialty': e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>prescriptions</label>
                <input 
                  type="text" 
                  value={formData['prescriptions']}
                  onChange={e => setFormData({...formData, 'prescriptions': e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>status</label>
                <input 
                  type="text" 
                  value={formData['status']}
                  onChange={e => setFormData({...formData, 'status': e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicFeatures;
