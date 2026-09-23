import cv2
import numpy as np
import os
import base64
import time

def test_inference():
    cfg_path = os.path.join(os.path.dirname(__file__), "models", "yolov4_tiny.cfg")
    weights_path = os.path.join(os.path.dirname(__file__), "models", "yolov4_tiny.weights")
    names_path = os.path.join(os.path.dirname(__file__), "models", "obj.names")

    print(f"Loading model: {cfg_path}, {weights_path}")
    assert os.path.exists(cfg_path), "CFG not found"
    assert os.path.exists(weights_path), "Weights not found"
    assert os.path.exists(names_path), "Names not found"

    with open(names_path, 'r') as f:
        classes = [line.strip() for line in f.readlines() if line.strip()]
    print(f"Classes: {classes}")

    # Load OpenCV DNN Network
    net = cv2.dnn.readNetFromDarknet(cfg_path, weights_path)
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

    layer_names = net.getLayerNames()
    out_layers_indices = net.getUnconnectedOutLayers()
    if isinstance(out_layers_indices, np.ndarray):
        out_layer_names = [layer_names[i - 1 if isinstance(i, (int, np.integer)) else i[0] - 1] for i in out_layers_indices.flatten()]
    else:
        out_layer_names = [layer_names[i - 1] for i in out_layers_indices]

    print(f"Output layers: {out_layer_names}")

    # Test image inference
    sample_img_path = os.path.join(os.path.dirname(__file__), "..", "sample_images", "sample_1.jpg")
    if not os.path.exists(sample_img_path):
        # Create a synthetic road image with a dark oval hole if sample not found
        img = np.full((480, 640, 3), 100, dtype=np.uint8)
        cv2.ellipse(img, (320, 240), (80, 40), 0, 0, 360, (40, 40, 40), -1)
    else:
        img = cv2.imread(sample_img_path)

    height, width = img.shape[:2]
    print(f"Input image shape: {height}x{width}")

    start_time = time.time()
    # YOLOv4-tiny uses 416x416 blob
    blob = cv2.dnn.blobFromImage(img, 1 / 255.0, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)
    layer_outputs = net.forward(out_layer_names)
    inference_time = (time.time() - start_time) * 1000

    print(f"Inference latency: {inference_time:.2f}ms")

    boxes = []
    confidences = []
    class_ids = []

    conf_threshold = 0.2
    nms_threshold = 0.4

    for output in layer_outputs:
        for detection in output:
            scores = detection[5:]
            class_id = int(np.argmax(scores))
            confidence = float(scores[class_id])

            if confidence > conf_threshold:
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
    print(f"Raw detections: {len(boxes)}, After NMS: {len(indices) if indices is not None else 0}")

    if indices is not None and len(indices) > 0:
        for i in (indices.flatten() if isinstance(indices, np.ndarray) else indices):
            box = boxes[i]
            x, y, w, h = max(0, box[0]), max(0, box[1]), box[2], box[3]
            conf = confidences[i]
            c_name = classes[class_ids[i]] if class_ids[i] < len(classes) else "pothole"
            print(f"Detected {c_name}: conf={conf:.3f}, bbox=[{x}, {y}, {w}, {h}]")

    print("YOLOv4-tiny OpenCV DNN inference test PASSED!")

if __name__ == "__main__":
    test_inference()
