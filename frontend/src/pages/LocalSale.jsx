import React, { useState } from 'react';
import Header from '../components/Header';

export default function LocalSale({ user, onLogout }) {
  const [saledate, setSaledate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [bags, setBags] = useState('');
  const [advance, setAdvance] = useState('');
  const [channels, setChannels] = useState([{ kisanName: '', bags: '', price: '' }]);

  const [sdate, setSdate] = useState(new Date().toISOString().split('T')[0]);
  const [salesList, setSalesList] = useState([]);
  const [searched, setSearched] = useState(false);

  const addChannel = (e) => {
    e.preventDefault();
    if (channels.length < 10) {
      setChannels([...channels, { kisanName: '', bags: '', price: '' }]);
    } else {
      alert("Maximum channels 10 only");
    }
  };

  const handleChannelChange = (index, field, value) => {
    const updated = [...channels];
    updated[index][field] = value;
    setChannels(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("saved successfully");
    setName('');
    setBags('');
    setAdvance('');
    setChannels([{ kisanName: '', bags: '', price: '' }]);
  };

  const handleGetLocalSales = () => {
    setSalesList([
      { id: 1, buyerName: 'Local Retailer', fromKisan: 'Farmer Ramesh', bags: 10, price: 500, total: 5000, date: '08-08-2026', paid: 'NO' }
    ]);
    setSearched(true);
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />

      <form onSubmit={handleSubmit}>
        <table width="100%">
          <tbody>
            <tr>
              {/* Left Column: Local Sale Form (40% width) */}
              <td valign="top" width="40%">
                <table className="tab" width="100%">
                  <tbody>
                    <tr>
                      <th align="center" colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>
                        Local Sale
                      </th>
                    </tr>
                    <tr>
                      <td align="right" style={{ width: '40%', fontWeight: 'bold' }}>Date</td>
                      <td style={{ width: '60%' }}>
                        <input type="date" value={saledate} onChange={(e) => setSaledate(e.target.value)} required style={{ width: '100%' }} />
                      </td>
                    </tr>
                    <tr>
                      <td align="right" style={{ fontWeight: 'bold' }}>Local Sale Name</td>
                      <td>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required style={{ width: '100%' }} />
                      </td>
                    </tr>
                    <tr>
                      <td align="right" style={{ fontWeight: 'bold' }}>No. of bags</td>
                      <td>
                        <input type="number" value={bags} onChange={(e) => setBags(e.target.value)} placeholder="Bags" required style={{ width: '100%' }} />
                      </td>
                    </tr>
                    <tr>
                      <td align="right" style={{ fontWeight: 'bold' }}>Advance Given</td>
                      <td>
                        <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="Advance" style={{ width: '100%' }} />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" align="left" style={{ padding: '6px' }}>
                        <p style={{ margin: 0 }}>
                          <a href="#addChannel" onClick={addChannel} style={{ color: '#0000FF', textDecoration: 'underline', fontWeight: 'bold' }}>
                            <font size="3">Click to add a Channel</font>
                          </a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{ padding: '4px' }}>
                        <table width="100%" border="0" style={{ borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                              <th style={{ width: '40%', color: '#000000', fontSize: '13px', border: 'none', backgroundColor: '#f2f2f2' }}>Kisan Name</th>
                              <th style={{ width: '30%', color: '#000000', fontSize: '13px', border: 'none', backgroundColor: '#f2f2f2' }}>No. of Bags</th>
                              <th style={{ width: '30%', color: '#000000', fontSize: '13px', border: 'none', backgroundColor: '#f2f2f2' }}>Price per Bag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {channels.map((ch, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: '2px', border: 'none' }}>
                                  <input
                                    type="text"
                                    value={ch.kisanName}
                                    onChange={(e) => handleChannelChange(idx, 'kisanName', e.target.value)}
                                    placeholder="Kisan Name"
                                    required
                                    style={{ width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '2px', border: 'none' }}>
                                  <input
                                    type="number"
                                    value={ch.bags}
                                    onChange={(e) => handleChannelChange(idx, 'bags', e.target.value)}
                                    placeholder="No. of Bags"
                                    required
                                    style={{ width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '2px', border: 'none' }}>
                                  <input
                                    type="number"
                                    value={ch.price}
                                    onChange={(e) => handleChannelChange(idx, 'price', e.target.value)}
                                    placeholder="Price per Bag"
                                    required
                                    style={{ width: '100%' }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td align="left" style={{ padding: '6px' }}>
                        <input type="submit" className="btn" value="Submit" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Middle Column: Local Sales By Date */}
              <td valign="top" width="40%" style={{ paddingLeft: '15px' }}>
                <table className="tab" width="100%">
                  <tbody>
                    <tr>
                      <th align="center" colSpan="3" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>
                        Local Sales By Date
                      </th>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Date</td>
                      <td>
                        <input type="date" value={sdate} onChange={(e) => setSdate(e.target.value)} required style={{ width: '100%' }} />
                      </td>
                      <td>
                        <input type="button" id="salebtn" value="Get Local Sales" onClick={handleGetLocalSales} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Right Column: Print Bills Icon */}
              <td valign="top" width="20%" align="center">
                <a href="#printLocalSale" onClick={(e) => { e.preventDefault(); alert("Print Local Sale Bills"); }}>
                  <img src="/printbills.png" alt="Print Bills" style={{ cursor: 'pointer', marginTop: '20px' }} />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <br /><br />
      {/* Bottom Table: Sales On This Day */}
      <div style={{ padding: '0 10px' }}>
        <table width="100%" className="tab">
          <tbody>
            <tr>
              <td>
                <h2 align="center" style={{ color: 'green', backgroundColor: 'white', margin: '5px 0' }}>
                  - Sales On This Day -
                </h2>
              </td>
            </tr>
            <tr>
              <td>
                <table width="100%" border="0" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                      <th align="left">S.No.</th>
                      <th align="left">Buyer Name</th>
                      <th align="left">From Kisan</th>
                      <th align="left">No.of bags</th>
                      <th align="left">Price</th>
                      <th align="left">Total</th>
                      <th align="left">Date (eg: d-m-Y)</th>
                      <th align="left">Paid</th>
                      <th align="left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesList.length === 0 ? (
                      <tr><td colSpan="9" align="center" style={{ padding: '10px' }}>No Local Sales Found</td></tr>
                    ) : (
                      salesList.map((s, idx) => (
                        <tr key={s.id}>
                          <td align="left">{idx + 1}</td>
                          <td align="left">{s.buyerName}</td>
                          <td align="left">{s.fromKisan}</td>
                          <td align="left"><b>{s.bags}</b></td>
                          <td align="left"><b>{s.price}</b></td>
                          <td align="left"><b>{s.total.toFixed(2)}</b></td>
                          <td align="left">{s.date}</td>
                          <td align="left"><font color="red">{s.paid}</font></td>
                          <td align="left"><a href="#delete" onClick={(e) => { e.preventDefault(); alert("delete"); }} style={{ color: 'blue', textDecoration: 'underline' }}>delete</a></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
