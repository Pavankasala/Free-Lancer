import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../api/config';

export default function Expenditures({ user, onLogout }) {
  const [edate, setEdate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const [singleList, setSingleList] = useState([]);
  const [rangeList, setRangeList] = useState([]);
  const [singleSearched, setSingleSearched] = useState(false);
  const [rangeSearched, setRangeSearched] = useState(false);

  const getLocalExpenditures = () => {
    try {
      const saved = localStorage.getItem('agri_local_expenditures');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalExpenditure = (exp) => {
    try {
      const current = getLocalExpenditures();
      localStorage.setItem('agri_local_expenditures', JSON.stringify([exp, ...current]));
    } catch (e) {}
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const newExp = { id: Date.now(), date: edate, description: reason, amount: Number(amount) || 0 };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/expenditures`, {
        date: edate,
        description: reason,
        amount: amount
      });
      if (res.data && res.data.success) {
        saveLocalExpenditure(res.data.expenditure || newExp);
      } else {
        saveLocalExpenditure(newExp);
      }
    } catch (err) {
      saveLocalExpenditure(newExp);
    }
    alert('Expenditure added successfully');
    setAmount('');
    setReason('');
  };

  const fetchSingleDate = async () => {
    const local = getLocalExpenditures().filter(e => e.date === singleDate);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenditures?date=${singleDate}`);
      if (res.data && res.data.success) {
        const apiExp = res.data.expenditures || [];
        setSingleList([...local, ...apiExp]);
        setSingleSearched(true);
        return;
      }
    } catch (err) {}
    setSingleList(local);
    setSingleSearched(true);
  };

  const fetchRangeDate = async () => {
    const local = getLocalExpenditures().filter(e => e.date >= fromDate && e.date <= toDate);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenditures?fromDate=${fromDate}&toDate=${toDate}`);
      if (res.data && res.data.success) {
        const apiExp = res.data.expenditures || [];
        setRangeList([...local, ...apiExp]);
        setRangeSearched(true);
        return;
      }
    } catch (err) {}
    setRangeList(local);
    setRangeSearched(true);
  };

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <Header user={user} onLogout={onLogout} />
      <br />
      <table width="100%">
        <tbody>
          <tr>
            {/* Table 1: Add Expenditures */}
            <td valign="top" width="20%">
              <form onSubmit={handleAddSubmit}>
                <table className="tab" width="100%">
                  <tbody>
                    <tr>
                      <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>Expenditures</th>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Date</td>
                      <td>
                        <input type="date" value={edate} onChange={(e) => setEdate(e.target.value)} required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Amount</td>
                      <td>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Reason</td>
                      <td>
                        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" required />
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

            {/* Table 2: List Expenditures by single date */}
            <td valign="top" width="30%">
              <table className="tab" width="100%">
                <tbody>
                  <tr>
                    <th colSpan="3" align="center" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>List Expenditures</th>
                  </tr>
                  <tr>
                    <td align="left" style={{ padding: '6px 8px', fontWeight: 'bold' }}>Date</td>
                    <td>
                      <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} required />
                    </td>
                    <td>
                      <input type="button" value="Get Expenditures" onClick={fetchSingleDate} />
                    </td>
                  </tr>
                  {singleSearched && (
                    <tr>
                      <td colSpan="3">
                        <table width="100%" border="1" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                              <th>S.No.</th>
                              <th>Reason</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {singleList.length === 0 ? (
                              <tr><td colSpan="3">No records found</td></tr>
                            ) : (
                              singleList.map((item, idx) => (
                                <tr key={item.id}>
                                  <td>{idx + 1}</td>
                                  <td>{item.description}</td>
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

            {/* Table 3: List Complete Expenditures Range */}
            <td valign="top" width="50%">
              <table className="tab" width="100%">
                <tbody>
                  <tr>
                    <th colSpan="2" align="center" style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px' }}>List Complete Expenditures</th>
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
                      <input type="button" value="Get Expenditures" onClick={fetchRangeDate} />
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
                              <th>Reason</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rangeList.length === 0 ? (
                              <tr><td colSpan="4">No range records found</td></tr>
                            ) : (
                              rangeList.map((item, idx) => (
                                <tr key={item.id}>
                                  <td>{idx + 1}</td>
                                  <td>{item.date}</td>
                                  <td>{item.description}</td>
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
