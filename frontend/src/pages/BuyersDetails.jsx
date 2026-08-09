import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import TimePicker from '../components/TimePicker';
import BillModal from '../components/BillModal';

export default function BuyersDetails({ user, onLogout }) {
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

  const handleDeleteBill = async (billId) => {
    try {
      const res = await axios.delete(`http://127.0.0.1:5000/api/delete-bill/${billId}`);
      if (res.data.success) {
        setBills(prev => prev.filter(b => b.id !== billId));
      } else {
        setBills(prev => prev.filter(b => b.id !== billId));
      }
    } catch (err) {
      console.error(err);
      setBills(prev => prev.filter(b => b.id !== billId));
    }
  };

  const fetchBills = async (selectedDate) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/home-bills?date=${selectedDate}`);
      if (res.data.success) {
        setBills(res.data.bills || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills(billdate);
  }, [billdate]);

  const addChannel = (e) => {
    e.preventDefault();
    if (channels.length < 10) {
      setChannels([...channels, { bags: '', price: '' }]);
    } else {
      alert("Maximum channels 10 only");
    }
  };

  const handleChannelChange = (index, field, value) => {
    const updated = [...channels];
    updated[index][field] = value;
    setChannels(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/add-bill', {
        name,
        billdate,
        advanceTime,
        items: channels,
        hamali,
        advance,
        bagsSold,
        priceSold
      });
      if (res.data.success) {
        alert('saved successfully');
        setName('');
        setChannels([{ bags: '', price: '' }]);
        setAdvance('');
        setBagsSold('');
        setPriceSold('');
        fetchBills(billdate);
      }
    } catch (err) {
      alert('Error saving bill');
    }
  };

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      
      <form onSubmit={handleSubmit}>
        <br />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td width="25%" valign="top" style={{ paddingLeft: '10px' }}>
                <table className="tab add-bill-form" style={{ width: '100%', border: '1px solid #8ce86a' }}>
                  <tbody>
                    <tr>
                      <th align="center" colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>
                        <center><font size="4"><b>Buyers Details</b></font></center>
                      </th>
                    </tr>
                    <tr>
                      <td className="form-label">Date</td>
                      <td align="left" style={{ padding: '4px' }}>
                        <input
                          type="date"
                          name="billdate"
                          id="billdate"
                          value={billdate}
                          onChange={(e) => setBilldate(e.target.value)}
                          required
                          style={{ border: '1px solid #767676', width: '150px' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="form-label">Buyers Name</td>
                      <td align="left" style={{ padding: '4px' }}>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Buyers Name"
                          required
                          style={{ border: '1px solid #767676', width: '150px' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        <p style={{ margin: 0 }}>
                          <a href="#addChannel" onClick={addChannel} style={{ color: '#0000FF', textDecoration: 'underline', fontWeight: 'bold' }}>
                            <font size="3">Click to add a Channel</font>
                          </a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{ padding: '4px 6px', textAlign: 'left' }}>
                        {channels.map((ch, idx) => (
                          <div key={idx} style={{ marginBottom: '4px', textAlign: 'left' }}>
                            <input
                              type="text"
                              name="BX_NOOFBAGS[]"
                              value={ch.bags}
                              onChange={(e) => handleChannelChange(idx, 'bags', e.target.value)}
                              placeholder="No. Of Bags"
                              required
                              style={{ border: '1px solid #767676', width: '110px', marginRight: '6px' }}
                            />
                            <input
                              type="number"
                              name="BX_PRICE[]"
                              value={ch.price}
                              onChange={(e) => handleChannelChange(idx, 'price', e.target.value)}
                              placeholder="Price per Bag"
                              required
                              style={{ border: '1px solid #767676', width: '110px' }}
                            />
                          </div>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <td className="form-label">Hamali Per Bag</td>
                      <td align="left" style={{ padding: '4px' }}>
                        <input
                          type="number"
                          name="txtHamali"
                          value={hamali}
                          onChange={(e) => setHamali(e.target.value)}
                          placeholder="Hamali Per Bag"
                          style={{ border: '1px solid #767676', width: '150px' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="form-label">Advance</td>
                      <td align="left" style={{ padding: '4px' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="number"
                            name="advance"
                            value={advance}
                            onChange={(e) => setAdvance(e.target.value)}
                            placeholder="Advance"
                            style={{ border: '1px solid #767676', width: '80px' }}
                          />
                          <input
                            type="date"
                            name="advanceDate"
                            value={advanceDate}
                            onChange={(e) => setAdvanceDate(e.target.value)}
                            style={{ border: '1px solid #767676', width: '125px' }}
                          />
                          <TimePicker value={advanceTime} onChange={(t) => setAdvanceTime(t)} />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="form-label">Price of Sold Bag</td>
                      <td align="left" style={{ padding: '4px' }}>
                        <input
                          type="number"
                          name="priceSold"
                          value={priceSold}
                          onChange={(e) => setPriceSold(e.target.value)}
                          placeholder="Price of Sold Bag"
                          style={{ border: '1px solid #767676', width: '150px' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td align="left" style={{ padding: '4px' }}>
                        <input type="submit" className="btn" id="submit" name="submit" value="Submit" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td width="35%" valign="top">&nbsp;</td>
              <td width="40%" valign="top" align="right" style={{ paddingRight: '20px' }}>
                <img
                  src="/printbills.png"
                  id="btnPrint"
                  name="btnPrint"
                  alt="Print Bills"
                  style={{ cursor: 'pointer', marginTop: '120px' }}
                  onClick={() => alert("Print Bill screen")}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <br />
      <div style={{ padding: '0 10px' }}>
        <table width="100%" className="tab" style={{ border: '1px solid #8ce86a' }}>
          <tbody>
            <tr>
              <td>
                <h2 align="center" style={{ color: 'green', backgroundColor: 'white', margin: '5px 0' }}>
                  - Bills On This Day -
                </h2>
              </td>
            </tr>
            <tr>
              <td>
                {bills.length === 0 ? (
                  <h2><font color="red">No Bills Found</font></h2>
                ) : (
                  <table width="100%" border="0" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>S.No.</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Buyers Name</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>No.of bags</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Price</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Total</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Advance</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Date & Time</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Paid</th>
                        <th align="left" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((b, idx) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #ddd' }}>
                          <td align="left">{idx + 1}</td>
                          <td align="left">{b.name}</td>
                          <td align="left"><b>{b.no_of_bags}</b></td>
                          <td align="left"><b>{b.price}</b></td>
                          <td align="left"><b>{(b.no_of_bags * b.price).toFixed(2)}</b></td>
                          <td align="left"><b>₹ {(Number(b.advance) || 0).toFixed(2)}</b></td>
                          <td align="left">{b.date} {b.time || b.advanceTime || b.advanceDateTime || '11:35 PM'}</td>
                          <td align="left"><font color={b.paid === 'YES' ? 'blue' : 'red'}>{b.paid || 'NO'}</font></td>
                          <td align="left">
                            <button
                              type="button"
                              onClick={() => setSelectedBill(b)}
                              style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '3px',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                marginRight: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(b.id)}
                              style={{
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '3px',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />

      {confirmDeleteId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1' }}>
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
    </div>
  );
}
