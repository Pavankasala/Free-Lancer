import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

export default function CashCollection({ user, onLogout }) {
  const [cbilldate, setCbilldate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [cname, setCname] = useState('');

  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const [singleList, setSingleList] = useState([]);
  const [rangeList, setRangeList] = useState([]);
  const [singleSearched, setSingleSearched] = useState(false);
  const [rangeSearched, setRangeSearched] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/cash-collection', {
        date: cbilldate,
        amount: amount,
        given_by: cname
      });
      if (res.data.success) {
        alert('saved successfully');
        setAmount('');
        setCname('');
      }
    } catch (err) {
      alert('Error saving cash collection');
    }
  };

  const fetchSingleDate = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/cash-collection?date=${singleDate}`);
      if (res.data.success) {
        setSingleList(res.data.cash_collections || []);
        setSingleSearched(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRangeDate = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/cash-collection?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.data.success) {
        setRangeList(res.data.cash_collections || []);
        setRangeSearched(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      <table width="100%">
        <tbody>
          <tr>
            {/* Table 1: Add Cash Collection */}
            <td valign="top" width="20%">
              <form onSubmit={handleAddSubmit}>
                <table className="tab" width="100%">
                  <tbody>
                    <tr>
                      <th align="center" colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Add Cash Collection</th>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Date</td>
                      <td>
                        <input type="date" value={cbilldate} onChange={(e) => setCbilldate(e.target.value)} required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Amount</td>
                      <td>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Name</td>
                      <td>
                        <input type="text" value={cname} onChange={(e) => setCname(e.target.value)} placeholder="Name" required />
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

            {/* Table 2: List Cash Collection by single date */}
            <td valign="top" width="30%">
              <table className="tab" width="100%">
                <tbody>
                  <tr>
                    <th colSpan="3" align="center" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>List Cash Collection</th>
                  </tr>
                  <tr>
                    <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Date</td>
                    <td>
                      <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} required />
                    </td>
                    <td>
                      <input type="button" value="Cash Collections" onClick={fetchSingleDate} />
                    </td>
                  </tr>
                  {singleSearched && (
                    <tr>
                      <td colSpan="3">
                        <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                              <th>S.No.</th>
                              <th>Given By</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {singleList.length === 0 ? (
                              <tr><td colSpan="3">No collections found</td></tr>
                            ) : (
                              singleList.map((item, idx) => (
                                <tr key={item.id}>
                                  <td>{idx + 1}</td>
                                  <td>{item.given_by}</td>
                                  <td><b>{item.amount.toFixed(2)}</b></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>

            {/* Table 3: List Complete Cash Collections Range */}
            <td valign="top" width="40%">
              <table className="tab" width="100%">
                <tbody>
                  <tr>
                    <th colSpan="2" align="center" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>List Complete Cash Collections</th>
                  </tr>
                  <tr>
                    <td>From</td>
                    <td>
                      <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                    </td>
                  </tr>
                  <tr>
                    <td>To</td>
                    <td>
                      <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                    </td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                    <td>
                      <input type="button" value="Get Cash Collections" onClick={fetchRangeDate} />
                    </td>
                  </tr>
                  {rangeSearched && (
                    <tr>
                      <td colSpan="2">
                        <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                              <th>S.No.</th>
                              <th>Date</th>
                              <th>Given By</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rangeList.length === 0 ? (
                              <tr><td colSpan="4">No range collections found</td></tr>
                            ) : (
                              rangeList.map((item, idx) => (
                                <tr key={item.id}>
                                  <td>{idx + 1}</td>
                                  <td>{item.date}</td>
                                  <td>{item.given_by}</td>
                                  <td><b>{item.amount.toFixed(2)}</b></td>
                                </tr>
                              ))
                            )}
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
