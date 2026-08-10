import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function Kisans({ user, onLogout }) {
  const [kisanName, setKisanName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [kisansList, setKisansList] = useState([]);

  const fetchKisans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/kisans`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.success) {
        setKisansList(res.data.kisans || []);
      }
    } catch (err) {
      setKisansList([]);
    }
  };

  useEffect(() => {
    fetchKisans();
  }, []);

  const handleAddKisan = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!kisanName.trim()) {
      setError("Kisan name is required");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/kisans`, {
        name: kisanName.trim(),
        mobile: mobile.trim()
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data && res.data.success) {
        setMessage(res.data.message || `Kisan record saved: ${kisanName}`);
        setKisanName('');
        setMobile('');
        fetchKisans();
        setTimeout(() => setMessage(''), 4000);
      } else {
        setError(res.data?.message || "Failed to save Kisan record.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save Kisan record. Please try again.");
    }
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Add Kisan Form Card */}
        <div style={{ maxWidth: '450px', margin: '0 auto 20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            Kisan Data Directory
          </div>

          <form onSubmit={handleAddKisan} style={{ padding: '16px' }}>
            {message && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '4px', textAlign: 'center', marginBottom: '12px', fontWeight: 'bold' }}>
                {message}
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px', borderRadius: '4px', textAlign: 'center', marginBottom: '12px', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ width: '120px', fontWeight: 'bold', fontSize: '14px' }}>Kisan Name:</label>
              <input
                type="text"
                value={kisanName}
                onChange={(e) => setKisanName(e.target.value)}
                placeholder="Kisan Name"
                required
                style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
              />
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ width: '120px', fontWeight: 'bold', fontSize: '14px' }}>Mobile Number:</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile Number"
                required
                style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add Kisan Record
            </button>
          </form>
        </div>

        {/* Kisan Records List Card */}
        <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
          <h2 align="center" style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
            - Registered Kisan Records -
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table width="100%" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                  <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>S.No.</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Kisan Name</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Mobile Number</th>
                </tr>
              </thead>
              <tbody>
                {kisansList.length === 0 ? (
                  <tr>
                    <td colSpan="3" align="center" style={{ padding: '16px', color: '#dc2626', fontWeight: 'bold' }}>
                      No Kisan records found.
                    </td>
                  </tr>
                ) : (
                  kisansList.map((k, idx) => (
                    <tr key={k.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{k.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{k.mobile || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

