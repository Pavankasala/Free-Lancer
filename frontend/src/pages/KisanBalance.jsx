import React, { useState } from 'react';
import Header from '../components/Header';

export default function KisanBalance({ user, onLogout }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [kisanName, setKisanName] = useState('');
  const [balanceData, setBalanceData] = useState([]);
  const [searched, setSearched] = useState(false);

  const years = [];
  for (let y = 2017; y <= 2060; y++) {
    years.push(y);
  }

  const handleGetBalance = () => {
    try {
      const saved = localStorage.getItem('agri_local_bills');
      const allBills = saved ? JSON.parse(saved) : [];
      const filtered = allBills.filter(b => {
        const matchesName = !kisanName || (b.name || '').toLowerCase().includes(kisanName.toLowerCase());
        const bDate = b.date || b.billdate || '';
        const matchesYear = !selectedYear || bDate.startsWith(selectedYear);
        return matchesName && matchesYear;
      });
      setBalanceData(filtered);
    } catch (e) {
      setBalanceData([]);
    }
    setSearched(true);
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Form Card */}
        <div style={{ maxWidth: '450px', margin: '0 auto 20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            Kisan Balance
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ width: '120px', fontWeight: 'bold', fontSize: '14px' }}>Select Year:</label>
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

            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ width: '120px', fontWeight: 'bold', fontSize: '14px' }}>Kisan Name:</label>
              <input
                type="text"
                value={kisanName}
                onChange={(e) => setKisanName(e.target.value)}
                placeholder="Enter Kisan Name"
                style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
              />
            </div>

            <button
              type="button"
              onClick={handleGetBalance}
              style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get Balance
            </button>
          </div>
        </div>

        {/* Balance Report Table Card */}
        {searched && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
            <h2 align="center" style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
              - Kisan Ledger & Balance ({selectedYear}) -
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>S.No.</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Kisan Name</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total Bills Amount (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Advance Paid (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Net Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceData.length === 0 ? (
                    <tr>
                      <td colSpan="5" align="center" style={{ padding: '16px', color: '#dc2626', fontWeight: 'bold' }}>
                        No Kisan ledger records found for {selectedYear}.
                      </td>
                    </tr>
                  ) : (
                    balanceData.map((b, idx) => {
                      const total = Number(b.no_of_bags) * Number(b.price) || 0;
                      const advance = Number(b.advance) || 0;
                      const net = total - advance;
                      return (
                        <tr key={b.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '8px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{b.name}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>₹{total.toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>₹{advance.toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>₹{net.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
