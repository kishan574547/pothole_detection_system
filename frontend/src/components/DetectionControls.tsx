import React from 'react';
import { Sliders, RefreshCw, RotateCcw } from 'lucide-react';

interface DetectionControlsProps {
  confThreshold: number;
  nmsThreshold: number;
  onConfChange: (value: number) => void;
  onNmsChange: (value: number) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasImage: boolean;
}

export const DetectionControls: React.FC<DetectionControlsProps> = ({
  confThreshold,
  nmsThreshold,
  onConfChange,
  onNmsChange,
  onApply,
  onReset,
  isLoading,
  hasImage,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '18px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={18} color="#fbbf24" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Inference Hyperparameters</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Tune detection sensitivity and Non-Maximum Suppression (NMS) overlap filtering
            </p>
          </div>
        </div>

        {/* Sliders Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', flex: '1', maxWidth: '640px' }}>
          {/* Confidence Slider */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Confidence Cutoff:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                {Math.round(confThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.90"
              step="0.05"
              value={confThreshold}
              onChange={(e) => onConfChange(parseFloat(e.target.value))}
              disabled={isLoading}
            />
          </div>

          {/* NMS Slider */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>NMS IOU Threshold:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {Math.round(nmsThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={nmsThreshold}
              onChange={(e) => onNmsChange(parseFloat(e.target.value))}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onReset}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            title="Reset to default thresholds (20% conf, 40% NMS)"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button
            onClick={onApply}
            disabled={isLoading || !hasImage}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            <span>{isLoading ? 'Scanning...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
