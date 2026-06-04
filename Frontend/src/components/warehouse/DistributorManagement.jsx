import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Phone, Mail, FileText, CheckCircle, CreditCard, Plus, X } from 'lucide-react';
import { API_URL } from '../../config';

const DistributorManagement = () => {
  const [distributors, setDistributors] = useState([]);
  const [selectedDist, setSelectedDist] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDist, setNewDist] = useState({ name: '', gstin: '', phone: '', creditLimit: 50000 });
  const [settleAmount, setSettleAmount] = useState('');

  const fetchDistributors = async () => {
    try {
      const res = await fetch(`${API_URL}/distributors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDistributors(data);
        if (data.length > 0 && !selectedDist) setSelectedDist(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  const handleAddDistributor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/distributors`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(newDist)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewDist({ name: '', gstin: '', phone: '', creditLimit: 50000 });
        fetchDistributors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettle = async () => {
    if (!settleAmount || isNaN(settleAmount)) return;
    try {
      const res = await fetch(`${API_URL}/distributors/${selectedDist.id}/settle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ amount: Number(settleAmount) })
      });
      if (res.ok) {
        setSettleAmount('');
        fetchDistributors();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase color="var(--primary)" /> Distributor Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage supplier ledgers, credit limits, and purchase histories</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Briefcase size={16} /> Add New Distributor
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Left: Distributor List */}
        <div style={{ width: '350px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search distributors..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {distributors.map(d => (
              <div 
                key={d.id} 
                onClick={() => setSelectedDist(d)}
                style={{ 
                  padding: '1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: selectedDist?.id === d.id ? 'var(--primary-light)' : 'transparent',
                  borderLeft: selectedDist?.id === d.id ? '4px solid var(--primary)' : '4px solid transparent'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{d.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ph: {d.phone}</span>
                  <span style={{ fontWeight: 600, color: d.outstanding > 0 ? 'var(--error)' : 'var(--success)' }}>
                    ₹{(d.outstanding || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {distributors.length === 0 && <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No distributors found.</div>}
          </div>
        </div>

        {/* Right: Ledger Details */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedDist ? (
            <>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedDist.name}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {selectedDist.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> GSTIN: {selectedDist.gstin}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ border: '1px solid var(--border)', background: 'var(--background)' }}>Edit Details</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--error-light)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Outstanding Payable</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)' }}>₹{(selectedDist.outstanding || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Available Credit Limit</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>₹{((selectedDist.creditLimit || 0) - (selectedDist.outstanding || 0)).toLocaleString()}</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Last Payment Date</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{selectedDist.lastPayment || '-'}</div>
                </div>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Recent Transactions (Ledger)</h3>
                  {selectedDist.outstanding > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="Amount" 
                        value={settleAmount}
                        onChange={e => setSettleAmount(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} 
                      />
                      <button onClick={handleSettle} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={16} /> Settle Outstanding
                      </button>
                    </div>
                  )}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--background)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Ref No.</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Debit (₹)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Credit (₹)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Transactions will be generated automatically when Purchases are made.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
              Select a distributor to view ledger
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '500px', padding: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Add Distributor</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddDistributor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Distributor Name" value={newDist.name} onChange={e => setNewDist({...newDist, name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <input required type="text" placeholder="Phone Number" value={newDist.phone} onChange={e => setNewDist({...newDist, phone: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <input type="text" placeholder="GSTIN" value={newDist.gstin} onChange={e => setNewDist({...newDist, gstin: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <input type="number" placeholder="Credit Limit (₹)" value={newDist.creditLimit} onChange={e => setNewDist({...newDist, creditLimit: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Save Distributor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorManagement;
