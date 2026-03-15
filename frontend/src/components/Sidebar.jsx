import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Presentation, ActivitySquare, PieChart, History, ShieldAlert, Settings } from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/strategies', label: 'Strategies', icon: Presentation },
    { path: '/backtesting', label: 'Backtesting', icon: ActivitySquare },
    { path: '/analytics', label: 'Analytics', icon: PieChart },
    { path: '/history', label: 'Trade History', icon: History },
    { path: '/risk', label: 'Risk Tools', icon: ShieldAlert },
    { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="navbar-brand">FXQuant Pro</div>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon className="nav-icon" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-3 border-top border-secondary">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary me-2" style={{ width: 35, height: 35 }}></div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>Trader Profile</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pro Account</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
