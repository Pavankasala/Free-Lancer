import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    if (onLogout) onLogout();
    navigate('/');
  };

  const businessName = user?.business_name || user?.company_full_name || user?.company_name || 'Agri Commission Manager';
  const address = user?.address || 'MAINROAD, NAKREKAL';
  const ownerName = user?.owner_name || user?.name || 'B. Anjaiah';
  const phone = user?.phone || user?.mobile || '9866123445';

  const navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/buyers-details', label: 'Buyers Details' },
    { path: '/expenditures', label: 'Expenditures' },
    { path: '/cash-collection', label: 'Cash' },
    { path: '/bills', label: 'Bills' },
    { path: '/sms', label: 'SMS' },
    { path: '/advance', label: 'Advance' },
    { path: '/balancesheet', label: 'Balance Sheet' },
    { path: '/sell', label: 'Sold Data' },
    { path: '/beatpaper', label: 'Beat Paper' },
    { path: '/kisanbalance', label: 'kisan Balance' },
    ...(user?.user_type === 'ADM' ? [{ path: '/sales', label: 'Delhi' }] : []),
    { path: '/notpaidbills', label: 'Not Paid Bills' },
    { path: '/paidBills', label: 'Paid Bills' },
    { path: '/shops', label: 'Shops' },
    { path: '/localSale', label: 'Local Sale' },
  ];

  return (
    <header>
      <h2 style={{ color: 'white', backgroundColor: '#4286f4', textAlign: 'center', padding: '0px', margin: 0, fontFamily: "'Times New Roman', Times, serif" }}>
        <Link to="/home" style={{ color: 'white', textDecoration: 'underline', fontSize: '26px' }}>
          <u>Agri Commission Manager</u>
        </Link>
        <a href="#logout" onClick={handleLogout} style={{ float: 'right', color: 'white', textDecoration: 'none', paddingRight: '15px' }}>
          <b><u>Logout</u></b>
        </a>
        <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'normal' }}>
          {businessName} {address} {ownerName} {phone}&nbsp;&nbsp;&nbsp;&nbsp;
          [<font color="yellow">{user?.user_name || user?.role || 'Operator'}</font>]&nbsp;&nbsp;&nbsp;&nbsp;
          <Link to="/bags" style={{ color: 'yellow' }}>Bags</Link>&nbsp;&nbsp;&nbsp;&nbsp;
          <Link to="/settings" style={{ color: 'pink' }}>Settings</Link>&nbsp;&nbsp;&nbsp;&nbsp;
          <Link to="/kisans" style={{ color: 'pink' }}>Kisan Data</Link>
        </p>
      </h2>

      <ul>
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
