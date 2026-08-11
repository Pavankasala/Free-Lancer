import axios from 'axios';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import TimePicker from '../components/TimePicker';
import BillModal from '../components/BillModal';
import UserProfileModal from '../components/UserProfileModal';
import { API_BASE_URL } from '../api/config';

export default function Home({ user, onLogout, onUpdateUser }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(() => {
    const hasBeenShown = localStorage.getItem('agri_profile_modal_shown');
    if (hasBeenShown === 'true') return false;
    return user && (!user.address || !user.phone || !user.business_name);
  });
  const [billdate, setBilldate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [channels, setChannels] = useState([{ bags: '', price: '' }]);
  const [hamali, setHamali] = useState(user?.default_hamali || 0);
  const [advance, setAdvance] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceTime, setAdvanceTime] = useState(() => {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  });
  const [bagsSold, setBagsSold] = useState('');
  const [priceSold, setPriceSold] = useState('');
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingBillId, setEditingBillId] = useState(null);

  const handleDeleteBill = async (billId) => {
    setBills(prev => prev.filter(b => b.id !== billId));
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/delete-bill/${billId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchBills(billdate);
    } catch (err) {
      console.error('Error deleting bill:', err);
      fetchBills(billdate);
    }
  };

  const fetchBills = async (selectedDate) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/home-bills?date=${selectedDate}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.success) {
        const apiBills = res.data.bills || [];
        setBills(apiBills);
      }
    } catch (err) {
      console.error('Error fetching home bills:', err);
    }
  };

  useEffect(() => {
    fetchBills(billdate);
  }, [billdate]);


  const handleEditClick = (b) => {
    setEditingBillId(b.id);
    setName(b.name || '');
    setBilldate(b.date || b.billdate || billdate);
    if (b.channels && b.channels.length > 0) {
      setChannels(b.channels);
    } else {
      setChannels([{ bags: b.no_of_bags || '', price: b.price || '' }]);
    }
    setHamali(b.hamali || 0);
    setAdvance(b.advance || '');
    setBagsSold(b.bagsSold || '');
    setPriceSold(b.priceSold || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addChannel = (e) => {
    e.preventDefault();
    if (channels.length < 200) {
      setChannels([...channels, { bags: '', price: '' }]);
    } else {
      alert("Maximum channels 200 only");
    }
  };

  const handleChannelChange = (index, field, value) => {
    const updated = [...channels];
    updated[index][field] = value;
    setChannels(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const c of channels) {
      if (Number(c.bags) < 0 || Number(c.price) < 0) {
        alert("Invalid input! Bags and Price cannot be negative numbers.");
        return;
      }
    }
    if (Number(advance) < 0 || Number(hamali) < 0 || Number(bagsSold) < 0 || Number(priceSold) < 0) {
      alert("Invalid input! Negative values are not allowed.");
      return;
    }

    const totalBags = channels.reduce((acc, c) => acc + (Number(c.bags) || 0), 0);
    const avgPrice = channels.length > 0 && Number(channels[0].price) ? Number(channels[0].price) : (Number(priceSold) || 0);

    const billObj = {
      id: editingBillId || Date.now(),
      name: name || 'Kisan',
      billdate: billdate,
      date: billdate,
      time: advanceTime,
      advanceTime: advanceTime,
      channels: channels,
      no_of_bags: totalBags,
      price: avgPrice,
      hamali: Number(hamali) || 0,
      advance: Number(advance) || 0,
      bagsSold: bagsSold,
      priceSold: priceSold,
      type: 'BUY',
      paid: 'NO'
    };

    try {
      if (editingBillId) {
        await axios.put(`${API_BASE_URL}/api/update-bill/${editingBillId}`, {
          name,
          date: billdate,
          no_of_bags: totalBags,
          price: avgPrice,
          advance,
          hamali
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/add-bill`, {
          name,
          billdate,
          advanceTime,
          items: channels,
          hamali,
          advance,
          bagsSold,
          priceSold
        });
      }
    } catch (err) {}

    alert(editingBillId ? 'Updated successfully' : 'saved successfully');
    setEditingBillId(null);
    setName('');
    setChannels([{ bags: '', price: '' }]);
    setHamali(5);
    setAdvance('');
    setBagsSold('');
    setPriceSold('');
    fetchBills(billdate);
  };

  const totalBagsToday = bills.reduce((acc, b) => acc + (Number(b.no_of_bags) || 0), 0);
  const totalGrossToday = bills.reduce((acc, b) => acc + (Number(b.no_of_bags * b.price) || 0), 0);

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Responsive Container for Form & Today's Activity Summary */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Add Bill Form Card */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              Kisan Bills
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Date:</label>
                <input
                  type="date"
                  value={billdate}
                  onChange={(e) => setBilldate(e.target.value)}
                  required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '140px' }}
                />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Kisan Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kisan Name"
                  required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '140px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <a href="#addChannel" onClick={addChannel} style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}>
                  Click to add a Channel
                </a>
              </div>

              <div style={{ marginBottom: '12px' }}>
                {channels.map((ch, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={ch.bags}
                      onChange={(e) => handleChannelChange(idx, 'bags', e.target.value)}
                      placeholder="No. Of Bags"
                      required
                      style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '110px' }}
                    />
                    <input
                      type="number"
                      value={ch.price}
                      onChange={(e) => handleChannelChange(idx, 'price', e.target.value)}
                      placeholder="Price per Bag"
                      required
                      style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '110px' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Hamali / Bag:</label>
                <input
                  type="number"
                  value={hamali}
                  onChange={(e) => setHamali(e.target.value)}
                  placeholder="Hamali Per Bag"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '140px' }}
                />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Advance:</label>
                <div style={{ display: 'flex', gap: '6px', flex: '1', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                    placeholder="Amount"
                    style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', width: '80px' }}
                  />
                  <input
                    type="date"
                    value={advanceDate}
                    onChange={(e) => setAdvanceDate(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '120px' }}
                  />
                  <TimePicker value={advanceTime} onChange={(t) => setAdvanceTime(t)} />
                </div>
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Local Sale Price:</label>
                <input
                  type="number"
                  value={priceSold}
                  onChange={(e) => setPriceSold(e.target.value)}
                  placeholder="Price of Sold Bag"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '140px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: '1',
                    padding: '10px',
                    backgroundColor: editingBillId ? '#eab308' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {editingBillId ? 'Update Bill' : 'Submit Bill'}
                </button>
                {editingBillId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#64748b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Replacement for Cut-Off Print Bills Image: Today's Summary & Quick Receipts Cards */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#15803d', fontSize: '1.1rem', fontWeight: 'bold' }}>📊 Today's Business Summary</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>TOTAL BILLS</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#15803d' }}>{bills.length}</div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold' }}>TOTAL BAGS</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1d4ed8' }}>{totalBagsToday}</div>
                </div>

                <div style={{ backgroundColor: '#fefce8', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#854d0e', fontWeight: 'bold' }}>GROSS TOTAL</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a16207' }}>₹{totalGrossToday.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Quick Action Receipts List Cards */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: 'bold' }}>📄 Quick Print & Send Receipts</h3>
              
              {bills.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No bills created for today yet. Fill out the form to add a bill.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {bills.map((b) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{b.name}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {b.no_of_bags} Bags @ ₹{b.price} = <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{b.no_of_bags * b.price}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedBill(b)}
                          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          📄 Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <br />
        
        {/* Bills On This Day Table (Responsive Scrollable) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
          <h2 align="center" style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
            - Bills On This Day ({billdate}) -
          </h2>

          <div style={{ overflowX: 'auto' }}>
            {bills.length === 0 ? (
              <h3 align="center" style={{ color: '#dc2626', margin: '16px 0' }}>No Bills Found</h3>
            ) : (
              <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>S.No</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Kisan Name</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Bags</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Price</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Advance (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Date & Time</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Paid</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b, idx) => (
                    <tr key={b.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{b.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{b.no_of_bags}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>₹{b.price}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹{(b.no_of_bags * b.price).toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>₹{Number(b.advance || 0).toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontSize: '13px' }}>{b.date || billdate} {b.time || b.advanceTime || ''}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: b.paid === 'YES' ? '#16a34a' : '#dc2626' }}>{b.paid || 'NO'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedBill(b)}
                            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(b)}
                            style={{ backgroundColor: '#eab308', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBill(b);
                            }}
                            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            📱 SMS
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(b.id)}
                            style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />

      {confirmDeleteId !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '1.25rem' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#334155' }}>
              Are you sure you want to delete this bill?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  handleDeleteBill(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSaveSuccess={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
        }}
      />
    </div>
  );
}
