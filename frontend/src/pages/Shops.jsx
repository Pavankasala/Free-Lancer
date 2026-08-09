import React, { useState } from 'react';
import Header from '../components/Header';

export default function Shops({ user, onLogout }) {
  const [billdate, setBilldate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [bags, setBags] = useState('');
  const [price, setPrice] = useState('');
  const [advance, setAdvance] = useState('');

  const [billdate1, setBilldate1] = useState(new Date().toISOString().split('T')[0]);
  const [shopBills, setShopBills] = useState([]);
  const [shopBillsSearched, setShopBillsSearched] = useState(false);

  const [selectedYear, setSelectedYear] = useState('2026');
  const [txtShopsName, setTxtShopsName] = useState('');
  const [searchData, setSearchData] = useState(null);

  const years = [];
  for (let y = 2017; y <= 2060; y++) {
    years.push(y);
  }

  const handleAddShopBill = (e) => {
    e.preventDefault();
    alert("Saved successfully!");
    setName('');
    setBags('');
    setPrice('');
    setAdvance('');
  };

  const handleGetShopBills = () => {
    setShopBills([
      { id: 1, name: 'Shop Laxmi Stores', bags: 20, price: 450, advance: 1000, total: 9000, date: billdate1 }
    ]);
    setShopBillsSearched(true);
  };

  const handleGetShopsData = () => {
    setSearchData({
      shopName: txtShopsName,
      year: selectedYear,
      records: [
        { id: 1, date: `${selectedYear}-05-12`, bags: 50, price: 400, advance: 2000, pending: 18000 }
      ]
    });
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Form Card 1: Add Bill Shop */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              Add Bill Shop
            </div>

            <form onSubmit={handleAddShopBill} style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '110px', fontWeight: 'bold', fontSize: '14px' }}>Date:</label>
                <input type="date" value={billdate} onChange={(e) => setBilldate(e.target.value)} required style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '110px', fontWeight: 'bold', fontSize: '14px' }}>Shop Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '110px', fontWeight: 'bold', fontSize: '14px' }}>No. of bags:</label>
                <input type="number" value={bags} onChange={(e) => setBags(e.target.value)} placeholder="Bags" required style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '110px', fontWeight: 'bold', fontSize: '14px' }}>Price Per Bag:</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ width: '110px', fontWeight: 'bold', fontSize: '14px' }}>Advance Given:</label>
                <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="Advance" style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
              </div>

              <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit Shop Bill
              </button>
            </form>
          </div>

          {/* Form Card 2: List Of Shop Bills */}
          <div style={{ flex: '1 1 340px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#4286f4', color: 'white', padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
              List Of Shop Bills
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <input type="date" value={billdate1} onChange={(e) => setBilldate1(e.target.value)} required style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1' }} />
                <button type="button" onClick={handleGetShopBills} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Get Shop Bills
                </button>
              </div>

              {shopBillsSearched && (
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                  <table width="100%" style={{ borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                        <th style={{ padding: '6px', textAlign: 'left' }}>Shop</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>Bags</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>Price</th>
                        <th style={{ padding: '6px', textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shopBills.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px', fontWeight: 'bold' }}>{b.name}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>{b.bags}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>₹{b.price}</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>₹{b.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

        <br />

        {/* Card 3: Search By Shop Name */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #8ce86a' }}>
          <h2 align="center" style={{ color: '#15803d', margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
            - Search By Shop Name -
          </h2>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <input
              type="text"
              value={txtShopsName}
              onChange={(e) => setTxtShopsName(e.target.value)}
              placeholder="Enter Shop Name"
              style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', flex: '1', minWidth: '160px' }}
            />

            <button type="button" onClick={handleGetShopsData} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}>
              Get Details
            </button>
          </div>

          {searchData && (
            <div style={{ overflowX: 'auto' }}>
              <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#15803d', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Bags</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Price</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Advance (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Pending (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {searchData.records.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>{r.date}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{r.bags}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>₹{r.price}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{r.advance}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>₹{r.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
