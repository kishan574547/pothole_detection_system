import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader, SAMPLE_IMAGES } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { DetectionResults } from './components/DetectionResults';
import { DetectionControls } from './components/DetectionControls';
import { TechnicalSpecsModal } from './components/TechnicalSpecsModal';
import { checkHealth, detectPotholes } from './services/api';
import type { DetectionResponse, HealthResponse } from './types';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(true);

  const [currentImageFile, setCurrentImageFile] = useState<File | Blob | null>(null);
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hyperparameters
  const [confThreshold, setConfThreshold] = useState<number>(0.20);
  const [nmsThreshold, setNmsThreshold] = useState<number>(0.40);

  // Modals
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);

  // Fetch API Health
  const loadHealth = useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  // Run Detection
  const runDetection = async (
    file: File | Blob,
    conf: number = confThreshold,
    nms: number = nmsThreshold
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await detectPotholes(file, conf, nms);
      setDetectionResult(result);

      if (result.summary.total_detected > 0) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#06b6d4', '#10b981'],
        });
      }
    } catch (err: any) {
      console.error('Detection failed:', err);
      setErrorMessage(
        err.message || 'An error occurred during inference. Ensure the backend API on Render is awake.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Image selection handler
  const handleImageSelected = (file: File | Blob, previewUrl: string) => {
    setCurrentImageFile(file);
    setCurrentImagePreview(previewUrl);
    setDetectionResult(null);
    runDetection(file, confThreshold, nmsThreshold);
  };

  // Re-run with updated thresholds
  const handleApplyThresholds = () => {
    if (currentImageFile) {
      runDetection(currentImageFile, confThreshold, nmsThreshold);
    }
  };

  const handleResetThresholds = () => {
    setConfThreshold(0.20);
    setNmsThreshold(0.40);
    if (currentImageFile) {
      runDetection(currentImageFile, 0.20, 0.40);
    }
  };

  // Auto-load first sample on initial page load
  useEffect(() => {
    const autoLoadSample = async () => {
      try {
        const first = SAMPLE_IMAGES[0];
        const res = await fetch(first.url);
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        setCurrentImageFile(blob);
        setCurrentImagePreview(objUrl);
        runDetection(blob, 0.20, 0.40);
      } catch {
        // user can select manually
      }
    };
    autoLoadSample();
  }, []);

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        health={health}
        isHealthLoading={isHealthLoading}
        onOpenSpecs={() => setIsSpecsOpen(true)}
      />

      {/* Main Content Layout */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Upload & Sample Selector */}
        <section>
          <ImageUploader
            onImageSelected={handleImageSelected}
            isLoading={isLoading}
          />
        </section>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Detection Notice / Server Offline</div>
                <div style={{ fontSize: '0.84rem', color: '#fca5a5' }}>{errorMessage}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {currentImageFile && (
                <button
                  onClick={handleApplyThresholds}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <RefreshCw size={13} />
                  <span>Retry Scan</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Inspection & Analysis View */}
        {currentImagePreview && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Hyperparameter Controls */}
            <DetectionControls
              confThreshold={confThreshold}
              nmsThreshold={nmsThreshold}
              onConfChange={setConfThreshold}
              onNmsChange={setNmsThreshold}
              onApply={handleApplyThresholds}
              onReset={handleResetThresholds}
              isLoading={isLoading}
              hasImage={!!currentImageFile}
            />

            {/* Side-by-Side / Swipe Visualizer */}
            <ComparisonView
              originalImageUrl={currentImagePreview}
              detectionResult={detectionResult}
              isLoading={isLoading}
            />

            {/* Metrics Breakdown & Table */}
            {detectionResult && (
              <DetectionResults result={detectionResult} />
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: '60px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          <span>AI Powered Road Surface Damage Detection • Built with </span>
          <strong style={{ color: 'var(--text-secondary)' }}>FastAPI, OpenCV DNN, YOLOv4-Tiny, React & Vite</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button
            onClick={() => setIsSpecsOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Model Architecture
          </button>
          <a
            href="https://github.com/akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <span>Dataset & Weights</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </footer>

      {/* Architecture Specs Modal */}
      <TechnicalSpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />
    </div>
  );
};

export default App;
