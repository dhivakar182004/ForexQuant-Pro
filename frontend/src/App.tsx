import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { OtpVerification } from './pages/OtpVerification';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { TradeHistory } from './pages/TradeHistory';
import { RiskTools } from './pages/RiskTools';
import { Strategies } from './pages/Strategies';
import { Optimizer } from './pages/Optimizer';
import { TickerNav } from './components/TickerNav';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><><TickerNav /><Analytics /></></ProtectedRoute>} />
        <Route path="/trade-history" element={<ProtectedRoute><><TickerNav /><TradeHistory /></></ProtectedRoute>} />
        <Route path="/risk-tools" element={<ProtectedRoute><><TickerNav /><RiskTools /></></ProtectedRoute>} />
        <Route path="/strategies" element={<ProtectedRoute><><TickerNav /><Strategies /></></ProtectedRoute>} />
        <Route path="/optimizer" element={<ProtectedRoute><><TickerNav /><Optimizer /></></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
