import os
import time
import base64
from typing import Dict, Any, List, Tuple
import cv2
import numpy as np

class PotholeDetector:
    def __init__(
        self,
        cfg_path: str = None,
        weights_path: str = None,
        names_path: str = None
    ):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.cfg_path = cfg_path or os.path.join(base_dir, "models", "yolov4_tiny.cfg")
        self.weights_path = weights_path or os.path.join(base_dir, "models", "yolov4_tiny.weights")
        self.names_path = names_path or os.path.join(base_dir, "models", "obj.names")
        
        self.classes = self._load_classes()
        self.net = self._load_model()
        self.output_layers = self._get_output_layers()
        self.input_size = (640, 640)

    def _load_classes(self) -> List[str]:
        if os.path.exists(self.names_path):
            with open(self.names_path, "r", encoding="utf-8") as f:
                classes = [line.strip() for line in f.readlines() if line.strip()]
                return classes if classes else ["Pothole"]
        return ["Pothole"]

    WEIGHTS_DOWNLOAD_URL = "https://raw.githubusercontent.com/akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4/main/utils/yolov4_tiny.weights"
    CFG_DOWNLOAD_URL = "https://raw.githubusercontent.com/akshxyjagtap/Pothole-Detection-System-using-YOLO-Tiny-v4/main/utils/yolov4_tiny.cfg"

    def _ensure_weights(self):
        import urllib.request
        os.makedirs(os.path.dirname(self.weights_path), exist_ok=True)
        if not os.path.exists(self.weights_path) or os.path.getsize(self.weights_path) < 1000000:
            print(f"Weights file not found at {self.weights_path}. Downloading from external host...")
            urllib.request.urlretrieve(self.WEIGHTS_DOWNLOAD_URL, self.weights_path)
            print(f"Downloaded weights successfully ({os.path.getsize(self.weights_path)} bytes).")

        if not os.path.exists(self.cfg_path):
            print(f"Config file not found at {self.cfg_path}. Downloading...")
            urllib.request.urlretrieve(self.CFG_DOWNLOAD_URL, self.cfg_path)
            print(f"Downloaded cfg successfully.")

    def _load_model(self) -> cv2.dnn.Net:
        self._ensure_weights()
        if not os.path.exists(self.cfg_path):
            raise FileNotFoundError(f"Config file not found: {self.cfg_path}")
        if not os.path.exists(self.weights_path):
            raise FileNotFoundError(f"Weights file not found: {self.weights_path}")
        
        net = cv2.dnn.readNet(self.weights_path, self.cfg_path)
        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        return net

    def _get_output_layers(self) -> List[str]:
        layer_names = self.net.getLayerNames()
        out_indices = self.net.getUnconnectedOutLayers()
        if isinstance(out_indices, np.ndarray):
            return [layer_names[i - 1 if isinstance(i, (int, np.integer)) else i[0] - 1] for i in out_indices.flatten()]
        return [layer_names[i - 1] for i in out_indices]

    def _calculate_severity(self, area_pct: float, conf: float) -> str:
        if area_pct >= 5.0 or (area_pct >= 3.0 and conf > 0.65):
            return "High"
        elif area_pct >= 1.5:
            return "Medium"
        else:
            return "Low"

    def _get_severity_color(self, severity: str) -> Tuple[int, int, int]:
        # BGR format
        if severity == "High":
            return (50, 50, 239)     # Bright Red/Crimson
        elif severity == "Medium":
            return (11, 158, 245)    # Vibrant Amber/Orange
        else:
            return (129, 185, 16)    # Emerald Green

    def detect(
        self,
        image_bytes: bytes,
        conf_threshold: float = 0.20,
        nms_threshold: float = 0.40
    ) -> Dict[str, Any]:
        # Decode image from buffer
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image from provided payload.")

        height, width = img.shape[:2]
        total_pixels = height * width

        start_time = time.time()

        # Build blob for YOLOv4-tiny
        blob = cv2.dnn.blobFromImage(
            img,
            1.0 / 255.0,
            self.input_size,
            swapRB=True,
            crop=False
        )
        self.net.setInput(blob)
        layer_outputs = self.net.forward(self.output_layers)

        boxes: List[List[int]] = []
        confidences: List[float] = []
        class_ids: List[int] = []

        for output in layer_outputs:
            for detection in output:
                # YOLOv4 detection vector: [x_center, y_center, w, h, obj_conf, class_0_conf, class_1_conf, ...]
                obj_conf = float(detection[4])
                class_scores = detection[5:] * obj_conf
                class_id = int(np.argmax(class_scores))
                confidence = float(class_scores[class_id]) if len(class_scores) > 0 else obj_conf

                if confidence >= conf_threshold:
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)

                    boxes.append([x, y, w, h])
                    confidences.append(confidence)
                    class_ids.append(class_id)

        indices = cv2.dnn.NMSBoxes(boxes, confidences, conf_threshold, nms_threshold)
        inference_time_ms = round((time.time() - start_time) * 1000, 2)

        detections: List[Dict[str, Any]] = []
        annotated_img = img.copy()
        overlay = img.copy()

        high_count = 0
        med_count = 0
        low_count = 0

        if indices is not None and len(indices) > 0:
            flat_indices = indices.flatten() if isinstance(indices, np.ndarray) else indices
            for idx_num, i in enumerate(flat_indices, 1):
                box = boxes[i]
                x = max(0, box[0])
                y = max(0, box[1])
                w = min(width - x, max(1, box[2]))
                h = min(height - y, max(1, box[3]))
                conf = float(confidences[i])
                cid = class_ids[i]
                cname = self.classes[cid] if cid < len(self.classes) else "Pothole"

                area_px = int(w * h)
                area_pct = round((area_px / total_pixels) * 100.0, 2)
                severity = self._calculate_severity(area_pct, conf)

                if severity == "High":
                    high_count += 1
                elif severity == "Medium":
                    med_count += 1
                else:
                    low_count += 1

                color = self._get_severity_color(severity)

                # 1. Draw subtle transparent fill over detected region
                cv2.rectangle(overlay, (x, y), (x + w, y + h), color, -1)

                # 2. Draw outer border
                cv2.rectangle(annotated_img, (x, y), (x + w, y + h), color, 2, lineType=cv2.LINE_AA)

                # 3. Draw corner HUD brackets
                corner_len = max(8, min(24, int(min(w, h) * 0.25)))
                line_w = 3
                # Top-Left
                cv2.line(annotated_img, (x, y), (x + corner_len, y), color, line_w, cv2.LINE_AA)
                cv2.line(annotated_img, (x, y), (x, y + corner_len), color, line_w, cv2.LINE_AA)
                # Top-Right
                cv2.line(annotated_img, (x + w, y), (x + w - corner_len, y), color, line_w, cv2.LINE_AA)
                cv2.line(annotated_img, (x + w, y), (x + w, y + corner_len), color, line_w, cv2.LINE_AA)
                # Bottom-Left
                cv2.line(annotated_img, (x, y + h), (x + corner_len, y + h), color, line_w, cv2.LINE_AA)
                cv2.line(annotated_img, (x, y + h), (x, y + h - corner_len), color, line_w, cv2.LINE_AA)
                # Bottom-Right
                cv2.line(annotated_img, (x + w, y + h), (x + w - corner_len, y + h), color, line_w, cv2.LINE_AA)
                cv2.line(annotated_img, (x + w, y + h), (x + w, y + h - corner_len), color, line_w, cv2.LINE_AA)

                # 4. Draw Pill Badge Label with id, confidence & severity
                label = f"#{idx_num} {cname} {int(conf * 100)}% [{severity}]"
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = max(0.42, min(0.65, width / 1200))
                thickness = 1
                (label_w, label_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)

                badge_y1 = max(0, y - label_h - 10)
                badge_y2 = badge_y1 + label_h + 10
                badge_x2 = min(width, x + label_w + 14)

                # Solid badge background
                cv2.rectangle(annotated_img, (x, badge_y1), (badge_x2, badge_y2), (20, 24, 33), -1)
                cv2.rectangle(annotated_img, (x, badge_y1), (badge_x2, badge_y2), color, 1, lineType=cv2.LINE_AA)
                # Text
                cv2.putText(
                    annotated_img,
                    label,
                    (x + 7, badge_y2 - 6),
                    font,
                    font_scale,
                    (255, 255, 255),
                    thickness,
                    cv2.LINE_AA
                )

                detections.append({
                    "id": idx_num,
                    "class_name": cname,
                    "confidence": round(conf, 4),
                    "bbox": {
                        "x": x,
                        "y": y,
                        "width": w,
                        "height": h
                    },
                    "area_pixels": area_px,
                    "area_percentage": area_pct,
                    "severity": severity
                })

        # Blend semi-transparent overlay (alpha=0.18)
        alpha = 0.18
        cv2.addWeighted(overlay, alpha, annotated_img, 1 - alpha, 0, annotated_img)

        # Encode annotated image to JPEG base64
        _, buffer = cv2.imencode(".jpg", annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 90])
        b64_str = base64.b64encode(buffer).decode("utf-8")
        annotated_b64 = f"data:image/jpeg;base64,{b64_str}"

        total_det = len(detections)
        max_conf = round(max([d["confidence"] for d in detections]), 4) if total_det > 0 else 0.0
        avg_conf = round(sum([d["confidence"] for d in detections]) / total_det, 4) if total_det > 0 else 0.0

        return {
            "status": "success",
            "inference_time_ms": inference_time_ms,
            "image_width": width,
            "image_height": height,
            "detections": detections,
            "summary": {
                "total_detected": total_det,
                "high_severity_count": high_count,
                "medium_severity_count": med_count,
                "low_severity_count": low_count,
                "max_confidence": max_conf,
                "average_confidence": avg_conf
            },
            "annotated_image_base64": annotated_b64
        }
