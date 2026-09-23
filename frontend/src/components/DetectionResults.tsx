import React from 'react';
import { Download, FileJson, AlertTriangle, CheckCircle } from 'lucide-react';
import type { DetectionResponse } from '../types';

interface DetectionResultsProps {
  result: DetectionResponse;
}

export const DetectionResults: React.FC<DetectionResultsProps> = ({
  result,
}) => {
  const { summary, detections, inference_time_ms, image_width, image_height } = result;

  const handleDownloadImage = () => {
    if (!result.annotated_image_base64) return;
    const link = document.createElement('a');
    link.href = result.annotated_image_base64;
    link.download = `pothole_detection_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `pothole_report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine overall Road Condition
  const getRoadStatus = () => {
    if (summary.high_severity_count > 0 || summary.total_detected >= 5) {
      return {
        level: 'Critical Hazard',
        desc: 'High severity potholes detected. Urgent asphalt patching & maintenance required to prevent vehicular damage.',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.35)',
        icon: <AlertTriangle size={22} color="#f87171" />,
      };
    } else if (summary.total_detected > 0) {
      return {
        level: 'Moderate Surface Damage',
        desc: 'Surface fissures and moderate potholes detected. Recommend scheduling routine municipal road maintenance.',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        icon: <AlertTriangle size={22} color="#fbbf24" />,
      };
    } else {
      return {
        level: 'Clear Road Surface',
        desc: 'No significant road surface potholes detected at current confidence threshold. Surface condition is nominal.',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        icon: <CheckCircle size={22} color="#34d399" />,
      };
    }
  };

  const roadStatus = getRoadStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Road Status Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          background: roadStatus.bg,
          borderColor: roadStatus.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {roadStatus.icon}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: roadStatus.color }}>
              {roadStatus.level}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {roadStatus.desc}
            </div>
          </div>
        </div>

        {/* Download Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleDownloadImage}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <Download size={15} />
            <span>Annotated Image</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <FileJson size={15} />
            <span>JSON Report</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metric Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Total Detected */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Total Potholes
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {summary.total_detected}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Image: {image_width}x{image_height}px
          </div>
        </div>

        {/* High Severity */}
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          <div style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '6px' }}>
            High Risk Hazards
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
            {summary.high_severity_count}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Deep / Large Area Damage
          </div>
        </div>

        {/* Medium Severity */}
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '6px' }}>
            Medium Severity
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
            {summary.medium_severity_count}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Surface Pits & Ruts
          </div>
        </div>

        {/* Low Severity */}
        <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginBottom: '6px' }}>
            Low / Incipient
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
            {summary.low_severity_count}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Minor Asphalt Cracking
          </div>
        </div>

        {/* Confidence & Speed */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
            Peak Confidence / Latency
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {(summary.max_confidence * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {inference_time_ms} ms CPU inference
          </div>
        </div>
      </div>

      {/* Detailed Detection List Table */}
      {detections.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Individual Damage Identification Log ({detections.length})
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Sorted by bounding area & confidence
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>ID</th>
                  <th style={{ padding: '10px 12px' }}>Class</th>
                  <th style={{ padding: '10px 12px' }}>Confidence</th>
                  <th style={{ padding: '10px 12px' }}>Severity</th>
                  <th style={{ padding: '10px 12px' }}>Surface Area</th>
                  <th style={{ padding: '10px 12px' }}>Bounding Box [X, Y, W, H]</th>
                </tr>
              </thead>
              <tbody>
                {detections.map((det) => (
                  <tr
                    key={det.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                      #{det.id}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {det.class_name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '45px',
                            height: '6px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${det.confidence * 100}%`,
                              height: '100%',
                              backgroundColor: det.confidence > 0.7 ? '#10b981' : det.confidence > 0.4 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          {(det.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        className={`badge ${
                          det.severity === 'High'
                            ? 'badge-high'
                            : det.severity === 'Medium'
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {det.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      {det.area_pixels.toLocaleString()} px²{' '}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        ({det.area_percentage}%)
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      [{det.bbox.x}, {det.bbox.y}, {det.bbox.width}, {det.bbox.height}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
