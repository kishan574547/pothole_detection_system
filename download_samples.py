import os
import urllib.request

os.makedirs('sample_images', exist_ok=True)
os.makedirs('backend/models', exist_ok=True)

samples = [
    ('sample_1.jpg', 'https://raw.githubusercontent.com/matteobarato/yolov4-potholes-detection/master/media/2020-04-03T16%3A03%3A11.742Z.jpg'),
    ('sample_2.jpg', 'https://raw.githubusercontent.com/matteobarato/yolov4-potholes-detection/master/media/2020-04-03T16%3A03%3A39.192Z.jpg'),
    ('sample_3.jpg', 'https://raw.githubusercontent.com/matteobarato/yolov4-potholes-detection/master/media/2020-04-03T16%3A03%3A53.882Z.jpg'),
    ('sample_4.jpg', 'https://raw.githubusercontent.com/matteobarato/yolov4-potholes-detection/master/media/2020-04-03T16%3A04%3A40.063Z.jpg'),
]

for name, url in samples:
    path = os.path.join('sample_images', name)
    try:
        urllib.request.urlretrieve(url, path)
        print(f"Downloaded {name}: {os.path.getsize(path)} bytes")
    except Exception as e:
        print(f"Failed {name}: {e}")

weights_path = 'backend/models/yolov4_tiny.weights'
if os.path.exists(weights_path):
    print(f"Weights file size: {os.path.getsize(weights_path)} bytes")
else:
    print("Weights file not present yet.")
