import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Target, Activity, BarChart3,
    History, ShieldAlert, Settings, LogOut, Menu, X,
    Zap, MousePointer2, Type, Square, LayoutTemplate
} from 'lucide-react';
import authService from '../services/authService';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getCurrentUser();
    const isTerminal = location.pathname.includes('/terminal');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const coreNav = [
        { icon: <Zap size={20} />, label: 'Terminal', path: '/terminal' },
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Target size={20} />, label: 'Strategies', path: '/strategies' },
        { icon: <Activity size={20} />, label: 'Backtest', path: '/backtesting' },
    ];

    const drawingTools = [
        { icon: <MousePointer2 size={18} />, label: 'Cursor' },
        { icon: <Target size={18} />, label: 'Trend' },
        { icon: <Square size={18} />, label: 'Shape' },
        { icon: <Type size={18} />, label: 'Text' },
        { icon: <LayoutTemplate size={18} />, label: 'Patterns' },
    ];

    return (
        <>
            {/* Mobile Toggle (only visible on small screens or when sidebar is floating) */}
            <button
                className={`btn d-lg-none position-fixed top-0 start-0 m-2 z-3 text-white glass-card p-2 ${isOpen ? 'd-none' : ''}`}
                onClick={() => setIsOpen(true)}
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)' }}
            >
                <Menu size={20} />
            </button>

            {/* Sidebar Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

            <aside className={`sidebar-container ${isOpen ? 'active' : ''} ${isTerminal ? 'mini' : ''}`}>
                <div className="sidebar-header border-bottom border-secondary py-3 text-center">
                    <h5 className="fw-bold mb-0 text-white">
                        <span style={{ color: 'var(--fq-accent)' }}>ForexQuant</span>
                        <span className="ms-1">Pro</span>
                    </h5>
                </div>

                <div className="sidebar-nav-scroll py-3">
                    <div className="nav-section px-2 mb-4">
                        {!isTerminal && <div className="section-label small text-dim mb-2 ps-2">MAIN</div>}
                        <ul className="nav flex-column gap-1">
                            {coreNav.map((item) => (
                                <li key={item.path} className="nav-item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `nav-link side-link ${isActive ? 'active' : ''}`}
                                        title={item.label}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="icon-wrapper">{item.icon}</span>
                                        {!isTerminal && <span className="label-wrapper">{item.label}</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {isTerminal && (
                        <div className="nav-section px-2 mb-4 pt-4 border-top border-secondary">
                            <ul className="nav flex-column gap-2 text-center">
                                {drawingTools.map((tool, idx) => (
                                    <li key={idx} className="nav-item">
                                        <button className="btn side-link w-100 border-0" title={tool.label}>
                                            <span className="icon-wrapper">{tool.icon}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer mt-auto border-top border-secondary p-2">
                    <button onClick={handleLogout} className="btn side-link w-100 text-danger border-0" title="Logout">
                        <span className="icon-wrapper"><LogOut size={20} /></span>
                        {!isTerminal && <span className="label-wrapper ms-3">Logout</span>}
                    </button>
                </div>
            </aside>

            <style>{`
                .sidebar-container {
                    width: 240px;
                    height: 100vh;
                    background: var(--bg-panel);
                    border-right: 1px solid var(--border-main);
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                }
                .sidebar-container.mini {
                    width: 56px;
                }
                .sidebar-container.mini .label-wrapper {
                    display: none;
                }
                .side-link {
                    display: flex;
                    align-items: center;
                    color: var(--text-dim);
                    padding: 10px 12px;
                    border-radius: 6px;
                    text-decoration: none;
                    transition: 0.2s;
                }
                .side-link:hover {
                    color: var(--text-bright);
                    background: rgba(255,255,255,0.05);
                }
                .side-link.active {
                    color: var(--fq-accent);
                    background: var(--fq-accent-light);
                }
                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 32px;
                }
                .sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(2px);
                    z-index: 999;
                    display: none;
                }
                @media (max-width: 991px) {
                    .sidebar-container {
                        position: fixed;
                        left: -240px;
                    }
                    .sidebar-container.active {
                        left: 0;
                    }
                    .sidebar-container.mini {
                        left: -56px;
                    }
                    .sidebar-container.mini.active {
                        left: 0;
                        width: 56px;
                    }
                    .sidebar-overlay {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
