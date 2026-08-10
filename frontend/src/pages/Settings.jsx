import React, { useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

export default function Settings({ user, onLogout, onUpdateUser }) {
  const [businessName, setBusinessName] = useState(user?.business_name || user?.company_full_name || 'Agri Commission Manager');
  const [ownerName, setOwnerName] = useState(user?.owner_name || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || user?.mobile || '');
  const [address, setAddress] = useState(user?.address || '');
  const [defaultHamali, setDefaultHamali] = useState(user?.default_hamali || 0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const updatedData = {
      ...user,
      name: ownerName,
      owner_name: ownerName,
      company_full_name: businessName,
      business_name: businessName,
      mobile: phone,
      phone: phone,
      address: address,
      default_hamali: parseFloat(defaultHamali) || 0
    };

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/update-profile`, {
        user_id: user?.user_id || user?.id,
        user_name: user?.user_name || 'admin',
        name: ownerName,
        business_name: businessName,
        phone: phone,
        address: address,
        default_hamali: parseFloat(defaultHamali) || 0
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data && res.data.success) {
        const finalUser = res.data.user ? { ...updatedData, ...res.data.user } : updatedData;
        localStorage.setItem('user', JSON.stringify(finalUser));
        if (onUpdateUser) {
          onUpdateUser(finalUser);
        }
        setMessage('Settings & profile details updated successfully!');
      } else {
        setError(res.data?.message || 'Failed to save profile. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <br />
      <form onSubmit={handleSave} style={{ padding: '0 10px' }}>
        <table width="100%" className="tab" align="center" style={{ maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
          <tbody>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '12px' }}>
                <font size="4"><b>System & Profile Settings</b></font>
              </th>
            </tr>

            {message && (
              <tr>
                <td colSpan="2" style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                  {message}
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan="2" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                  {error}
                </td>
              </tr>
            )}


            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Commission Shop / Business Name:</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{ width: '90%', padding: '8px', fontSize: '14px' }}
                  required
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Owner / User Name:</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  style={{ width: '90%', padding: '8px', fontSize: '14px' }}
                  placeholder="e.g. John Doe"
                  required
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Mobile Number / Phone:</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '90%', padding: '8px', fontSize: '14px' }}
                  placeholder="e.g. 9800000000"
                  required
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Address / Location:</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '90%', padding: '8px', fontSize: '14px' }}
                  placeholder="e.g. Market Road, City"
                  required
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Default Hamali Charge per Bag (₹):</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={defaultHamali}
                  onChange={(e) => setDefaultHamali(e.target.value)}
                  style={{ width: '90%', padding: '8px', fontSize: '14px' }}
                  required
                />
              </td>
            </tr>

            <tr>
              <td></td>
              <td style={{ padding: '10px' }}>
                <input
                  type="submit"
                  value={loading ? "Saving..." : "Save Settings & Profile"}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
