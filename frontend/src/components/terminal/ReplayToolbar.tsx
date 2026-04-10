import React from 'react';

interface ReplayToolbarProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onRewind: () => void;
    onForward: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
}

export const ReplayToolbar: React.FC<ReplayToolbarProps> = ({ isPlaying, onTogglePlay, onRewind, onForward, speed, onSpeedChange }) => {
    return (
        <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', background: 'rgba(20, 24, 35, 0.8)' }}>
            <button className="btn btn-sm" onClick={onRewind}>BACK 10</button>
            <button className="btn btn-buy" onClick={onTogglePlay} style={{ minWidth: '100px' }}>{isPlaying ? 'PAUSE' : 'START REPLAY'}</button>
            <button className="btn btn-sm" onClick={onForward}>FWD 1</button>
            <div style={{ marginLeft: '15px', borderLeft: '1px solid var(--border)', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SPEED</span>
                <select value={speed} onChange={e => onSpeedChange(Number(e.target.value))} style={{ background: '#0a0e17', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px' }}>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                </select>
            </div>
        </div>
    );
};
