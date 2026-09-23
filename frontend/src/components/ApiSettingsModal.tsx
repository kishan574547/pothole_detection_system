import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';
import { getApiUrl, setApiUrl, checkHealth } from '../services/api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const trimmed = apiUrlInput.trim().replace(/\/+$/, '');
      const data = await checkHealth(trimmed);
      setTestResult({
        success: true,
        message: `Connected successfully! Model: ${data.model_name} (${data.architecture})`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Could not connect to API server. Ensure backend is running and CORS is enabled.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = apiUrlInput.trim().replace(/\/+$/, '');
    setApiUrl(trimmed);
    onSaved();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '26px',
          background: '#0d1322',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Server size={18} color="#fbbf24" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Backend API Configuration</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Connect to local FastAPI server or deployed cloud container
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            API Base Endpoint URL:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={apiUrlInput}
              onChange={(e) => setApiUrlInput(e.target.value)}
              placeholder="e.g. http://localhost:8000 or https://pothole-api.onrender.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Default local development is <code style={{ color: '#06b6d4' }}>http://localhost:8000</code>. In production, set to your Render / Railway URL.
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              color: testResult.success ? '#34d399' : '#f87171',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <RefreshCw size={14} className={isTesting ? 'spin-animation' : ''} />
            <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
