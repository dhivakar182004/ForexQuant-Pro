import React, { useState } from 'react';
import { Search, ChevronDown, BarChart2, Activity, Zap, Layers, Share2, Info, Maximize2 } from 'lucide-react';
import ChartView from '../components/terminal/ChartView';

const Terminal = () => {
    const [activeTab, setActiveTab] = useState('layers');

    return (
        <div className="terminal-layout text-main">
            {/* Top Navigation */}
            <nav className="terminal-top-nav">
                <div className="d-flex align-items-center gap-2 border-end pe-3 border-secondary">
                    <div className="bg-brand p-1 rounded"><Zap size={18} color="white" /></div>
                    <span className="fw-bold d-none d-md-inline" style={{ fontSize: '0.9rem' }}>NIFTY</span>
                    <ChevronDown size={14} className="text-dim" />
                </div>

                <div className="d-flex align-items-center gap-1 border-end pe-3 border-secondary">
                    <button className="btn icon-btn active fw-bold">1m</button>
                    <button className="btn icon-btn">5m</button>
                    <button className="btn icon-btn">1h</button>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <button className="btn icon-btn d-flex align-items-center gap-2"><BarChart2 size={18} /> <span>Charts</span></button>
                    <button className="btn icon-btn d-flex align-items-center gap-2"><Activity size={18} /> <span>Indicators</span></button>
                </div>

                <div className="ms-auto d-flex align-items-center gap-3">
                    <button className="btn btn-primary bg-brand border-0 px-3 py-1 small rounded-pill">UPGRADE</button>
                    <div className="icon-btn rounded-circle"><Search size={18} /></div>
                </div>
            </nav>

            {/* Main Terminal Body */}
            <div className="terminal-body">
                {/* Left Drawing Tools */}
                <aside className="terminal-left-tools">
                    <div className="icon-btn"><Activity size={20} /></div>
                    <div className="icon-btn"><Search size={20} /></div>
                    <div className="icon-btn"><Layers size={20} /></div>
                    <div className="border-bottom border-secondary w-75 mx-auto my-1"></div>
                    <div className="icon-btn"><Activity size={20} /></div>
                    <div className="icon-btn"><Share2 size={20} /></div>
                </aside>

                {/* Chart View */}
                <main className="chart-container terminal-grid">
                    <ChartView />
                </main>

                {/* Right Info Panels */}
                <aside className="terminal-right-panels d-none d-xl-flex">
                    <div className="d-flex border-bottom border-secondary">
                        <button className={`btn flex-grow-1 py-2 rounded-0 border-0 ${activeTab === 'layers' ? 'active-tab' : 'text-dim'}`} onClick={() => setActiveTab('layers')}>Layers</button>
                        <button className={`btn flex-grow-1 py-2 rounded-0 border-0 ${activeTab === 'alerts' ? 'active-tab' : 'text-dim'}`} onClick={() => setActiveTab('alerts')}>Alerts</button>
                    </div>

                    <div className="p-3 flex-grow-1 overflow-auto">
                        {activeTab === 'layers' && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="small fw-bold">OBJECTS</span>
                                    <button className="btn icon-btn p-1"><Maximize2 size={14} /></button>
                                </div>
                                <div className="small text-dim border p-2 rounded border-secondary mb-2 bg-deep">Candlestick Chart</div>
                                <div className="small text-dim border p-2 rounded border-secondary bg-deep">Volume (20)</div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <style>{`
        .bg-brand { background-color: var(--fq-accent); }
        .text-cyan { color: var(--fq-accent); }
        .active-tab { border-bottom: 2px solid var(--fq-accent) !important; color: white !important; background: var(--fq-accent-light); }
      `}</style>
        </div>
    );
};

export default Terminal;
