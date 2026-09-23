export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionItem {
  id: number;
  class_name: string;
  confidence: number;
  bbox: BoundingBox;
  area_pixels: number;
  area_percentage: number;
  severity: 'Low' | 'Medium' | 'High';
}

export interface DetectionSummary {
  total_detected: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  max_confidence: number;
  average_confidence: number;
}

export interface DetectionResponse {
  status: string;
  inference_time_ms: number;
  image_width: number;
  image_height: number;
  detections: DetectionItem[];
  summary: DetectionSummary;
  annotated_image_base64: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_name: string;
  architecture: string;
  device: string;
  version: string;
}

export interface SampleImage {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  potholesCountHint: string;
  severityHint: 'High' | 'Medium' | 'Low' | 'Clear';
}
