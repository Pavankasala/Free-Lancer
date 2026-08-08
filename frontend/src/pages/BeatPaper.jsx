import React, { useState } from 'react';
import Header from '../components/Header';

export default function BeatPaper({ user, onLogout }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <br />
      <table width="60%" className="tab" align="center">
        <tbody>
          <tr>
            <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white' }}>
              <font size="4"><b>Beat Paper Loading Report</b></font>
            </th>
          </tr>
          <tr>
            <td>Date</td>
            <td>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <input type="button" value="Print Beat Paper" onClick={() => window.print()} />
            </td>
          </tr>
        </tbody>
      </table>

      <br />
      <table width="80%" className="tab" align="center" border="1">
        <thead>
          <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
            <th>Lorry No</th>
            <th>Farmer Name</th>
            <th>No of Bags</th>
            <th>Destination</th>
            <th>Hamali</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5">No Beat Paper Loading Data for {date}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
