import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function BuyerBalance({ user, onLogout }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [buyerName, setBuyerName] = useState('');
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [balanceData, setBalanceData] = useState([]);
  const [searched, setSearched] = useState(false);

  const years = [];
  for (let y = 2017; y <= 2060; y++) {
    years.push(y);
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('agri_local_buyer_bills');
      if (saved) {
        const bills = JSON.parse(saved);
        const names = bills.map(b => b.name || b.buyerName).filter(Boolean);
        setBuyerOptions(Array.from(new Set(names)));
      }
    } catch (e) {}
    handleGetBalance();
  }, [selectedYear]);

  const getLocalBuyerBills = () => {
    try {
      const saved = localStorage.getItem('agri_local_buyer_bills');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const handleGetBalance = async () => {
    const local = getLocalBuyerBills();
    let allBuyerBills = [...local];

    try {
      const res = await axios.get(`${API_BASE_URL}/api/buyer-bills`);
      if (res.data && res.data.success) {
        const apiBills = res.data.bills || [];
        allBuyerBills = [...local, ...apiBills.filter(ab => !local.some(lb => lb.id === ab.id))];
      }
    } catch (err) {}

    const filtered = allBuyerBills.filter(b => {
      const nameStr = b.name || b.buyerName || '';
      const matchesName = !buyerName || nameStr.toLowerCase().includes(buyerName.toLowerCase());
      const bDate = b.date || b.billdate || '';
      const matchesYear = !selectedYear || bDate.startsWith(selectedYear);
      return matchesName && matchesYear;
    });

    setBalanceData(filtered);
    setSearched(true);
  };

  const totalAmountSum = balanceData.reduce((acc, b) => acc + (Number(b.no_of_bags || 0) * Number(b.price || 0)), 0);
  const totalPaidSum = balanceData.reduce((acc, b) => acc + (b.paid === 'YES' ? (Number(b.no_of_bags || 0) * Number(b.price || 0)) : Number(b.advance || 0)), 0);
  const totalPendingSum = totalAmountSum - totalPaidSum;

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Form Card */}
        <div style={{ maxWidth: '450px', margin: '0 auto 20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            Buyer Balance
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
              <label style={{ width: '120px', fontWeight: 'bold', fontSize: '14px' }}>Buyer Name:</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Enter or Search Buyer Name"
                list="buyer-options-list"
                style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
              />
              <datalist id="buyer-options-list">
                {buyerOptions.map((opt, idx) => (
                  <option key={idx} value={opt} />
                ))}
              </datalist>
            </div>

            <button
              type="button"
              onClick={handleGetBalance}
              style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get Buyer Balance
            </button>
          </div>
        </div>

        {/* Balance Report Table Card */}
        {searched && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ color: '#15803d', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                - Buyer Ledger & Balance ({selectedYear}) -
              </h2>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🖨️ Print Buyer Ledger
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '650px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>S.No.</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Buyer Name</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Bags</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total Bills Amount (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Paid / Advance (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Pending Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceData.length === 0 ? (
                    <tr>
                      <td colSpan="7" align="center" style={{ padding: '16px', color: '#dc2626', fontWeight: 'bold' }}>
                        No Buyer ledger records found for {selectedYear}.
                      </td>
                    </tr>
                  ) : (
                    balanceData.map((b, idx) => {
                      const total = Number(b.no_of_bags || 0) * Number(b.price || 0);
                      const paid = b.paid === 'YES' ? total : Number(b.advance || 0);
                      const pending = total - paid;
                      return (
                        <tr key={b.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '8px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{b.date || b.billdate || selectedYear}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{b.name || b.buyerName}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{b.no_of_bags || 0}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹{total.toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#16a34a' }}>₹{paid.toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: pending > 0 ? '#dc2626' : '#16a34a' }}>
                            ₹{pending.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {balanceData.length > 0 && (
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan="4" align="right" style={{ padding: '10px' }}>Total Summary:</td>
                      <td align="right" style={{ padding: '10px' }}>₹{totalAmountSum.toLocaleString()}</td>
                      <td align="right" style={{ padding: '10px', color: '#16a34a' }}>₹{totalPaidSum.toLocaleString()}</td>
                      <td align="right" style={{ padding: '10px', color: '#dc2626', fontSize: '1.1rem' }}>
                        ₹{totalPendingSum.toLocaleString()}
                      </td>
                    </tr>
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
