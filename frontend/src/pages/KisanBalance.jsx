import React, { useState } from 'react';
import Header from '../components/Header';

export default function KisanBalance({ user, onLogout }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [kisanName, setKisanName] = useState('');

  const years = [];
  for (let y = 2017; y <= 2060; y++) {
    years.push(y);
  }

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      <table width="60%" className="tab" align="center">
        <tbody>
          <tr>
            <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>
              <font size="4"><b>Kisan Balance</b></font>
            </th>
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
            <td>Search Kisan Name</td>
            <td>
              <input
                type="text"
                value={kisanName}
                onChange={(e) => setKisanName(e.target.value)}
                placeholder="Enter Kisan Name"
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <input type="button" value="Get Balance" onClick={() => alert("Fetched Kisan Balance for " + kisanName)} />
            </td>
          </tr>
        </tbody>
      </table>

      <br />
      <table width="80%" className="tab" align="center" border="1" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
            <th>S.No.</th>
            <th>Kisan Name</th>
            <th>Total Bills Amount</th>
            <th>Advance Paid</th>
            <th>Net Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5">No Kisan ledger records found for {selectedYear}.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
