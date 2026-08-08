import React, { useState } from 'react';
import Header from '../components/Header';

export default function Bags({ user, onLogout }) {
  const [bagType, setBagType] = useState('Standard');
  const [capacity, setCapacity] = useState('50kg');

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <br />
      <table width="40%" className="tab" align="center">
        <tbody>
          <tr>
            <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white' }}>
              <font size="4"><b>Bags Inventory & Configuration</b></font>
            </th>
          </tr>
          <tr>
            <td>Bag Type</td>
            <td>
              <input type="text" value={bagType} onChange={(e) => setBagType(e.target.value)} />
            </td>
          </tr>
          <tr>
            <td>Default Capacity</td>
            <td>
              <input type="text" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
