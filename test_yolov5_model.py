#!/usr/bin/env python3
"""
YOLOv5 Model Test Script for Virtual Garden
Tests the plant detection model functionality step by step
"""

import os
import sys
import time
import requests
import json
from pathlib import Path
from PIL import Image, ImageDraw
import io

def create_test_plant_image():
    """Create a synthetic plant image for testing"""
    # Create a simple plant-like image
    img = Image.new('RGB', (640, 480), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Draw a pot
    draw.rectangle([200, 350, 440, 450], fill='brown', outline='darkbrown', width=3)
    
    # Draw stem
    draw.rectangle([315, 250, 325, 350], fill='green')
    
    # Draw leaves
    leaf_points = [
        [(280, 280), (320, 260), (340, 290), (320, 320), (280, 300)],  # Left leaf
        [(320, 260), (360, 280), (380, 300), (360, 320), (320, 290)],  # Right leaf
        [(300, 200), (320, 180), (340, 200), (320, 240), (300, 220)],  # Top leaf
    ]
    
    for points in leaf_points:
        draw.polygon(points, fill='darkgreen', outline='green', width=2)
    
    # Add some flower-like shapes
    for x, y in [(290, 200), (330, 190), (350, 210)]:
        draw.ellipse([x-8, y-8, x+8, y+8], fill='red', outline='darkred')
    
    return img

def test_backend_connection():
    """Test basic backend connectivity"""
    print("🔍 Testing backend connection...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend connected!")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            return True, data
        else:
            print(f"❌ Backend returned {response.status_code}")
            return False, None
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend on localhost:8000")
        print("   Start the backend first:")
        print("   cd ml-backend && uvicorn main:app --reload")
        return False, None
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False, None

def test_yolov5_model_loading():
    """Test YOLOv5 model loading specifically"""
    print("\n🤖 Testing YOLOv5 model loading...")
    
    test_script = '''
import torch
from ultralytics import YOLO
import sys

try:
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    
    # Load YOLOv5 model
    print("Loading YOLOv5s model...")
    model = YOLO("yolov5s.pt")
    print("✅ YOLOv5 model loaded successfully")
    
    # Check model details
    print(f"Model classes: {len(model.names)}")
    print(f"First 5 classes: {list(model.names.values())[:5]}")
    
    # Test with dummy input
    import numpy as np
    from PIL import Image
    
    dummy_img = Image.new('RGB', (640, 640), color='green')
    results = model(dummy_img, conf=0.25)
    print(f"✅ Model inference successful")
    print(f"Results type: {type(results)}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
'''
    
    # Save and run the test
    with open("temp_model_test.py", "w", encoding="utf-8") as f:
        f.write(test_script)
    
    try:
        import subprocess
        result = subprocess.run([sys.executable, "temp_model_test.py"], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ YOLOv5 model test passed!")
            print("Model output:")
            for line in result.stdout.strip().split('\n'):
                print(f"   {line}")
            return True
        else:
            print("❌ YOLOv5 model test failed!")
            print("Error output:")
            for line in result.stderr.strip().split('\n'):
                print(f"   {line}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ Model test timed out (>30s)")
        return False
    except Exception as e:
        print(f"❌ Error running model test: {e}")
        return False
    finally:
        # Cleanup
        if os.path.exists("temp_model_test.py"):
            os.remove("temp_model_test.py")

def test_plant_detection_api():
    """Test the plant detection API with a synthetic image"""
    print("\n🌿 Testing plant detection API...")
    
    # Create test image
    test_img = create_test_plant_image()
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    test_img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    try:
        # Test the detection API
        files = {'file': ('test_plant.png', img_bytes, 'image/png')}
        response = requests.post("http://localhost:8000/api/detect-plants", 
                               files=files, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Plant detection API working!")
            print(f"   Success: {data.get('success')}")
            print(f"   Plants detected: {data.get('count', 0)}")
            print(f"   Image info: {data.get('image_info', {})}")
            
            # Show detected plants
            plants = data.get('plants', [])
            if plants:
                print(f"\n   Detected plants:")
                for i, plant in enumerate(plants[:3]):  # Show first 3
                    bbox = plant.get('bbox', {})
                    print(f"   {i+1}. {plant.get('label')} "
                          f"(confidence: {plant.get('confidence', 0):.3f})")
                    print(f"      BBox: ({bbox.get('x1', 0):.0f}, {bbox.get('y1', 0):.0f}) "
                          f"to ({bbox.get('x2', 0):.0f}, {bbox.get('y2', 0):.0f})")
                    print(f"      Category: {plant.get('category')}")
                    print(f"      Properties: {plant.get('properties', [])}")
            else:
                print("   No plants detected in test image")
            
            return True, data
        else:
            print(f"❌ API returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error testing detection API: {e}")
        return False, None

def test_real_plant_image():
    """Test with a real plant image if available"""
    print("\n🌱 Testing with real plant image...")
    
    # Look for any plant images in the project
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
    test_images = []
    
    # Check common directories
    for directory in ['.', 'public', 'assets', 'test_images']:
        if os.path.exists(directory):
            for file in os.listdir(directory):
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    test_images.append(os.path.join(directory, file))
    
    if not test_images:
        print("⚠️  No test images found")
        print("   Place plant images in the project directory to test with real images")
        return True
    
    # Test with first available image
    test_image = test_images[0]
    print(f"   Testing with: {test_image}")
    
    try:
        with open(test_image, 'rb') as f:
            files = {'file': (os.path.basename(test_image), f, 'image/jpeg')}
            response = requests.post("http://localhost:8000/api/detect-plants", 
                                   files=files, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Real image test successful!")
            print(f"   Plants detected: {data.get('count', 0)}")
            return True
        else:
            print(f"❌ Real image test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing real image: {e}")
        return False

def main():
    print("🧪 YOLOv5 Plant Detection Model Test Suite")
    print("=" * 50)
    
    # Test 1: Backend connection
    connected, health_data = test_backend_connection()
    if not connected:
        print("\n💡 To start the backend:")
        print("   cd ml-backend")
        print("   python3 -m venv venv")
        print("   source venv/bin/activate")
        print("   pip install -r requirements.txt")
        print("   uvicorn main:app --reload")
        return 1
    
    # Test 2: YOLOv5 model loading (if backend is local)
    if os.path.exists("ml-backend/main.py"):
        print("\n📁 Backend source found locally, testing model...")
        os.chdir("ml-backend")
        model_ok = test_yolov5_model_loading()
        os.chdir("..")
        
        if not model_ok:
            print("\n💡 Model loading failed. Try:")
            print("   cd ml-backend")
            print("   pip install --upgrade ultralytics torch")
            print("   python -c 'from ultralytics import YOLO; YOLO(\"yolov5s.pt\")'")
    else:
        print("\n⚠️  Backend source not found locally, skipping direct model test")
    
    # Test 3: Plant detection API
    detection_ok, detection_data = test_plant_detection_api()
    
    # Test 4: Real plant image (if available)
    test_real_plant_image()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Backend Connection: {'✅' if connected else '❌'}")
    print(f"   Model Loading: {'✅' if 'model_ok' in locals() and model_ok else '⚠️'}")
    print(f"   Detection API: {'✅' if detection_ok else '❌'}")
    
    if connected and detection_ok:
        print("\n🎉 YOLOv5 backend is working correctly!")
        print("\n🌐 Test in your frontend:")
        print("   1. Upload a plant image")
        print("   2. Watch real YOLOv5 detection")
        print("   3. Check detection confidence scores")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
