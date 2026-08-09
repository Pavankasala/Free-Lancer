import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

export default function UserProfileModal({ isOpen, onClose, user, onSaveSuccess }) {
  const [businessName, setBusinessName] = useState(user?.business_name || user?.company_full_name || 'Agri Commission Manager');
  const [ownerName, setOwnerName] = useState(user?.owner_name || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || user?.mobile || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const markShownAndClose = () => {
    localStorage.setItem('agri_profile_modal_shown', 'true');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerName) {
      setError('Please enter owner/user name');
      return;
    }
    if (!phone) {
      setError('Please enter mobile number');
      return;
    }
    if (!address) {
      setError('Please enter address / location');
      return;
    }

    setLoading(true);
    setError('');

    const updatedUser = {
      ...user,
      name: ownerName,
      owner_name: ownerName,
      company_full_name: businessName,
      business_name: businessName,
      mobile: phone,
      phone: phone,
      address: address
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/update-profile`, {
        user_id: user?.user_id || user?.id,
        user_name: user?.user_name || 'admin',
        name: ownerName,
        business_name: businessName,
        phone: phone,
        address: address,
        default_hamali: user?.default_hamali || 0
      });

      const finalUser = res.data?.user ? { ...updatedUser, ...res.data.user } : updatedUser;
      localStorage.setItem('user', JSON.stringify(finalUser));
      if (onSaveSuccess) onSaveSuccess(finalUser);
      markShownAndClose();
    } catch (err) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onSaveSuccess) onSaveSuccess(updatedUser);
      markShownAndClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#15803d',
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Welcome! Set Up Your Profile</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Enter your shop, name, phone & address</p>
          </div>
          <button onClick={markShownAndClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Commission Shop / Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Agri Commission Agent"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Owner / User Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. John Doe"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Mobile Number / Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9800000000"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Address / Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Market Road, City"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={markShownAndClose}
              style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
