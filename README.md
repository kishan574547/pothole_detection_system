# 🛣️ AI Powered Road Surface Damage Detection

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-DNN-5C3EE8?style=flat&logo=opencv&logoColor=white)](https://opencv.org/)
[![YOLOv4-Tiny](https://img.shields.io/badge/YOLOv4--Tiny-Darknet-orange?style=flat)](https://github.com/AlexeyAB/darknet)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

A full-stack, real-time computer vision application that detects, localizes, and categorizes potholes and asphalt fissures in road surface imagery using **YOLOv4-Tiny**, **OpenCV Deep Neural Network (DNN)** engine, **FastAPI**, and **React + Vite**.

---

## 🌟 Key Features

- **High-Speed CPU Inference**: Utilizes OpenCV's native C++ DNN engine (`cv2.dnn.readNet`) with SIMD vectorization for sub-100ms CPU inference latency.
- **Accurate Pothole Localization**: Draws color-coded bounding boxes, confidence badges, and semi-transparent damage masks.
- **Automated Severity Scoring**: Categorizes road damage into **High Risk** (urgent asphalt patching), **Medium Severity** (moderate surface wear), and **Low/Incipient** based on surface area ratio and detection confidence.
- **Interactive Visual Comparison**: Switch between **Side-by-Side** comparison and an **Interactive Split Wipe Slider**.
- **Adjustable Hyperparameters**: Real-time tuning for confidence cutoffs ($5\% - 90\%$) and Non-Maximum Suppression (NMS) IOU thresholds.
- **Instant 1-Click Sample Gallery**: Pre-loaded with 6 real-world road damage benchmark scenarios.
- **Export Capabilities**: 1-click download of the annotated image (JPEG) and detailed forensic JSON detection report.
- **Containerized & Cloud Ready**: Fully Dockerized backend ready for deployment on Render, Railway, or Hugging Face Spaces, and React frontend optimized for Vercel.

---

## 🧠 Model Architecture & Weights Attribution

- **Architecture**: YOLOv4-Tiny (CSPDarknet53-Tiny backbone with 2 scale prediction heads).
- **Weights**: `yolov4_tiny.weights` (~23.5 MB).
- **Configuration**: `yolov4_tiny.cfg` (640x640 input resolution, 2 output anchor scales).
- **Training Dataset**: Trained on the public **Roboflow Road Surface Damage Benchmark / Darknet Pothole Dataset** containing diverse asphalt potholes and road crack imagery under various lighting conditions.
- **Weights Source**: Open-source Darknet YOLOv4-Tiny pothole model weights ([akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4](https://github.com/akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4)).

---

## 📁 Repository Structure

```
pothole-detection/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application (endpoints: /detect, /health, /info)
│   │   ├── detector.py          # OpenCV DNN YOLOv4-tiny inference & annotation engine
│   │   └── schemas.py           # Pydantic request/response schemas
│   ├── models/
│   │   ├── yolov4_tiny.cfg      # Darknet network configuration
│   │   ├── yolov4_tiny.weights  # Pre-trained pothole detection weights (~23.5MB)
│   │   └── obj.names            # Class label definitions ("Pothole")
│   ├── Dockerfile               # Multi-stage lightweight Python container
│   ├── requirements.txt         # FastAPI, uvicorn, opencv-python-headless, numpy, etc.
│   ├── test_api.py              # End-to-end integration test suite
│   └── test_detector.py         # Standalone detector unit test
├── frontend/
│   ├── public/
│   │   └── sample-images/       # Bundled sample road images (1-click evaluation)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx       # App navbar with health status and modal triggers
│   │   │   ├── ImageUploader.tsx# Drag-and-drop zone + sample road gallery
│   │   │   ├── ComparisonView.tsx# Side-by-side & swipe comparison viewer
│   │   │   ├── DetectionResults.tsx # Stats counters, severity banner & pothole data log
│   │   │   ├── DetectionControls.tsx# Sensitivity and NMS sliders
│   │   │   ├── TechnicalSpecsModal.tsx# Architecture documentation modal
│   │   │   └── ApiSettingsModal.tsx# Custom backend API URL switcher & ping test
│   │   ├── services/
│   │   │   └── api.ts           # Frontend API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript definitions
│   │   ├── App.tsx              # Main UI shell
│   │   └── index.css            # Dark-mode glassmorphic styling system
│   ├── vercel.json              # Vercel deployment rewrite rules & security headers
│   ├── vite.config.ts
│   └── package.json
├── sample_images/               # Road benchmark images
├── render.yaml                  # Render Blueprint deployment config
└── README.md
```

---

## 🚀 Quickstart (Local Setup)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run integration tests
python test_api.py

# Start FastAPI dev server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API will be accessible at:
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Containerization

To run the backend inside Docker:

```bash
cd backend
docker build -t pothole-detection-api .
docker run -p 8000:8000 pothole-detection-api
```

---

## ☁️ Cloud Deployment Guide

### A. Deploy Backend (Render / Railway / Hugging Face Spaces)

#### Option 1: Render (Recommended Free Tier)
1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Environment**: `Docker`
   - **Docker Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Instance Type**: Free
5. Deploy. You will receive your live backend URL (e.g., `https://pothole-detection-api.onrender.com`).

#### Option 2: Railway
1. Go to [Railway.app](https://railway.app/) -> **New Project** -> **Deploy from GitHub repo**.
2. Select your repository and specify `backend/Dockerfile` as the build target.
3. Generate domain to get your live API URL.

---

### B. Deploy Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
2. Select your GitHub repository.
3. Configure project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Click **Deploy**. Vercel will generate your live production URL (e.g. `https://pothole-detection.vercel.app`).

> 💡 **Note**: Users can also configure or change the API URL directly inside the web application via the **API Settings** gear icon in the header without redeploying.

---

## 📡 API Reference

### `POST /detect`
Uploads a road image for inference.

**Form Data:**
- `file` (File, required): Image file (JPEG, PNG, WebP)
- `conf_threshold` (Query float, default: `0.20`): Confidence score threshold ($0.05 - 0.95$)
- `nms_threshold` (Query float, default: `0.40`): Non-Maximum Suppression threshold

**Sample Response:**
```json
{
  "status": "success",
  "inference_time_ms": 112.45,
  "image_width": 1280,
  "image_height": 720,
  "detections": [
    {
      "id": 1,
      "class_name": "Pothole",
      "confidence": 0.9617,
      "bbox": { "x": 512, "y": 420, "width": 184, "height": 92 },
      "area_pixels": 16928,
      "area_percentage": 1.84,
      "severity": "Medium"
    }
  ],
  "summary": {
    "total_detected": 1,
    "high_severity_count": 0,
    "medium_severity_count": 1,
    "low_severity_count": 0,
    "max_confidence": 0.9617,
    "average_confidence": 0.9617
  },
  "annotated_image_base64": "data:image/jpeg;base64,..."
}
```

### `GET /health`
Returns system and model health status.

### `GET /info`
Returns model metadata, architecture description, and training dataset provenance.
