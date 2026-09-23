import React from 'react';
import { ShieldAlert, Settings, Layers } from 'lucide-react';
import type { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  isHealthLoading: boolean;
  onOpenSettings: () => void;
  onOpenSpecs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  isHealthLoading,
  onOpenSettings,
  onOpenSpecs,
}) => {
  return (
    <header className="glass-panel" style={{ padding: '18px 24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
            }}
          >
            <ShieldAlert size={26} color="#fbbf24" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Powered Road Surface Damage Detection
              </h1>
              <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                YOLOv4-Tiny
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Automated Pothole & Asphalt Fault Localization using OpenCV Deep Neural Network (DNN) Engine
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Backend Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid var(--border-glass)',
              fontSize: '0.8rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: health?.model_loaded ? '#10b981' : isHealthLoading ? '#f59e0b' : '#ef4444',
                boxShadow: health?.model_loaded ? '0 0 8px #10b981' : isHealthLoading ? '0 0 8px #f59e0b' : '0 0 8px #ef4444',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {isHealthLoading
                ? 'Connecting API...'
                : health?.model_loaded
                ? 'Model Ready (CPU DNN)'
                : 'API Offline'}
            </span>
          </div>

          {/* Model Architecture Button */}
          <button
            onClick={onOpenSpecs}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            title="View Model Specs & Dataset"
          >
            <Layers size={16} color="#06b6d4" />
            <span>Architecture</span>
          </button>

          {/* API Config Gear */}
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Configure Backend API URL"
          >
            <Settings size={16} color="var(--text-secondary)" />
          </button>
        </div>
      </div>
    </header>
  );
};
