import React from 'react';
import { Play, Pause, Rewind, FastForward, X } from 'lucide-react';

interface ReplayToolbarProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onRewind: () => void;
    onForward: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    onClose: () => void;
}

export const ReplayToolbar: React.FC<ReplayToolbarProps> = ({ isPlaying, onTogglePlay, onRewind, onForward, speed, onSpeedChange, onClose }) => {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            padding: '4px 8px', 
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
            <button onClick={onRewind} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }} title="Jump Back">
                <Rewind size={16} />
            </button>
            
            <button onClick={onTogglePlay} style={{ background: 'transparent', border: 'none', color: 'var(--exness-yellow)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }} title={isPlaying ? "Pause Replay" : "Play Replay"}>
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            
            <button onClick={onForward} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }} title="Forward 1 Bar">
                <FastForward size={16} />
            </button>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SPEED</span>
                <select 
                    value={speed} 
                    onChange={e => onSpeedChange(Number(e.target.value))} 
                    style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                    <option value={1} style={{ background: '#000' }}>1x</option>
                    <option value={2} style={{ background: '#000' }}>2x</option>
                    <option value={5} style={{ background: '#000' }}>5x</option>
                    <option value={10} style={{ background: '#000' }}>10x</option>
                </select>
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }}></div>

            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }} title="Exit Replay">
                <X size={16} />
            </button>
        </div>
    );
};
