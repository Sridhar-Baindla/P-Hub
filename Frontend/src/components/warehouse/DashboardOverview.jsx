import React, { useState, useEffect, useContext, useCallback } from 'react';
import { LayoutDashboard, TrendingUp, Package, Users, AlertCircle, FileText } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { API_URL, SOCKET_URL } from '../../config';
import { io } from 'socket.io-client';

const DashboardOverview = () => {
  const { token } = useContext(AppContext);
  const [dateRange, setDateRange] = useState('Today');
  const [stats, setStats] = useState({
    totalSales: 0,
    prescriptionsCount: 0,
    lowStockCount: 0,
    newPatients: 0,
    hourlyRevenue: Array(24).fill(0),
    alerts: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/warehouse/dashboard-stats?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, token]);

  useEffect(() => {
    setLoading(true);
    if (token) {
      fetchStats();
    }

    // Connect to WebSocket for real-time updates
    const socket = io(SOCKET_URL);
    
    socket.on('dashboard_update', () => {
      console.log('Real-time dashboard update triggered');
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchStats, token]);

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}/warehouse/export-report?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Warehouse_Report_${dateRange.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to export report");
      }
    } catch(err) {
      console.error("Export error:", err);
    }
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...stats.hourlyRevenue, 1); // avoid division by zero

  // Prepare chart data 
  const chartBars = [];
  const startHour = 9; // 9 AM
  const endHour = 20; // 8 PM (9 PM end)
  
  for (let i = startHour; i <= endHour; i++) {
    const val = stats.hourlyRevenue[i] || 0;
    const heightPercent = (val / maxRevenue) * 100;
    chartBars.push({ hour: i, height: heightPercent, value: val });
  }

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard color="var(--primary)" /> Business Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Real-time pharmacy performance & metrics (Live Sync Active)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            className="btn" 
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
          <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <FileText size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { title: "Total Sales", value: `₹${stats.totalSales.toLocaleString()}`, trend: "Live", color: "var(--success)", icon: TrendingUp },
          { title: "Prescriptions", value: stats.prescriptionsCount, trend: "Active", color: "var(--primary)", icon: FileText },
          { title: "Low Stock Items", value: stats.lowStockCount, trend: "Alert", color: "var(--error)", icon: Package },
          { title: "New Patients", value: stats.newPatients, trend: "Growth", color: "var(--warning)", icon: Users },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: stat.color, background: 'var(--background)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {stat.trend}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>{loading ? '...' : stat.value}</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flex: 1 }}>
        
        {/* Sales Chart */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>Hourly Revenue ({dateRange})</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            {loading ? (
               <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>Loading chart...</div>
            ) : chartBars.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                <div style={{
                  background: 'var(--primary-light)', 
                  height: `${bar.height}%`, 
                  minHeight: '4px',
                  borderRadius: '4px 4px 0 0', 
                  position: 'relative',
                  transition: 'height 0.3s ease'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--primary)', height: '10px', borderRadius: '4px 4px 0 0' }}></div>
                </div>
                <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', opacity: bar.value > 0 ? 1 : 0 }}>
                  ₹{bar.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span>9 AM</span>
            <span>12 PM</span>
            <span>3 PM</span>
            <span>6 PM</span>
            <span>9 PM</span>
          </div>
        </div>

        {/* Actionable Alerts */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="var(--warning)" /> Needs Attention
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ color: 'var(--text-secondary)' }}>Loading alerts...</div>
            ) : stats.alerts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>No alerts at this time.</div>
            ) : stats.alerts.map((alert, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid var(--${alert.type})`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--${alert.type})`, flexShrink: 0 }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{alert.text}</span>
              </div>
            ))}
          </div>
          <button className="btn" style={{ marginTop: '1rem', background: 'var(--background)', border: '1px solid var(--border)', width: '100%', padding: '0.75rem' }}>View All Alerts</button>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
