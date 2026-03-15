import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Terminal from './pages/Terminal';
import Strategies from './pages/Strategies';
import Backtesting from './pages/Backtesting';
import Analytics from './pages/Analytics';
import TradeHistory from './pages/TradeHistory';
import RiskTools from './pages/RiskTools';
import OtpVerification from './pages/OtpVerification';
import authService from './services/authService';
import './App.css';

// Protected Route Component
const ProtectedRoute = () => {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const Settings = () => <div className="fade-in"><h2>System Settings</h2></div>;

const ConnectionMonitor = () => {
  const [isReachable, setIsReachable] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/auth/health', { timeout: 5000 });
        if (response.status === 200 && mounted) {
          setIsReachable(true);
        }
      } catch (error) {
        if (mounted) setIsReachable(false);
      }
    };
    const interval = setInterval(checkConnection, 15000);
    checkConnection();
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isReachable) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 bg-danger text-white text-center py-2 fade-in" style={{ fontSize: '0.8rem', fontWeight: 700, zIndex: 9999 }}>
      ⚠️ SERVER UNREACHABLE: Please ensure the backend is running on port 8081 or check your network.
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ConnectionMonitor />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OtpVerification />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/terminal" replace />} />
            <Route path="terminal" element={<Terminal />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="strategies" element={<Strategies />} />
            <Route path="backtesting" element={<Backtesting />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="history" element={<TradeHistory />} />
            <Route path="risk" element={<RiskTools />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
