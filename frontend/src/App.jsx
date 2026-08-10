import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Agri Commission Manager App Routing
import Login from './pages/Login';
import Signup from './pages/Signup';
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

import Bills from './pages/Bills';
import Advance from './pages/Advance';
import SoldData from './pages/SoldData';
import BuyerBalance from './pages/BuyerBalance';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const saved = localStorage.getItem('user');
      if (!token || !token.trim() || !saved) {
        return null;
      }
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  });

  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/home" element={isAuthenticated ? <Home user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : <Navigate to="/" />} />
        
        {/* Buyers Details */}
        <Route path="/buyers-details" element={isAuthenticated ? <BuyersDetails user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/buyersDetails" element={isAuthenticated ? <BuyersDetails user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/sell" element={isAuthenticated ? <SoldData user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/sold-data" element={isAuthenticated ? <SoldData user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Expenditures */}
        <Route path="/expenditures" element={isAuthenticated ? <Expenditures user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Cash Collection */}
        <Route path="/cash-collection" element={isAuthenticated ? <CashCollection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/cashCollection" element={isAuthenticated ? <CashCollection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/cash" element={isAuthenticated ? <CashCollection user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Balance Sheet */}
        <Route path="/balancesheet" element={isAuthenticated ? <BalanceSheet user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/balanceSheet" element={isAuthenticated ? <BalanceSheet user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* SMS */}
        <Route path="/sms" element={isAuthenticated ? <SMS user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Beat Paper */}
        <Route path="/beatpaper" element={isAuthenticated ? <BeatPaper user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/beatPaper" element={isAuthenticated ? <BeatPaper user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Local Sale */}
        <Route path="/localSale" element={isAuthenticated ? <LocalSale user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/localsale" element={isAuthenticated ? <LocalSale user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Kisan Balance & Buyer Balance */}
        <Route path="/kisanbalance" element={isAuthenticated ? <KisanBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/kisanBalance" element={isAuthenticated ? <KisanBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/buyerbalance" element={isAuthenticated ? <BuyerBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/buyers-balance" element={isAuthenticated ? <BuyerBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/buyerBalance" element={isAuthenticated ? <BuyerBalance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Not Paid / Paid Bills */}
        <Route path="/notpaidbills" element={isAuthenticated ? <NotPaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/notPaidBills" element={isAuthenticated ? <NotPaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/paidBills" element={isAuthenticated ? <PaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/paidbills" element={isAuthenticated ? <PaidBills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Shops & Miscellaneous */}
        <Route path="/shops" element={isAuthenticated ? <Shops user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/bags" element={isAuthenticated ? <Bags user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : <Navigate to="/" />} />
        <Route path="/kisans" element={isAuthenticated ? <Kisans user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />

        {/* Bills & Advance Dedicated Routes */}
        <Route path="/bills" element={isAuthenticated ? <Bills user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/advance" element={isAuthenticated ? <Advance user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

