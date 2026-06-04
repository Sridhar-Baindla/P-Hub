import React from 'react';
import { Shield, Users, Key, AlertTriangle, Clock } from 'lucide-react';

const SecurityAdmin = () => {
  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield color="var(--primary)" /> Security & Access Control
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage staff roles, permissions, and view system audit logs</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        {/* Left: Role Management */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18}/> Staff Roles</h3>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>+ Add Staff</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--background)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Employee</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Permissions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>Amit Kumar</td>
                  <td style={{ padding: '1rem' }}><span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Admin</span></td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full System Access</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>Neha Sharma</td>
                  <td style={{ padding: '1rem' }}><span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Pharmacist</span></td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>POS, CRM, Catalogue</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>Rajesh Singh</td>
                  <td style={{ padding: '1rem' }}><span style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Inventory Mgr</span></td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Purchases, Catalogue, Barcode</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Security Audit Log */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--error-light)', color: 'var(--error)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={18}/> Live Audit Log</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--error)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Invoice Deleted</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> 14:32 PM</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>User <span style={{ fontWeight: 600 }}>Amit Kumar</span> deleted Invoice INV-4021.</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>IP: 192.168.1.45</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Successful Login</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> 09:15 AM</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>User <span style={{ fontWeight: 600 }}>Neha Sharma</span> authenticated successfully.</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>IP: 192.168.1.12</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Stock Adjustment</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> Yesterday</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>User <span style={{ fontWeight: 600 }}>Rajesh Singh</span> manually updated stock for Dolo 650 (-5 units).</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAdmin;
