import React, { useState, useRef, useEffect } from 'react';
import { Columns, SplitSquareVertical, Maximize2, Minimize2, Cpu } from 'lucide-react';
import type { DetectionResponse } from '../types';

interface ComparisonViewProps {
  originalImageUrl: string;
  detectionResult: DetectionResponse | null;
  isLoading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalImageUrl,
  detectionResult,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDraggingSlider(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const annotatedUrl = detectionResult?.annotated_image_base64 || originalImageUrl;

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Visual Inspection & Localization</span>
          </h3>
          {detectionResult && (
            <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
              {detectionResult.summary.total_detected} Pothole{detectionResult.summary.total_detected !== 1 ? 's' : ''} Identified
            </span>
          )}
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px',
              border: '1px solid var(--border-glass)',
            }}
          >
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`btn ${viewMode === 'side-by-side' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <Columns size={14} />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`btn ${viewMode === 'slider' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <SplitSquareVertical size={14} />
              <span>Interactive Split Wipe</span>
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Inspection'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Image Comparison Area */}
      {viewMode === 'side-by-side' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Left: Original Image */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#090d16',
              border: '1px solid var(--border-glass)',
              aspectRatio: '16 / 10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={originalImageUrl}
              alt="Original Road"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#cbd5e1',
              }}
            >
              Raw Road Surface (Original)
            </div>
          </div>

          {/* Right: AI Annotated Result */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#090d16',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              aspectRatio: '16 / 10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={annotatedUrl}
              alt="AI Annotated Road Surface"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {/* Radar scanner sweep during loading */}
            {isLoading && (
              <>
                <div className="scanner-laser" />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(11, 15, 25, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '3px solid rgba(245, 158, 11, 0.2)',
                      borderTopColor: '#f59e0b',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
                      Running YOLOv4-Tiny Inference...
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Extracting features via OpenCV DNN forward pass
                    </div>
                  </div>
                </div>
              </>
            )}

            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(245, 158, 11, 0.9)',
                color: '#0b0f19',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Cpu size={13} />
              <span>YOLOv4 AI Annotated Detection</span>
            </div>

            {detectionResult && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Latency: {detectionResult.inference_time_ms}ms
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Split Slider Mode */
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#090d16',
            border: '1px solid var(--border-glass)',
            aspectRatio: '16 / 9',
            maxHeight: '540px',
            userSelect: 'none',
            cursor: 'ew-resize',
          }}
        >
          {/* Under layer: Annotated Image */}
          <img
            src={annotatedUrl}
            alt="AI Annotated"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />

          {/* Top layer: Original Image (Clipped) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${sliderPos}%`,
              overflow: 'hidden',
              borderRight: '2px solid #f59e0b',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
            }}
          >
            <img
              src={originalImageUrl}
              alt="Original Road"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
                objectFit: 'contain',
                maxWidth: 'none',
              }}
            />
          </div>

          {/* Slider Handle Button */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPos}%`,
              transform: 'translate(-50%, -50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              color: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)',
              cursor: 'ew-resize',
              zIndex: 15,
            }}
          >
            <SplitSquareVertical size={18} />
          </div>

          {/* Labels */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            Original (Before)
          </div>
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(245, 158, 11, 0.9)',
              color: '#090d16',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            AI Detected (After)
          </div>

          {isLoading && <div className="scanner-laser" />}
        </div>
      )}
    </div>
  );
};
