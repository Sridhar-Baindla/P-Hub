import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, TrendingDown, DollarSign, Download, PlusCircle } from 'lucide-react';
import { API_URL } from '../../config';

const FinancialAccounting = () => {
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await fetch(`${API_URL}/journal`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setEntries(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchJournal();
  }, []);

  const incomeEntries = entries.filter(e => e.type === 'Credit' && e.category === 'Income');
  const expenseEntries = entries.filter(e => e.type === 'Debit' && e.category === 'Expense');

  const totalIncome = incomeEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenseEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText color="var(--primary)" /> Financial Accounting
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Manage ledgers, P&L, expenses, and GST tracking directly from transactions</p>
        </div>
      </div>

      {/* T-Account Layout */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Left: Income / Assets */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={20} /> Income</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{totalIncome.toFixed(2)}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--background)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Account Head / Ref</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {incomeEntries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{e.date}</td>
                    <td style={{ padding: '1rem' }}>{e.accountHead} <br/><span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{e.ref}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--success)' }}>{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {incomeEntries.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No income logged.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Expenses / Liabilities */}
        <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--error-light)', color: 'var(--error)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingDown size={20} /> Expenses</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{totalExpense.toFixed(2)}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--background)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Account Head / Ref</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenseEntries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{e.date}</td>
                    <td style={{ padding: '1rem' }}>{e.accountHead} <br/><span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{e.ref}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--error)' }}>{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {expenseEntries.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses logged.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom P&L Summary */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Net Profit (Operating)</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: netProfit >= 0 ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} /> {netProfit.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAccounting;
