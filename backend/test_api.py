import os
import io
import sys
from fastapi.testclient import TestClient
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from app.main import app

client = TestClient(app)

def create_dummy_image(color=(128, 128, 128), size=(400, 400)):
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def run_tests():
    print("Testing Root Endpoint GET /...")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.status_code}"
    print("[PASS] Root endpoint OK:", res.json()["message"])

    print("Testing Health Endpoint GET /health...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.status_code}"
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    print("[PASS] Health endpoint OK:", data)

    print("Testing Info Endpoint GET /info...")
    res = client.get("/info")
    assert res.status_code == 200, f"Info failed: {res.status_code}"
    data = res.json()
    assert "Pothole" in data["classes"]
    print("[PASS] Info endpoint OK:", data["model_name"])

    print("Testing Detect Endpoint POST /detect with dummy image...")
    dummy_bytes = create_dummy_image()
    res = client.post(
        "/detect",
        files={"file": ("dummy.jpg", dummy_bytes, "image/jpeg")},
        params={"conf_threshold": 0.20}
    )
    assert res.status_code == 200, f"Detect dummy failed: {res.status_code} {res.text}"
    data = res.json()
    assert data["status"] == "success"
    assert "annotated_image_base64" in data
    print(f"[PASS] Detect dummy OK: {data['summary']['total_detected']} potholes, latency: {data['inference_time_ms']}ms")

    print("Testing Detect Endpoint POST /detect with sample pothole road image...")
    sample_path = os.path.join(os.path.dirname(__file__), "..", "sample_images", "road_pothole_1.jpg")
    if os.path.exists(sample_path):
        with open(sample_path, "rb") as f:
            img_bytes = f.read()
        res = client.post(
            "/detect",
            files={"file": ("road_pothole_1.jpg", img_bytes, "image/jpeg")},
            params={"conf_threshold": 0.20}
        )
        assert res.status_code == 200, f"Detect sample failed: {res.status_code}"
        data = res.json()
        assert data["summary"]["total_detected"] > 0
        print(f"[PASS] Detect sample OK: {data['summary']['total_detected']} potholes detected, max conf: {data['summary']['max_confidence']}")

    print("Testing Invalid File Type Validation...")
    res = client.post(
        "/detect",
        files={"file": ("test.pdf", b"%PDF-1.4...", "application/pdf")}
    )
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print("[PASS] Invalid file validation OK:", res.json()["detail"])

    print("\n==========================================")
    print(" ALL BACKEND INTEGRATION TESTS PASSED 100% ")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
