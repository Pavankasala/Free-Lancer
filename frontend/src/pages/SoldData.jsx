import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const DEFAULT_BUYERS = [
  'Please Select ...',
];

export default function SoldData({ user, onLogout }) {
  const [soldDate, setSoldDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [soldTo, setSoldTo] = useState('');
  const [noOfBags, setNoOfBags] = useState('');
  const [hamaliPerBag, setHamaliPerBag] = useState('');
  const [partyCommission, setPartyCommission] = useState('');
  const [lorryNo, setLorryNo] = useState('');
  const [lorryCharges, setLorryCharges] = useState('');
  const [tons, setTons] = useState('');
  const [enam, setEnam] = useState('');
  const [lorryAdvance, setLorryAdvance] = useState('');
  const [villageRef, setVillageRef] = useState('');

  const [soldList, setSoldList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Buyer options from buyer bills + default
  const [buyerOptions, setBuyerOptions] = useState(DEFAULT_BUYERS);

  useEffect(() => {
    // Load buyer names from buyer bills
    try {
      const savedBuyer = localStorage.getItem('agri_local_buyer_bills');
      if (savedBuyer) {
        const bills = JSON.parse(savedBuyer);
        const buyerNames = bills.map(b => b.name || b.buyerName).filter(Boolean);
        const unique = Array.from(new Set(buyerNames));
        setBuyerOptions(['Please Select ...', ...unique]);
      }
    } catch (e) {}
    fetchSoldData();
  }, []);

  const getLocalSoldData = () => {
    try {
      const saved = localStorage.getItem('agri_local_sold_data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const fetchSoldData = () => {
    const data = getLocalSoldData();
    setSoldList(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!soldTo || soldTo === 'Please Select ...') {
      alert('Please select a buyer in "Sold To"');
      return;
    }

    if (Number(noOfBags) < 0 || Number(hamaliPerBag) < 0 || Number(lorryCharges) < 0 || Number(tons) < 0 || Number(lorryAdvance) < 0) {
      alert('Invalid input! Negative values are not allowed for bags, charges, or advances.');
      return;
    }

    const record = {
      id: editingId || Date.now(),
      date: soldDate,
      name: name,
      soldTo: soldTo,
      noOfBags: Number(noOfBags) || 0,
      hamaliPerBag: Number(hamaliPerBag) || 0,
      partyCommission: partyCommission,
      lorryNo: lorryNo,
      lorryCharges: Number(lorryCharges) || 0,
      tons: Number(tons) || 0,
      enam: enam,
      lorryAdvance: Number(lorryAdvance) || 0,
      villageRef: villageRef,
    };

    try {
      const current = getLocalSoldData();
      let updated;

      if (editingId) {
        updated = current.map(item => item.id === editingId ? record : item);
        alert('Sold data updated successfully');
      } else {
        updated = [record, ...current];
        alert('Sold data saved successfully');
      }

      localStorage.setItem('agri_local_sold_data', JSON.stringify(updated));
      setSoldList(updated);
    } catch (err) {}

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSoldTo('');
    setNoOfBags('');
    setHamaliPerBag('');
    setPartyCommission('');
    setLorryNo('');
    setLorryCharges('');
    setTons('');
    setEnam('');
    setLorryAdvance('');
    setVillageRef('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSoldDate(item.date || soldDate);
    setName(item.name || '');
    setSoldTo(item.soldTo || '');
    setNoOfBags(String(item.noOfBags || ''));
    setHamaliPerBag(String(item.hamaliPerBag || ''));
    setPartyCommission(item.partyCommission || '');
    setLorryNo(item.lorryNo || '');
    setLorryCharges(String(item.lorryCharges || ''));
    setTons(String(item.tons || ''));
    setEnam(item.enam || '');
    setLorryAdvance(String(item.lorryAdvance || ''));
    setVillageRef(item.villageRef || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    try {
      const current = getLocalSoldData();
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem('agri_local_sold_data', JSON.stringify(updated));
      setSoldList(updated);
    } catch (e) {}
    setConfirmDeleteId(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Card 1: Sold Data Form */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              {editingId ? 'Edit Sold Data' : 'Sold Data'}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
              {/* Date */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Date:</label>
                <input type="date" value={soldDate} onChange={(e) => setSoldDate(e.target.value)} required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Name */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Sold To */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Sold To:</label>
                <select value={soldTo} onChange={(e) => setSoldTo(e.target.value)} required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', backgroundColor: '#ffffff' }}>
                  {buyerOptions.map((opt, idx) => (
                    <option key={idx} value={opt === 'Please Select ...' ? '' : opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* No. of bags */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>No. of bags:</label>
                <input type="number" value={noOfBags} onChange={(e) => setNoOfBags(e.target.value)} placeholder="bags" required
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Hamali per Bag */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Hamali per Bag:</label>
                <input type="number" value={hamaliPerBag} onChange={(e) => setHamaliPerBag(e.target.value)} placeholder="hamali"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Party Commission */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Party Commission:</label>
                <input type="text" value={partyCommission} onChange={(e) => setPartyCommission(e.target.value)} placeholder="Commission"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Lorry No. */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Lorry No.:</label>
                <input type="text" value={lorryNo} onChange={(e) => setLorryNo(e.target.value)} placeholder="Lorry Number"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Lorry Charges */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Lorry Charges:</label>
                <input type="number" value={lorryCharges} onChange={(e) => setLorryCharges(e.target.value)} placeholder="Lorry Charges"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Ton(s) */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Ton(s):</label>
                <input type="number" value={tons} onChange={(e) => setTons(e.target.value)} placeholder="Ton"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Enam */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Enam:</label>
                <input type="text" value={enam} onChange={(e) => setEnam(e.target.value)} placeholder="Enam"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Lorry Advance */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Lorry Advance:</label>
                <input type="number" value={lorryAdvance} onChange={(e) => setLorryAdvance(e.target.value)} placeholder="Lorry Advance"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              {/* Village/Ref */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '130px', fontWeight: 'bold', fontSize: '14px' }}>Village/Ref:</label>
                <input type="text" value={villageRef} onChange={(e) => setVillageRef(e.target.value)} placeholder="village/Ref"
                  style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit"
                  style={{ flex: '1', padding: '10px', backgroundColor: editingId ? '#eab308' : '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingId ? 'Update Sold Data' : 'Submit'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit}
                    style={{ padding: '10px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Card 2: Sold Data Table */}
          <div style={{ flex: '2 1 500px', minWidth: '320px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#15803d', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              Sold Data Records
            </div>

            <div style={{ padding: '16px', overflowX: 'auto' }}>
              {soldList.length === 0 ? (
                <h3 align="center" style={{ color: '#dc2626', margin: '24px 0', fontStyle: 'italic', fontSize: '1.2rem' }}>No Data Found</h3>
              ) : (
                <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>No. Of Bags</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Sold To</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Commission (%)</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Hamali</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Lorry No.</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Lorry Charges</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Enam</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Tons</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Advance</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldList.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{item.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.noOfBags}</td>
                        <td style={{ padding: '8px' }}>{item.soldTo}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.partyCommission || '-'}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.hamaliPerBag || 0}</td>
                        <td style={{ padding: '8px' }}>{item.lorryNo || '-'}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{Number(item.lorryCharges || 0).toLocaleString()}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.enam || '-'}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.tons || 0}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>₹{Number(item.lorryAdvance || 0).toLocaleString()}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button type="button" onClick={() => handleEdit(item)}
                              style={{ backgroundColor: '#eab308', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                              Edit
                            </button>
                            <button type="button" onClick={() => setConfirmDeleteId(item.id)}
                              style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
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
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '1.25rem' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#334155' }}>
              Are you sure you want to delete this sold data record?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button type="button" onClick={() => handleDelete(confirmDeleteId)}
                style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                Yes, Delete
              </button>
              <button type="button" onClick={() => setConfirmDeleteId(null)}
                style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
