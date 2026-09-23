import type { DetectionResponse, HealthResponse } from '../types';

const STORAGE_KEY_API_URL = 'pothole_detector_api_url';

export const getDefaultApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const getApiUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_API_URL) || getDefaultApiUrl();
};

export const setApiUrl = (url: string): void => {
  const trimmed = url.trim().replace(/\/+$/, '');
  localStorage.setItem(STORAGE_KEY_API_URL, trimmed);
};

export const checkHealth = async (baseUrl?: string): Promise<HealthResponse> => {
  const url = `${baseUrl || getApiUrl()}/health`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
};

export const detectPotholes = async (
  imageFile: File | Blob,
  confThreshold: number = 0.20,
  nmsThreshold: number = 0.40,
  baseUrl?: string
): Promise<DetectionResponse> => {
  const apiBase = baseUrl || getApiUrl();
  const endpoint = `${apiBase}/detect?conf_threshold=${confThreshold}&nms_threshold=${nmsThreshold}`;

  const formData = new FormData();
  if (imageFile instanceof File) {
    formData.append('file', imageFile, imageFile.name);
  } else {
    formData.append('file', imageFile, 'sample_road.jpg');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Inference request timed out. The server might be waking up from cold start (free tier) or is unreachable.');
    }
    throw err;
  }
};
