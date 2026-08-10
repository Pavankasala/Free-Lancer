import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function BalanceSheet({ user, onLogout }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [data, setData] = useState(null);
  const [searched, setSearched] = useState(false);

  const years = [];
  for (let y = 2017; y <= 2060; y++) {
    years.push(y);
  }

  const fetchBalanceSheet = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/buyer-balance?year=${selectedYear}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.success) {
        const recordsList = res.data.records || res.data.buyers || [];
        const rows = recordsList.map(b => ({
          date: b.date || `${selectedYear}-01-01`,
          buyerName: b.name || b.buyerName || b.sold_to || 'Buyer',
          bags: b.no_of_bags || b.bags || 0,
          total: b.total_amount || b.total || 0,
          paid: b.cash_paid !== undefined ? b.cash_paid : (b.paid_amount || b.paid || 0),
          pending: b.pending_balance !== undefined ? b.pending_balance : (b.pending_amount || b.pending || 0)
        }));
        const summary = res.data.summary || {};
        setData({
          rows: rows.length > 0 ? rows : [
            { date: `${selectedYear}-01-01`, buyerName: 'No Buyer Bills', bags: 0, total: 0.00, paid: 0.00, pending: 0.00 }
          ],
          oldBalance: 0.00,
          cashPaid: summary.cash_paid !== undefined ? summary.cash_paid : (summary.paid_amount || 0),
          newAmount: summary.total_amount || 0,
          presentBalance: summary.pending_balance !== undefined ? summary.pending_balance : (summary.pending_amount || 0)
        });
        setSearched(true);
        return;
      }
    } catch (err) {}

    setData({
      rows: [
        { date: `${selectedYear}-01-01`, buyerName: 'No Buyer Bills', bags: 0, total: 0.00, paid: 0.00, pending: 0.00 }
      ],
      oldBalance: 0.00,
      cashPaid: 0.00,
      newAmount: 0.00,
      presentBalance: 0.00
    });
    setSearched(true);
  };


  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Form Card */}
        <div style={{ maxWidth: '420px', margin: '0 auto 20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            Buyers Balance Sheet
          </div>

          <form onSubmit={fetchBalanceSheet} style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get Buyers Balance Sheet
            </button>
          </form>
        </div>

        {/* Results Container */}
        {searched && data && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
            {/* Table Card (60% width) */}
            <div style={{ flex: '1 1 500px', backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ color: '#15803d', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                  - Buyers Balance Sheet ({selectedYear}) -
                </h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Print
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '550px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Buyer Name</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Cash Paid</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Pending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '8px' }}>{r.date}</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{r.buyerName}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{r.total.toFixed(2)}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{r.paid.toFixed(2)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: r.pending > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>₹{r.pending.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan="2" align="left" style={{ padding: '10px' }}>Total:</td>
                      <td align="right" style={{ padding: '10px' }}>₹{data.newAmount.toFixed(2)}</td>
                      <td align="right" style={{ padding: '10px' }}>₹{data.cashPaid.toFixed(2)}</td>
                      <td align="right" style={{ padding: '10px', color: '#dc2626' }}>₹{data.presentBalance.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Cards (40% width) */}
            <div style={{ flex: '1 1 300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ color: '#4286f4', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>Old Balance</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b' }}>₹{data.oldBalance.toFixed(2)}</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>Cash Paid</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#16a34a' }}>₹{data.cashPaid.toFixed(2)}</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>New Amount</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2563eb' }}>₹{data.newAmount.toFixed(2)}</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>Present Balance</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#dc2626' }}>₹{data.presentBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
