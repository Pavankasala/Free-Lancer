import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function PaidBills({ user, onLogout }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bills, setBills] = useState([]);
  const [searched, setSearched] = useState(false);

  const getLocalBills = () => {
    try {
      const saved = localStorage.getItem('agri_local_bills');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const handleGetPaidBills = async (e) => {
    e.preventDefault();
    const local = getLocalBills().filter(b => b.date === date && b.paid === 'YES');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/home-bills?date=${date}`);
      if (res.data && res.data.success) {
        const apiBills = (res.data.bills || []).filter(b => b.paid === 'YES');
        setBills([...local, ...apiBills]);
        setSearched(true);
        return;
      }
    } catch (err) {}
    setBills(local);
    setSearched(true);
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      
      <form onSubmit={handleGetPaidBills}>
        <table className="tab" width="30%" align="center">
          <tbody>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Paid Bills</th>
            </tr>
            <tr>
              <td>Date</td>
              <td>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>
                <input type="submit" value="Get Paid Bills" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <br />
      {searched && (
        <div style={{ padding: '0 10px' }}>
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
                <tr><td colSpan="7">No Paid Bills Found for {date}</td></tr>
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
