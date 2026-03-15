import React from 'react';
import { Bell, Search, Hexagon } from 'lucide-react';

const TopNavbar = () => {
    return (
        <header className="top-navbar d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center bg-dark rounded px-3 py-1" style={{ border: '1px solid var(--border-color)', width: '300px' }}>
                <Search size={16} color="var(--text-muted)" className="me-2" />
                <input
                    type="text"
                    placeholder="Search markets, strategies..."
                    className="bg-transparent border-0 text-white w-100"
                    style={{ outline: 'none', fontSize: '0.9rem' }}
                />
            </div>

            <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 me-3">
                    <Hexagon size={16} color="var(--trade-profit)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}><span className="text-secondary">Status:</span> Connected</span>
                </div>
                <button className="btn btn-link text-secondary p-0 position-relative">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                </button>
                <button className="btn btn-primary-custom ms-2 btn-sm">New Strategy</button>
            </div>
        </header>
    );
};

export default TopNavbar;
