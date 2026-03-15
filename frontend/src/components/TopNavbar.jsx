import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const TopNavbar = ({ onMenuClick }) => {
    return (
        <nav className="navbar border-bottom border-dark px-4 py-3 sticky-top" style={{ background: 'var(--bg-primary)', zIndex: 10 }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    <button className="btn d-lg-none text-white p-0 border-0" onClick={onMenuClick}>
                        <Menu size={24} />
                    </button>
                    <div className="input-group d-none d-md-flex" style={{ width: '300px' }}>
                        <span className="input-group-text bg-transparent border-0 pe-0"><Search size={18} className="text-muted" /></span>
                        <input type="text" className="form-control bg-transparent border-0 text-white" placeholder="Search strategies..." />
                    </div>
                </div>

                <div className="d-flex align-items-center gap-4">
                    <div className="d-flex align-items-center gap-2">
                        <div className="pulse-dot"></div>
                        <span className="text-secondary small d-none d-sm-inline">Market Live</span>
                    </div>
                    <button className="btn p-0 position-relative text-secondary hover-cyan">
                        <Bell size={20} />
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1 border border-dark">
                            <span className="visually-hidden">unread messages</span>
                        </span>
                    </button>
                    <button className="btn btn-primary-custom btn-sm">New Strategy</button>
                </div>
            </div>

            <style>{`
        .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        .hover-cyan:hover { color: var(--accent-primary) !important; }
      `}</style>
        </nav>
    );
};

export default TopNavbar;
