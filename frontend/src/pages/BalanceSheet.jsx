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
    e.preventDefault();
    try {
      const res = await axios.get(`${API_BASE_URL}/api/balance-sheet?date=${selectedYear}-01-01`);
      if (res.data && res.data.success) {
        setData({
          rows: [
            { date: `${selectedYear}-08-08`, total: res.data.total_buy || 0.00, paid: res.data.total_cash || 0.00, pending: (res.data.total_buy || 0.00) - (res.data.total_cash || 0.00) }
          ],
          oldBalance: 0.00,
          cashPaid: res.data.total_cash || 0.00,
          newAmount: res.data.total_buy || 0.00,
          presentBalance: (res.data.total_buy || 0.00) - (res.data.total_cash || 0.00)
        });
        setSearched(true);
        return;
      }
    } catch (err) {}
    setData({
      rows: [
        { date: `${selectedYear}-08-08`, total: 0.00, paid: 0.00, pending: 0.00 }
      ],
      oldBalance: 0.00,
      cashPaid: 0.00,
      newAmount: 0.00,
      presentBalance: 0.00
    });
    setSearched(true);
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      
      <form onSubmit={fetchBalanceSheet}>
        <table className="tab" width="30%" align="left" style={{ marginLeft: '10px' }}>
          <tbody>
            <tr>
              <th style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Balance Sheet</th>
            </tr>
            <tr>
              <td>
                Select Year{' '}
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <input type="submit" value="Get Balance Sheet" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div style={{ clear: 'both' }}><br /></div>

      {searched && data && (
        <table width="100%">
          <tbody>
            <tr>
              {/* Div Balance Sheet Print Table (40% width) */}
              <td width="40%" valign="top">
                <div id="divBalSheetPrint">
                  <table className="tab" width="100%" border="1" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                        <th align="left">Date</th>
                        <th align="right">Total Amount</th>
                        <th align="right">Cash Paid</th>
                        <th align="right">Pending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((r, idx) => (
                        <tr key={idx}>
                          <td align="left">{r.date}</td>
                          <td align="right">{r.total.toFixed(2)}</td>
                          <td align="right">{r.paid.toFixed(2)}</td>
                          <td align="right">{r.pending.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr><td colSpan="4"><hr /></td></tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td align="right"><b>{data.newAmount.toFixed(2)}</b></td>
                        <td align="right"><b>{data.cashPaid.toFixed(2)}</b></td>
                        <td align="right"><b>{data.presentBalance.toFixed(2)}</b></td>
                      </tr>
                      <tr>
                        <td colSpan="3" align="left">
                          Balance Sheet for the year: <font color="blue"><b>{selectedYear}</b></font>
                        </td>
                        <td align="right">
                          <input type="button" value="Print" onClick={() => window.print()} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              {/* Old Balance Box (15%) */}
              <td width="15%" valign="top">
                <table className="tab" width="100%">
                  <tbody>
                    <tr><th style={{ backgroundColor: '#4286f4', color: 'white' }}>Old Balance</th></tr>
                    <tr><td align="center"><b>{data.oldBalance.toFixed(2)}</b></td></tr>
                  </tbody>
                </table>
              </td>

              {/* Cash Paid Box (15%) */}
              <td width="15%" valign="top">
                <table className="tab" width="100%">
                  <tbody>
                    <tr><th style={{ backgroundColor: '#4286f4', color: 'white' }}>Cash Paid</th></tr>
                    <tr><td align="center"><b>{data.cashPaid.toFixed(2)}</b></td></tr>
                  </tbody>
                </table>
              </td>

              {/* New Amount Box (15%) */}
              <td width="15%" valign="top">
                <table className="tab" width="100%">
                  <tbody>
                    <tr><th style={{ backgroundColor: '#4286f4', color: 'white' }}>New Amount</th></tr>
                    <tr><td align="center"><b>{data.newAmount.toFixed(2)}</b></td></tr>
                  </tbody>
                </table>
              </td>

              {/* Present Balance Box (15%) */}
              <td width="15%" valign="top">
                <table className="tab" width="100%">
                  <tbody>
                    <tr><th style={{ backgroundColor: '#4286f4', color: 'white' }}>Present Balance</th></tr>
                    <tr><td align="center"><b>{data.presentBalance.toFixed(2)}</b></td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
