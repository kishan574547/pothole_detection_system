import os
import io
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import DetectionResponse, HealthResponse, ModelInfoResponse
from app.detector import PotholeDetector

app = FastAPI(
    title="AI Powered Road Surface Damage & Pothole Detection API",
    description="Real-time road surface damage & pothole detection API powered by YOLOv4-Tiny and OpenCV DNN.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global detector instance
detector: PotholeDetector = None

def get_detector() -> PotholeDetector:
    global detector
    if detector is None:
        detector = PotholeDetector()
    return detector

@app.on_event("startup")
def startup_event():
    try:
        get_detector()
        print("PotholeDetector initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not pre-load PotholeDetector: {e}")

@app.get("/", tags=["General"])
def root():
    return {
        "message": "AI Powered Road Surface Damage Detection API is online.",
        "docs": "/docs",
        "health": "/health",
        "detect_endpoint": "POST /detect",
        "version": "1.0.0"
    }

@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health_check():
    try:
        d = get_detector()
        is_loaded = d is not None and d.net is not None
    except Exception:
        is_loaded = False

    return HealthResponse(
        status="healthy" if is_loaded else "degraded",
        model_loaded=is_loaded,
        model_name="YOLOv4-Tiny Pothole Detector",
        architecture="Darknet YOLOv4-Tiny (OpenCV DNN Engine)",
        device="CPU (Optimized SIMD Vectorization)",
        version="1.0.0"
    )

@app.get("/info", response_model=ModelInfoResponse, tags=["Model Info"])
def model_info():
    return ModelInfoResponse(
        model_name="YOLOv4-Tiny Road Damage & Pothole Detector",
        architecture="YOLOv4-Tiny (Darknet Backend)",
        input_resolution="640x640 RGB",
        classes=["Pothole"],
        training_dataset="Roboflow Road Surface Damage Benchmark / Darknet Pothole Dataset",
        source_attribution="Open-source trained YOLOv4-Tiny weights (akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4 & Roboflow)",
        description="High-performance object detection model specialized in asphalt road anomalies, fissures, and crater-style potholes with automated severity risk categorization."
    )

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@app.post("/detect", response_model=DetectionResponse, tags=["Inference"])
async def detect_potholes(
    file: UploadFile = File(..., description="Road image file (JPEG, PNG, WebP)"),
    conf_threshold: float = Query(0.20, ge=0.05, le=0.95, description="Confidence score threshold"),
    nms_threshold: float = Query(0.40, ge=0.05, le=0.95, description="Non-Maximum Suppression IOU threshold")
):
    try:
        current_detector = get_detector()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Detector model failed to initialize: {str(e)}"
        )

    # Validate file extension
    filename = file.filename or "image.jpg"
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read image contents
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 10MB."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        result = current_detector.detect(
            image_bytes=contents,
            conf_threshold=conf_threshold,
            nms_threshold=nms_threshold
        )
        return DetectionResponse(**result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
