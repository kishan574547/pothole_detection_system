import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, AlertCircle } from 'lucide-react';
import type { SampleImage } from '../types';

interface ImageUploaderProps {
  onImageSelected: (file: File | Blob, previewUrl: string) => void;
  isLoading: boolean;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-1',
    title: 'Urban Road Cluster',
    subtitle: 'Multiple surface craters',
    url: '/sample-images/sample_1.jpg',
    potholesCountHint: '8 Potholes',
    severityHint: 'High',
  },
  {
    id: 'sample-2',
    title: 'Asphalt Distress',
    subtitle: 'Deep fissures & dips',
    url: '/sample-images/sample_2.jpg',
    potholesCountHint: '8 Potholes',
    severityHint: 'Medium',
  },
  {
    id: 'sample-3',
    title: 'Severe Road Rupture',
    subtitle: 'High density damage',
    url: '/sample-images/sample_3.jpg',
    potholesCountHint: '10 Potholes',
    severityHint: 'High',
  },
  {
    id: 'sample-4',
    title: 'Highway Cavity',
    subtitle: 'High-speed hazard zone',
    url: '/sample-images/sample_4.jpg',
    potholesCountHint: '9 Potholes',
    severityHint: 'High',
  },
  {
    id: 'sample-5',
    title: 'Suburban Crack Cluster',
    subtitle: 'Localized asphalt pit',
    url: '/sample-images/sample_5.jpg',
    potholesCountHint: '9 Potholes',
    severityHint: 'Medium',
  },
  {
    id: 'sample-6',
    title: 'Secondary Route',
    subtitle: 'Multiple minor potholes',
    url: '/sample-images/sample_6.jpg',
    potholesCountHint: '7 Potholes',
    severityHint: 'Low',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
      setErrorMessage('Unsupported file format. Please upload a JPEG, PNG, or WebP road image.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedSampleId(null);
    const objectUrl = URL.createObjectURL(file);
    onImageSelected(file, objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isLoading) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSampleClick = async (sample: SampleImage) => {
    if (isLoading) return;
    setSelectedSampleId(sample.id);
    setErrorMessage(null);

    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      onImageSelected(blob, objectUrl);
    } catch {
      setErrorMessage('Failed to load sample image. Please try another or upload your own.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`glass-panel ${isDragOver ? 'glass-panel-glow' : ''}`}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.15)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '44px 24px',
          textAlign: 'center',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          background: isDragOver
            ? 'rgba(245, 158, 11, 0.05)'
            : 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
          transition: 'all 0.25s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isLoading}
        />

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.15)',
          }}
        >
          <UploadCloud size={30} color="#fbbf24" />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
          Drag & Drop Road Image Here, or{' '}
          <span style={{ color: '#fbbf24', textDecoration: 'underline' }}>Browse Files</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto' }}>
          Upload high-resolution asphalt, highway, or urban road photos. Supports JPEG, PNG, and WebP up to 10MB.
        </p>

        {errorMessage && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Preset Sample Gallery */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Or Test Instant Sample Road Images (1-Click Evaluation):
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-world road benchmark data
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSampleClick(sample);
                }}
                disabled={isLoading}
                className="glass-panel"
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected
                    ? '2px solid #f59e0b'
                    : '1px solid var(--border-glass)',
                  background: isSelected
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'var(--bg-card)',
                  textAlign: 'left',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '95px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#0f172a',
                  }}
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <span
                    className={`badge ${
                      sample.severityHint === 'High'
                        ? 'badge-high'
                        : sample.severityHint === 'Medium'
                        ? 'badge-medium'
                        : 'badge-low'
                    }`}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                    }}
                  >
                    {sample.potholesCountHint}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sample.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {sample.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
