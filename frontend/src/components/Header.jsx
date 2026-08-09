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
  const address = user?.address || '';
  const ownerName = user?.owner_name || user?.name || 'Operator';
  const phone = user?.phone || user?.mobile || '';

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
    <header style={{ backgroundColor: '#4286f4', color: 'white', padding: '6px 12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontFamily: "'Times New Roman', Times, serif" }}>
          <Link to="/home" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
            {businessName}
          </Link>
        </h2>
        <a href="#logout" onClick={handleLogout} style={{ color: 'white', textDecoration: 'underline', fontSize: '15px', fontWeight: 'bold' }}>
          Logout
        </a>
      </div>

      <p style={{ margin: '6px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'center', opacity: 0.95 }}>
        {[businessName, address, ownerName, phone].filter(Boolean).join(' | ')}
        &nbsp;&nbsp;&nbsp;&nbsp;
        [<font color="yellow">{user?.user_name || user?.role || 'Operator'}</font>]&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/bags" style={{ color: 'yellow', textDecoration: 'underline' }}>Bags</Link>&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/settings" style={{ color: 'pink', textDecoration: 'underline' }}>Settings</Link>&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/kisans" style={{ color: 'pink', textDecoration: 'underline' }}>Kisan Data</Link>
      </p>

      <nav style={{ marginTop: '6px' }}>
        <ul style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', margin: 0, padding: 0, listStyle: 'none' }}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: location.pathname === link.path ? '#1d4ed8' : 'transparent',
                  display: 'inline-block'
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
