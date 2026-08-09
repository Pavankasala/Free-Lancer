import React, { useState } from 'react';
import Header from '../components/Header';

export default function Kisans({ user, onLogout }) {
  const [kisanName, setKisanName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleAddKisan = (e) => {
    e.preventDefault();
    setMessage(`Kisan record saved: ${kisanName}`);
    setKisanName('');
    setMobile('');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '450px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            Kisan Data Directory
          </div>

          <form onSubmit={handleAddKisan} style={{ padding: '16px' }}>
            {message && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '4px', textAlign: 'center', marginBottom: '12px', fontWeight: 'bold' }}>
                {message}
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
      </div>
    </div>
  );
}
