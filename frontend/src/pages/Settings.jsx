import React, { useState } from 'react';
import Header from '../components/Header';

export default function Settings({ user, onLogout }) {
  const [defaultHamali, setDefaultHamali] = useState(user?.default_hamali || 10);

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <br />
      <form onSubmit={handleSave}>
        <table width="40%" className="tab" align="center">
          <tbody>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white' }}>
                <font size="4"><b>System Settings</b></font>
              </th>
            </tr>
            <tr>
              <td>Default Hamali Charge per Bag</td>
              <td>
                <input type="number" value={defaultHamali} onChange={(e) => setDefaultHamali(e.target.value)} required />
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <input type="submit" value="Save Settings" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
