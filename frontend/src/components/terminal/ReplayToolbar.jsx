import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Rewind, FastForward, Settings, X, Target } from 'lucide-react';

const ReplayToolbar = ({
    isReplaying,
    speed,
    onTogglePlay,
    onStep,
    onReset,
    onSetSpeed,
    onClose
}) => {
    return (
        <div className="replay-toolbar d-flex align-items-center gap-2 p-1 px-3 bg-panel border border-secondary rounded-pill shadow-lg fade-in">
            <div className="d-flex align-items-center gap-1 border-end border-secondary pe-2 mr-2">
                <Target size={16} className="text-cyan" />
                <span className="small fw-bold text-cyan" style={{ fontSize: '0.75rem' }}>REPLAY</span>
            </div>

            <button className="btn icon-btn" onClick={onReset} title="Jump to Start">
                <Rewind size={18} />
            </button>
            <button className="btn icon-btn" onClick={() => onStep(-1)} title="Step Back">
                <SkipBack size={18} />
            </button>

            <button
                className={`btn btn-replay-main ${isReplaying ? 'active' : ''}`}
                onClick={onTogglePlay}
                title={isReplaying ? 'Pause' : 'Play'}
            >
                {isReplaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ms-1" />}
            </button>

            <button className="btn icon-btn" onClick={() => onStep(1)} title="Step Forward">
                <SkipForward size={18} />
            </button>
            <button className="btn icon-btn" title="Jump to End">
                <FastForward size={18} />
            </button>

            <div className="d-flex align-items-center gap-2 border-start border-secondary ps-3 ms-2">
                <select
                    className="form-select form-select-sm bg-transparent border-0 text-white small p-0"
                    value={speed}
                    onChange={(e) => onSetSpeed(Number(e.target.value))}
                    style={{ width: '50px', fontSize: '0.8rem' }}
                >
                    <option value="1000">1x</option>
                    <option value="500">2x</option>
                    <option value="200">5x</option>
                    <option value="2000">0.5x</option>
                </select>
                <button className="btn icon-btn p-1" title="Settings"><Settings size={16} /></button>
                <button className="btn icon-btn text-danger p-1 ms-2" onClick={onClose} title="Exit Replay"><X size={18} /></button>
            </div>

            <style>{`
                .replay-toolbar {
                    position: absolute;
                    top: 15px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                    backdrop-filter: blur(8px);
                    background: rgba(12, 13, 16, 0.9);
                    min-width: 320px;
                }
                .btn-replay-main {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--fq-accent);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    transition: 0.2s;
                    box-shadow: 0 0 15px rgba(0, 188, 212, 0.3);
                }
                .btn-replay-main:hover {
                    transform: scale(1.1);
                    background: #26c6da;
                }
                .btn-replay-main.active {
                    background: #ff5252;
                    box-shadow: 0 0 15px rgba(255, 82, 82, 0.3);
                }
                .form-select option {
                    background: #0c0d10;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default ReplayToolbar;
