import React from 'react';
import { X, Layers, Cpu, Database, Server } from 'lucide-react';

interface TechnicalSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalSpecsModal: React.FC<TechnicalSpecsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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
        className="glass-panel glass-panel-glow"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: '#0d1322',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={22} color="#06b6d4" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Model Architecture & Technical Specifications</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                YOLOv4-Tiny Object Detection Pipeline & Dataset Documentation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Spec Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Architecture Card */}
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Cpu size={16} color="#fbbf24" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Model Backbone</h4>
            </div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
              <li>• <strong>Architecture:</strong> YOLOv4-Tiny (CSPDarknet53-Tiny)</li>
              <li>• <strong>Weight Size:</strong> ~23.5 MB (Ultra-compact)</li>
              <li>• <strong>Input Size:</strong> 640 x 640 RGB (Blob Normalization)</li>
              <li>• <strong>Feature Pyramids:</strong> 2 YOLO detection scale heads</li>
            </ul>
          </div>

          {/* Inference Engine */}
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Server size={16} color="#06b6d4" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Inference Engine</h4>
            </div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
              <li>• <strong>CV Framework:</strong> OpenCV Deep Neural Network (<code style={{ color: '#06b6d4' }}>cv2.dnn</code>)</li>
              <li>• <strong>Target Device:</strong> CPU with AVX2 SIMD vectorization</li>
              <li>• <strong>Average Latency:</strong> ~60ms - 190ms per image frame</li>
              <li>• <strong>Post-Processing:</strong> Greedy NMS with bounding IOU suppression</li>
            </ul>
          </div>
        </div>

        {/* Dataset & Weights Attribution */}
        <div className="glass-panel" style={{ padding: '18px', background: 'rgba(245, 158, 11, 0.04)', borderColor: 'rgba(245, 158, 11, 0.25)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Database size={16} color="#fbbf24" />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fbbf24' }}>Dataset & Weights Provenance</h4>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The detection weights (<code style={{ color: '#fbbf24' }}>yolov4_tiny.weights</code>) are trained on the public{' '}
            <strong>Roboflow Road Surface Damage Benchmark / Darknet Pothole Dataset</strong> comprising annotated asphalt fissures, craters, and structural damage under diverse lighting and weather conditions.
          </p>
          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Attribution: Pre-trained weights and network configuration sourced from open-source pothole detection benchmarks (GitHub: <em>akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4</em> & <em>matteobarato/yolov4-potholes-detection</em>).
          </div>
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
