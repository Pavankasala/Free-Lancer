import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [userid, setUserid] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/login', {
        username: userid,
        password: pwd
      });

      if (res.data.success) {
        onLoginSuccess(res.data.user);
        navigate('/home');
      } else {
        alert("Login Failed");
      }
    } catch (err) {
      alert("Login Failed");
      setError('Login Failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <form onSubmit={handleSubmit}>
        <table width="20%" className="tab" style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th colSpan="2" style={{ backgroundColor: '#4286f4', color: 'white', padding: '8px' }}>
                <center>
                  <font size="5"><b>Operator Login</b></font>
                </center>
              </th>
            </tr>
            <tr>
              <td style={{ padding: '10px', textAlign: 'left' }}>Username</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="text"
                  size="25"
                  name="userid"
                  id="userid"
                  value={userid}
                  onChange={(e) => setUserid(e.target.value)}
                  required
                  autoFocus
                />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', textAlign: 'left' }}>Password:</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="password"
                  size="25"
                  name="pwd"
                  id="pwd"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td style={{ padding: '10px' }}>
                <input type="submit" value="Login" name="login" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
