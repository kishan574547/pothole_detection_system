import cv2
import numpy as np
import os
import glob

cfg_path = "backend/models/yolov4_tiny.cfg"
weights_path = "backend/models/yolov4_tiny.weights"
names_path = "backend/models/obj.names"

with open(names_path, 'r') as f:
    classes = [line.strip() for line in f.readlines() if line.strip()]

net = cv2.dnn.readNet(weights_path, cfg_path)
layer_names = net.getLayerNames()
out_layers_indices = net.getUnconnectedOutLayers()
out_layer_names = [layer_names[i - 1 if isinstance(i, (int, np.integer)) else i[0] - 1] for i in out_layers_indices.flatten()]

for img_path in glob.glob("sample_images/*.jpg"):
    img = cv2.imread(img_path)
    if img is None:
        continue
    h, w = img.shape[:2]
    blob = cv2.dnn.blobFromImage(img, 1/255.0, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)
    layer_outputs = net.forward(out_layer_names)
    
    boxes, confidences = [], []
    for output in layer_outputs:
        for detection in output:
            scores = detection[5:]
            confidence = float(scores[0]) if len(scores) > 0 else 0.0
            if confidence > 0.15:
                center_x, center_y = int(detection[0] * w), int(detection[1] * h)
                width, height = int(detection[2] * w), int(detection[3] * h)
                x = int(center_x - width / 2)
                y = int(center_y - height / 2)
                boxes.append([x, y, width, height])
                confidences.append(confidence)
                
    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.15, 0.4)
    det_count = len(indices) if indices is not None else 0
    print(f"{os.path.basename(img_path)}: {det_count} potholes detected. Top scores: {sorted(confidences, reverse=True)[:3]}")
