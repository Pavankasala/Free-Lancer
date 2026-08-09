import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function NotPaidBills({ user, onLogout }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [bills, setBills] = useState([]);
  const [searched, setSearched] = useState(false);

  const years = [];
  for (let y = 2017; y <= 2060; y++) {
    years.push(y);
  }

  const getLocalBills = () => {
    try {
      const saved = localStorage.getItem('agri_local_bills');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const handleGetBills = async (e) => {
    e.preventDefault();
    const local = getLocalBills().filter(b => b.paid !== 'YES');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/home-bills`);
      if (res.data && res.data.success) {
        const apiBills = (res.data.bills || []).filter(b => b.paid !== 'YES');
        setBills([...local, ...apiBills]);
        setSearched(true);
        return;
      }
    } catch (err) {}
    setBills(local);
    setSearched(true);
  };

  const netTotalSum = bills.reduce((acc, b) => acc + (b.no_of_bags * b.price), 0);

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      
      <form onSubmit={handleGetBills}>
        <table className="tab" width="30%" align="center">
          <tbody>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Not Paid Bills</th>
            </tr>
            <tr>
              <td>Select Year</td>
              <td>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>
                <input type="submit" id="getNotPaidBills" name="getNotPaidBills" value="Get Bills" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <br />
      {searched && (
        <div style={{ padding: '0 10px' }}>
          <div style={{ textAlign: 'right', marginBottom: '5px' }}>
            <input type="button" value="Print Unpaid Bills" onClick={() => window.print()} />
          </div>
          <table width="100%" className="tab" border="1" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                <th align="left">S.No.</th>
                <th align="left">Kisan Name</th>
                <th align="left">No.of bags</th>
                <th align="left">Price</th>
                <th align="left">Total</th>
                <th align="left">Net Total</th>
                <th align="left">Date</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan="7">No Unpaid Bills for Year {selectedYear}</td></tr>
              ) : (
                bills.map((b, idx) => {
                  const total = b.no_of_bags * b.price;
                  return (
                    <tr key={b.id}>
                      <td align="left">{idx + 1}</td>
                      <td align="left">{b.name}</td>
                      <td align="left">{b.no_of_bags}</td>
                      <td align="left">{b.price}</td>
                      <td align="left">{total.toFixed(2)}</td>
                      <td align="left"><b>{total.toFixed(2)}</b></td>
                      <td align="left">{b.date}</td>
                    </tr>
                  );
                })
              )}
              {bills.length > 0 && (
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <td colSpan="5" align="right"><b>Total Net Balance Unpaid:</b></td>
                  <td align="left" colSpan="2"><font color="red"><b>₹ {netTotalSum.toFixed(2)}</b></font></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
