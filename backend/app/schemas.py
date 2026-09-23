from typing import List, Optional
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: int = Field(..., description="X coordinate of top-left corner")
    y: int = Field(..., description="Y coordinate of top-left corner")
    width: int = Field(..., description="Width of bounding box")
    height: int = Field(..., description="Height of bounding box")

class DetectionItem(BaseModel):
    id: int = Field(..., description="Detection index")
    class_name: str = Field(..., description="Class name (e.g. pothole)")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    bbox: BoundingBox = Field(..., description="Bounding box coordinates in pixels")
    area_pixels: int = Field(..., description="Area of detected damage in pixels")
    area_percentage: float = Field(..., description="Estimated percentage of image occupied by pothole")
    severity: str = Field(..., description="Severity category: Low, Medium, High")

class DetectionSummary(BaseModel):
    total_detected: int = Field(..., description="Total count of detected potholes")
    high_severity_count: int = Field(..., description="Count of high severity potholes")
    medium_severity_count: int = Field(..., description="Count of medium severity potholes")
    low_severity_count: int = Field(..., description="Count of low severity potholes")
    max_confidence: float = Field(..., description="Highest confidence among detections")
    average_confidence: float = Field(..., description="Average confidence score")

class DetectionResponse(BaseModel):
    status: str = Field(..., description="Response status (success / error)")
    inference_time_ms: float = Field(..., description="Inference latency in milliseconds")
    image_width: int = Field(..., description="Original image width")
    image_height: int = Field(..., description="Original image height")
    detections: List[DetectionItem] = Field(default_factory=list, description="List of detected potholes")
    summary: DetectionSummary = Field(..., description="Aggregate summary metrics")
    annotated_image_base64: str = Field(..., description="Base64 data URI of the annotated image with bounding boxes")

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    architecture: str
    device: str
    version: str

class ModelInfoResponse(BaseModel):
    model_name: str
    architecture: str
    input_resolution: str
    classes: List[str]
    training_dataset: str
    source_attribution: str
    description: str
