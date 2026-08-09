import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const DEFAULT_KISANS = [
  'SSL', 'pmr', 'allamma', 'CHR', 'PLR', 'ARR', 'DPR', 'NB',
  'VRR', 'RRV', 'gdr', 'MVS', 'msrm', 'ksr thathia', 'ASR',
  'AVR', 'BVS', 'JDK', 'JN', 'JR', 'K harsha', 'KAR', 'KPRB', 'KR'
];

export default function Advance({ user, onLogout }) {
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [multiDate, setMultiDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedKisan, setSelectedKisan] = useState('');
  const [singleAmount, setSingleAmount] = useState('0');
  const [editingAdvanceId, setEditingAdvanceId] = useState(null);

  // Multi advance state for list of kisans - default to '0'
  const [multiAdvances, setMultiAdvances] = useState(() => {
    const initial = {};
    DEFAULT_KISANS.forEach(k => {
      initial[k] = '0';
    });
    return initial;
  });

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterKisan, setFilterKisan] = useState('');
  const [advanceList, setAdvanceList] = useState([]);
  const [searched, setSearched] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [kisanOptions, setKisanOptions] = useState(DEFAULT_KISANS);

  useEffect(() => {
    try {
      const savedBills = localStorage.getItem('agri_local_bills');
      if (savedBills) {
        const bills = JSON.parse(savedBills);
        const namesFromBills = bills.map(b => b.name).filter(Boolean);
        const unique = Array.from(new Set([...DEFAULT_KISANS, ...namesFromBills]));
        setKisanOptions(unique);
      }
    } catch (e) {}
  }, []);

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!selectedKisan) {
      alert("Please select a Kisan");
      return;
    }
    if (Number(singleAmount) < 0) {
      alert("Invalid input! Advance amount cannot be negative.");
      return;
    }

    try {
      const current = localStorage.getItem('agri_local_bills');
      const parsed = current ? JSON.parse(current) : [];
      let updated;

      if (editingAdvanceId) {
        updated = parsed.map(b => b.id === editingAdvanceId ? { ...b, name: selectedKisan, date: advanceDate, billdate: advanceDate, advance: Number(singleAmount) || 0 } : b);
        alert(`Advance updated successfully for ${selectedKisan}`);
      } else {
        const newBill = {
          id: Date.now(),
          name: selectedKisan,
          date: advanceDate,
          billdate: advanceDate,
          time: '12:00 PM',
          no_of_bags: 0,
          price: 0,
          advance: Number(singleAmount) || 0,
          paid: 'NO',
          type: 'BUY'
        };
        updated = [newBill, ...parsed];
        alert(`Advance of ₹${singleAmount} added for ${selectedKisan}`);
      }

      localStorage.setItem('agri_local_bills', JSON.stringify(updated));
    } catch (err) {}

    setEditingAdvanceId(null);
    setSelectedKisan('');
    setSingleAmount('0');
    fetchAdvanceDetails();
  };

  const handleMultiChange = (kisan, value) => {
    setMultiAdvances(prev => ({
      ...prev,
      [kisan]: value
    }));
  };

  const handleMultiSubmit = (e) => {
    e.preventDefault();
    const newBills = [];
    Object.entries(multiAdvances).forEach(([kisan, val]) => {
      const amt = Number(val);
      if (amt > 0) {
        newBills.push({
          id: Date.now() + Math.random(),
          name: kisan,
          date: multiDate,
          billdate: multiDate,
          time: '12:00 PM',
          no_of_bags: 0,
          price: 0,
          advance: amt,
          paid: 'NO',
          type: 'BUY'
        });
      }
    });

    if (newBills.length === 0) {
      alert("Please enter advance amount greater than 0 for at least one Kisan");
      return;
    }

    try {
      const current = localStorage.getItem('agri_local_bills');
      const parsed = current ? JSON.parse(current) : [];
      localStorage.setItem('agri_local_bills', JSON.stringify([...newBills, ...parsed]));
    } catch (err) {}

    alert(`Multi Advance saved for ${newBills.length} kisans successfully`);
    fetchAdvanceDetails();
  };

  const handleEditAdvance = (item) => {
    setEditingAdvanceId(item.id);
    setSelectedKisan(item.name || '');
    setAdvanceDate(item.date || item.billdate || advanceDate);
    setSingleAmount(String(item.advance || 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAdvanceId(null);
    setSelectedKisan('');
    setSingleAmount('0');
  };

  const handleDeleteAdvance = (id) => {
    try {
      const current = localStorage.getItem('agri_local_bills');
      const parsed = current ? JSON.parse(current) : [];
      const updated = parsed.filter(b => b.id !== id);
      localStorage.setItem('agri_local_bills', JSON.stringify(updated));
    } catch (e) {}
    setAdvanceList(prev => prev.filter(b => b.id !== id));
  };

  const fetchAdvanceDetails = () => {
    try {
      const saved = localStorage.getItem('agri_local_bills');
      const allBills = saved ? JSON.parse(saved) : [];
      
      const filtered = allBills.filter(b => {
        const hasAdvance = Number(b.advance) > 0;
        const matchesDate = !filterDate || b.date === filterDate || b.billdate === filterDate;
        const matchesKisan = !filterKisan || (b.name || '').toLowerCase().includes(filterKisan.toLowerCase());
        return hasAdvance && matchesDate && matchesKisan;
      });

      setAdvanceList(filtered);
    } catch (e) {
      setAdvanceList([]);
    }
    setSearched(true);
  };

  useEffect(() => {
    fetchAdvanceDetails();
  }, []);

  const totalAdvanceAmount = advanceList.reduce((acc, b) => acc + (Number(b.advance) || 0), 0);

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Card 1: Add Advance (Single Kisan) */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#15803d', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              {editingAdvanceId ? 'Edit Advance' : 'Add Advance'}
            </div>

            <form onSubmit={handleSingleSubmit} style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Date:</label>
                <input
                  type="date"
                  value={advanceDate}
                  onChange={(e) => setAdvanceDate(e.target.value)}
                  required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
                />
                <button type="button" onClick={() => alert(`Date selected: ${advanceDate}`)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Next
                </button>
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Select Kisan:</label>
                <select
                  value={selectedKisan}
                  onChange={(e) => setSelectedKisan(e.target.value)}
                  required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', backgroundColor: '#ffffff' }}
                >
                  <option value="">Select Kisan</option>
                  {kisanOptions.map((kisan, idx) => (
                    <option key={idx} value={kisan}>{kisan}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '100px', fontWeight: 'bold', fontSize: '14px' }}>Advance (₹):</label>
                <input
                  type="number"
                  value={singleAmount}
                  onChange={(e) => setSingleAmount(e.target.value)}
                  placeholder="0"
                  required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: '1', padding: '10px', backgroundColor: editingAdvanceId ? '#eab308' : '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {editingAdvanceId ? 'Update Advance' : 'Submit Advance'}
                </button>
                {editingAdvanceId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{ padding: '10px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Card 2: Add Advance (Multi) */}
          <div style={{ flex: '1 1 400px', minWidth: '300px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#15803d', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              Add Advance (Multi)
            </div>

            <form onSubmit={handleMultiSubmit} style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '60px', fontWeight: 'bold', fontSize: '14px' }}>Date:</label>
                <input
                  type="date"
                  value={multiDate}
                  onChange={(e) => setMultiDate(e.target.value)}
                  required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }}
                />
                <button type="button" onClick={() => alert(`Multi date selected: ${multiDate}`)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Next
                </button>
              </div>

              <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', marginBottom: '12px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  {kisanOptions.map((kisan, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kisan} -</span>
                      <input
                        type="number"
                        value={multiAdvances[kisan] ?? '0'}
                        onChange={(e) => handleMultiChange(kisan, e.target.value)}
                        placeholder="0"
                        style={{ width: '70px', border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Save Multi Advance
              </button>
            </form>
          </div>

        </div>

        <br />

        {/* Card 3: Advance Details Report Table with Action Column */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
          <h2 align="center" style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
            - Advance Details Report -
          </h2>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Filter Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}
            />

            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Kisan Name:</label>
            <select
              value={filterKisan}
              onChange={(e) => setFilterKisan(e.target.value)}
              style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', minWidth: '150px' }}
            >
              <option value="">All Kisans</option>
              {kisanOptions.map((kisan, idx) => (
                <option key={idx} value={kisan}>{kisan}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchAdvanceDetails}
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get Advance Details
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {advanceList.length === 0 ? (
              <h3 align="center" style={{ color: '#dc2626', margin: '16px 0' }}>No Advance Given for selected filters</h3>
            ) : (
              <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '650px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>S.No.</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Kisan / Member Name</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Total Bags</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Advance Amount (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Date & Time</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Payment Status</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {advanceList.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{item.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.no_of_bags}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>
                        ₹{Number(item.advance).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.date || filterDate} {item.time || item.advanceTime || ''}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: item.paid === 'YES' ? '#16a34a' : '#dc2626' }}>
                        {item.paid || 'NO'}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleEditAdvance(item)}
                            style={{ backgroundColor: '#eab308', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <td colSpan="3" align="right" style={{ padding: '10px' }}>Total Advance Given:</td>
                    <td align="right" style={{ padding: '10px', color: '#dc2626', fontSize: '1.1rem' }}>
                      ₹{totalAdvanceAmount.toLocaleString()}
                    </td>
                    <td colSpan="3"></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {confirmDeleteId !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '1.25rem' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#334155' }}>
              Are you sure you want to delete this advance record?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  handleDeleteAdvance(confirmDeleteId);
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
    </div>
  );
}
