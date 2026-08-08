import React, { useState } from 'react';
import Header from '../components/Header';

export default function SMS({ user, onLogout }) {
  const [sdate, setSdate] = useState(new Date().toISOString().split('T')[0]);
  const [smsList, setSmsList] = useState([]);

  const handleGetSMS = () => {
    // Replicate get SMS logic
    alert("Fetched SMS's to be sent for " + sdate);
    setSmsList([
      { id: 1, name: 'Farmer Ramesh', mobile: '9866123445', message: 'Your bill of Rs 5000.00 is generated.' }
    ]);
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <br />
      <table width="40%" className="tab" align="center">
        <tbody>
          <tr>
            <th colSpan="4" style={{ textAlign: 'center', backgroundColor: '#4286f4', color: 'white' }}>
              <font size="4"><b>SMS</b></font>
            </th>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td>Date</td>
            <td>
              <input
                type="date"
                name="sdate"
                id="sdate"
                value={sdate}
                onChange={(e) => setSdate(e.target.value)}
                required
              />
            </td>
            <td>
              <input
                type="button"
                id="btnSms"
                onClick={handleGetSMS}
                value="Get SMS's To Be Sent"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <br />
      <table width="80%" className="tab" align="center" border="1">
        <thead>
          <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
            <th>S.No.</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>SMS Message</th>
          </tr>
        </thead>
        <tbody>
          {smsList.length === 0 ? (
            <tr><td colSpan="4">No SMS records pending for this date.</td></tr>
          ) : (
            smsList.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>{item.mobile}</td>
                <td>{item.message}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
