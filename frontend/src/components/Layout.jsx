import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="d-flex vh-100 bg-app overflow-hidden" style={{ background: 'var(--bg-app)' }}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="main-content flex-grow-1 d-flex flex-column overflow-hidden">
                {!window.location.pathname.includes('/terminal') && (
                    <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                )}

                <main className="flex-grow-1 overflow-auto p-4 p-md-5">
                    <div className="container-fluid p-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
