import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Activity, BarChart3, History, ShieldAlert, Settings, LogOut, Menu, X } from 'lucide-react';
import authService from '../services/authService';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Target size={20} />, label: 'Make Strategy', path: '/strategies' },
        { icon: <Activity size={20} />, label: 'Test Strategy', path: '/backtesting' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics' },
        { icon: <History size={20} />, label: 'History', path: '/history' },
        { icon: <ShieldAlert size={20} />, label: 'Risk Tools', path: '/risk' },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="btn d-lg-none position-fixed top-0 start-0 m-3 z-3 text-white glass-card p-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay */}
            {isOpen && <div className="sidebar-overlay d-lg-none" onClick={() => setIsOpen(false)}></div>}

            <div className={`sidebar glass-card h-100 d-flex flex-column p-3 ${isOpen ? 'active' : ''}`} style={{ width: '260px', borderRight: '1px solid var(--border-color)', borderLeft: 'none', borderRadius: '0' }}>
                <div className="text-center py-4 mb-4 border-bottom border-dark">
                    <h4 className="fw-bold mb-0"><span style={{ color: 'var(--accent-primary)' }}>FX</span>Quant</h4>
                </div>

                <div className="flex-grow-1 overflow-auto">
                    <ul className="nav flex-column gap-2">
                        {navItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link d-flex align-items-center gap-3 p-3 rounded transition-all ${isActive ? 'bg-secondary text-cyan' : 'text-secondary'}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.icon}
                                    <span className="fw-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto pt-4 border-top border-dark">
                    <div className="p-3 bg-dark rounded mb-3 d-flex align-items-center gap-3">
                        <div className="bg-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <span className="fw-bold text-dark">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="overflow-hidden">
                            <div className="small fw-bold text-truncate">{user?.name || 'Trader'}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Pro Account</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                <style>{`
          .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 999; }
          .text-cyan { color: var(--accent-primary) !important; }
          .nav-link:hover { color: var(--accent-primary) !important; background: rgba(0, 188, 212, 0.05); }
          .transition-all { transition: all 0.2s ease; }
        `}</style>
            </div>
        </>
    );
};

export default Sidebar;
