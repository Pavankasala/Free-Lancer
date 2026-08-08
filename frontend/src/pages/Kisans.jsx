import React, { useState } from 'react';
import Header from '../components/Header';

export default function Kisans({ user, onLogout }) {
  const [kisanName, setKisanName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleAddKisan = (e) => {
    e.preventDefault();
    alert("Kisan record saved: " + kisanName);
    setKisanName('');
    setMobile('');
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <br />
      <form onSubmit={handleAddKisan}>
        <table width="40%" className="tab" align="center">
          <tbody>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white' }}>
                <font size="4"><b>Kisan Data Directory</b></font>
              </th>
            </tr>
            <tr>
              <td>Kisan Name</td>
              <td>
                <input type="text" value={kisanName} onChange={(e) => setKisanName(e.target.value)} placeholder="Kisan Name" required />
              </td>
            </tr>
            <tr>
              <td>Mobile Number</td>
              <td>
                <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile Number" required />
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <input type="submit" value="Add Kisan" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
