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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
