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
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      
      <table width="100%">
        <tbody>
          <tr>
            {/* Top Left: Add Bill Shop (65% width) */}
            <td width="65%" valign="top">
              <form onSubmit={handleAddShopBill}>
                <table className="tab" width="100%">
                  <tbody>
                    <tr>
                      <th align="center" colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Add Bill Shop</th>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Date</td>
                      <td>
                        <input type="date" value={billdate} onChange={(e) => setBilldate(e.target.value)} required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Shop Name</td>
                      <td>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>No. of bags</td>
                      <td>
                        <input type="number" value={bags} onChange={(e) => setBags(e.target.value)} placeholder="Bags" required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Price Per Bag</td>
                      <td>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Advance Given</td>
                      <td>
                        <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="Advance" />
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        <input type="submit" value="Submit" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </td>

            <td width="5%">&nbsp;</td>

            {/* Top Right: List Of Shop Bills (30% width) */}
            <td width="30%" valign="top">
              <table className="tab" width="100%">
                <tbody>
                  <tr>
                    <th align="center" colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>List Of Shop Bills</th>
                  </tr>
                  <tr>
                    <td>Date</td>
                    <td>
                      <input type="date" value={billdate1} onChange={(e) => setBilldate1(e.target.value)} required />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <input type="button" value="Get" onClick={handleGetShopBills} />
                    </td>
                  </tr>
                  {shopBillsSearched && (
                    <tr>
                      <td colSpan="2">
                        <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                              <th>Shop</th>
                              <th>Bags</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shopBills.map(b => (
                              <tr key={b.id}>
                                <td>{b.name}</td>
                                <td>{b.bags}</td>
                                <td>{b.price}</td>
                                <td><b>{b.total}</b></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>

          {/* Bottom Table: Search By Shop Name */}
          <tr>
            <td colSpan="3">
              <br />
              <table className="tab" width="60%">
                <tbody>
                  <tr>
                    <th align="center" colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Search By Shop Name</th>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      Select Year{' '}
                      <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <input
                        type="text"
                        value={txtShopsName}
                        onChange={(e) => setTxtShopsName(e.target.value)}
                        placeholder="Enter Shop Name"
                        style={{ width: '200px', marginRight: '5px' }}
                      />
                      <input type="button" value="Get Details" onClick={handleGetShopsData} />
                    </td>
                  </tr>
                  {searchData && (
                    <tr>
                      <td colSpan="2">
                        <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                              <th>Date</th>
                              <th>Bags</th>
                              <th>Price</th>
                              <th>Advance</th>
                              <th>Pending</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchData.records.map(r => (
                              <tr key={r.id}>
                                <td>{r.date}</td>
                                <td>{r.bags}</td>
                                <td>{r.price}</td>
                                <td>{r.advance}</td>
                                <td><b>{r.pending}</b></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
