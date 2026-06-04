import React, { useState } from 'react';
import { Smartphone, RefreshCw, Server, Wifi, Activity, CheckCircle, XCircle } from 'lucide-react';

const MobileAppSync = () => {
  const [logs] = useState([
    { time: '18:25:32', type: 'INFO', msg: 'Started Delta Sync for Inventory Data' },
    { time: '18:25:33', type: 'SUCCESS', msg: 'Pushed 14 updated product prices to Mobile API' },
    { time: '18:25:35', type: 'SUCCESS', msg: 'Fetched 3 new Mobile App Orders (Ord-992, Ord-993, Ord-994)' },
    { time: '18:26:01', type: 'WARN', msg: 'Connection latency spike detected (420ms)' },
    { time: '18:28:15', type: 'INFO', msg: 'Patient Profile Sync completed' }
  ]);

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Smartphone color="var(--primary)" /> Mobile Application Sync
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage data synchronization between enterprise hub and patient-facing apps</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <RefreshCw size={16} /> Force Full Sync
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        {/* Left: Configuration & Status */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={18}/> Connection Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                <Wifi size={20} />
                <span>API Gateway Online</span>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-primary)' }}>Ping: 24ms</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Sync</div>
                <div style={{ fontWeight: 600 }}>2 minutes ago</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active App Users</div>
                <div style={{ fontWeight: 600 }}>142</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={18}/> Sync Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Real-time Inventory Sync</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Push stock changes immediately</div>
                </div>
                <div style={{ width: '40px', height: '20px', background: 'var(--success)', borderRadius: '20px', position: 'relative' }}>
                  <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Allow Mobile Orders</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accept orders from the app</div>
                </div>
                <div style={{ width: '40px', height: '20px', background: 'var(--success)', borderRadius: '20px', position: 'relative' }}>
                  <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Sync CRM/Loyalty Points</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show points in patient wallet</div>
                </div>
                <div style={{ width: '40px', height: '20px', background: 'var(--text-secondary)', borderRadius: '20px', position: 'relative' }}>
                  <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Terminal Logs */}
        <div style={{ flex: 1, background: '#1e1e1e', color: '#00ff00', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'monospace' }}>
          <div style={{ padding: '1rem', background: '#2d2d2d', borderBottom: '1px solid #444', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <Activity size={16} /> Live Sync Terminal
          </div>
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#888' }}>[{log.time}]</span>
                <span style={{ 
                  color: log.type === 'SUCCESS' ? '#00ff00' : log.type === 'WARN' ? '#ffaa00' : '#00aaff',
                  width: '60px'
                }}>
                  {log.type}
                </span>
                <span>{log.msg}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', opacity: 0.7, marginTop: '1rem' }}>
              <span>_</span>
              <span>Waiting for next push event...</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple stub for missing Settings icon import
const Settings = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default MobileAppSync;
