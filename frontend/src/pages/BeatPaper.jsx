import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function BeatPaper({ user, onLogout }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bills, setBills] = useState([]);
  const [searched, setSearched] = useState(false);

  const getLocalBills = () => {
    try {
      const saved = localStorage.getItem('agri_local_bills');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.filter(b => b.type !== 'BUYER');
    } catch (e) {
      return [];
    }
  };

  const fetchBeatPaperBills = async (selectedDate) => {
    const d = selectedDate || date;
    const local = getLocalBills().filter(b => b.date === d || b.billdate === d);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/home-bills?date=${d}`);
      if (res.data && res.data.success) {
        const apiBills = (res.data.bills || []).filter(b => b.type !== 'BUYER');
        const combined = [...local, ...apiBills.filter(ab => !local.some(lb => lb.id === ab.id))];
        setBills(combined);
        setSearched(true);
        return;
      }
    } catch (err) {}
    setBills(local);
    setSearched(true);
  };

  useEffect(() => {
    fetchBeatPaperBills(date);
  }, []);

  const handleGetBills = (e) => {
    e.preventDefault();
    fetchBeatPaperBills(date);
  };

  // Group bills / line items by Kisan for clean S.No rendering
  const processBillRows = () => {
    const rows = [];
    let sno = 1;

    bills.forEach((bill) => {
      const kisanName = bill.name || bill.kisanName || 'Unknown';
      const items = (bill.channels && bill.channels.length > 0)
        ? bill.channels
        : [{ bags: bill.no_of_bags || bill.bags || 0, price: bill.price || 0 }];

      items.forEach((item, itemIdx) => {
        const bags = Number(item.bags || item.no_of_bags || 0);
        const price = Number(item.price || 0);
        const total = bags * price;

        rows.push({
          sno: itemIdx === 0 ? sno : '',
          isFirstInGroup: itemIdx === 0,
          groupSize: items.length,
          kisanName: kisanName,
          bags: bags,
          price: price,
          total: total
        });
      });
      sno++;
    });

    return rows;
  };

  const processedRows = processBillRows();
  const grandTotalBags = processedRows.reduce((acc, r) => acc + r.bags, 0);
  const grandTotalAmount = processedRows.reduce((acc, r) => acc + r.total, 0);

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Filter Card */}
        <div style={{ maxWidth: '480px', margin: '0 auto 20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            Beat Paper
          </div>

          <form onSubmit={handleGetBills} style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
              />
              <button
                type="submit"
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '7px 16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Get Bills
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🖨️ Print
              </button>
            </div>
          </form>
        </div>

        {/* Report Table Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
          <h2 align="center" style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
            - Beat Paper ({date}) -
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                  <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>S.No.</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Kisan Name</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '100px' }}>No.of bags</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '120px' }}>Price</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '140px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {processedRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" align="center" style={{ padding: '20px', color: '#dc2626', fontWeight: 'bold' }}>
                      No Bills Found for {date}
                    </td>
                  </tr>
                ) : (
                  processedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        {row.sno}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>
                        {row.kisanName}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {row.bags}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {row.price}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                        {row.total.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}

                {processedRows.length > 0 && (
                  <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan="2" align="right" style={{ padding: '10px' }}>Total:</td>
                    <td align="center" style={{ padding: '10px', color: '#15803d' }}>{grandTotalBags}</td>
                    <td></td>
                    <td align="right" style={{ padding: '10px', color: '#15803d', fontSize: '1.1rem' }}>
                      ₹{grandTotalAmount.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
