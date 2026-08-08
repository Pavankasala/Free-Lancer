import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import BuyersDetails from './pages/BuyersDetails';
import Expenditures from './pages/Expenditures';
import CashCollection from './pages/CashCollection';
import BalanceSheet from './pages/BalanceSheet';
import SMS from './pages/SMS';
import BeatPaper from './pages/BeatPaper';
import LocalSale from './pages/LocalSale';
import KisanBalance from './pages/KisanBalance';
import NotPaidBills from './pages/NotPaidBills';
import PaidBills from './pages/PaidBills';
import Shops from './pages/Shops';
import Bags from './pages/Bags';
import Settings from './pages/Settings';
import Kisans from './pages/Kisans';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/home" element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Buyers Details */}
        <Route path="/buyers-details" element={user ? <BuyersDetails user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/buyersDetails" element={user ? <BuyersDetails user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/sell" element={user ? <BuyersDetails user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Expenditures */}
        <Route path="/expenditures" element={user ? <Expenditures user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Cash Collection */}
        <Route path="/cash-collection" element={user ? <CashCollection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/cashCollection" element={user ? <CashCollection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/cash" element={user ? <CashCollection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Balance Sheet */}
        <Route path="/balancesheet" element={user ? <BalanceSheet user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/balanceSheet" element={user ? <BalanceSheet user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* SMS */}
        <Route path="/sms" element={user ? <SMS user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Beat Paper */}
        <Route path="/beatpaper" element={user ? <BeatPaper user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/beatPaper" element={user ? <BeatPaper user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Local Sale */}
        <Route path="/localSale" element={user ? <LocalSale user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/localsale" element={user ? <LocalSale user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Kisan Balance */}
        <Route path="/kisanbalance" element={user ? <KisanBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/kisanBalance" element={user ? <KisanBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Not Paid / Paid Bills */}
        <Route path="/notpaidbills" element={user ? <NotPaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/notPaidBills" element={user ? <NotPaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/paidBills" element={user ? <PaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/paidbills" element={user ? <PaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Shops & Miscellaneous */}
        <Route path="/shops" element={user ? <Shops user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/bags" element={user ? <Bags user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? <Settings user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/kisans" element={user ? <Kisans user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />

        {/* Alias routes */}
        <Route path="/bills" element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/advance" element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
