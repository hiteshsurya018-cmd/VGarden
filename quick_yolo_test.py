#!/usr/bin/env python3
"""
One-Click YOLOv5 Test for Virtual Garden
Run this after starting the backend to verify AI detection
"""

import requests
import json
from PIL import Image, ImageDraw
import io

def create_plant_test_image():
    """Create a clear plant image for testing"""
    img = Image.new('RGB', (640, 480), color=(135, 206, 235))  # Sky blue
    draw = ImageDraw.Draw(img)
    
    # Draw ground
    draw.rectangle([0, 400, 640, 480], fill=(139, 69, 19))  # Brown ground
    
    # Draw main plant pot
    draw.ellipse([250, 380, 390, 420], fill=(101, 67, 33))  # Brown pot
    draw.rectangle([260, 350, 380, 400], fill=(101, 67, 33))
    
    # Draw main stem
    draw.rectangle([315, 200, 325, 350], fill=(34, 139, 34))
    
    # Draw large leaves
    leaf_coords = [
        # Left leaves
        [(280, 220), (315, 200), (330, 240), (310, 270), (280, 250)],
        [(270, 280), (310, 270), (340, 300), (320, 340), (280, 320)],
        # Right leaves  
        [(325, 200), (370, 220), (380, 250), (350, 270), (330, 240)],
        [(340, 300), (380, 280), (400, 320), (370, 350), (340, 330)],
        # Top leaves
        [(300, 160), (320, 140), (340, 160), (330, 190), (310, 180)],
    ]
    
    for coords in leaf_coords:
        draw.polygon(coords, fill=(0, 128, 0), outline=(0, 100, 0), width=2)
    
    # Add flowers/fruits
    for x, y in [(290, 180), (340, 170), (350, 200), (300, 200)]:
        draw.ellipse([x-6, y-6, x+6, y+6], fill=(255, 0, 0))  # Red flowers
    
    # Add smaller plant
    draw.rectangle([150, 320, 160, 380], fill=(34, 139, 34))  # Small stem
    small_leaves = [
        [(130, 330), (150, 320), (170, 340), (150, 350), (130, 340)],
        [(140, 300), (160, 290), (180, 310), (160, 320), (140, 310)],
    ]
    for coords in small_leaves:
        draw.polygon(coords, fill=(0, 100, 0), outline=(0, 80, 0))
    
    return img

def test_yolov5_detection():
    """Test YOLOv5 detection with plant image"""
    print("🔍 Testing YOLOv5 Plant Detection...")
    print("-" * 40)
    
    # Check backend status first
    try:
        health = requests.get("http://localhost:8000/health", timeout=3)
        if health.status_code != 200:
            print("❌ Backend not responding correctly")
            return False
        
        health_data = health.json()
        print(f"✅ Backend Status: {health_data.get('status')}")
        print(f"✅ Model Loaded: {health_data.get('model_loaded')}")
        
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        print("\n💡 Start the backend first:")
        print("   cd ml-backend && uvicorn main:app --reload")
        return False
    
    # Create test image
    print("\n🌱 Creating test plant image...")
    test_img = create_plant_test_image()
    
    # Save test image for verification
    test_img.save("test_plant_image.png")
    print("   Test image saved as: test_plant_image.png")
    
    # Convert to API format
    img_bytes = io.BytesIO()
    test_img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Test plant detection
    print("\n🤖 Running YOLOv5 detection...")
    try:
        files = {'file': ('test_plant.png', img_bytes, 'image/png')}
        response = requests.post("http://localhost:8000/api/detect-plants", 
                               files=files, timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ YOLOv5 Detection Complete!")
            print(f"   Success: {data.get('success')}")
            print(f"   Plants detected: {data.get('count', 0)}")
            print(f"   Image size: {data.get('image_info', {}).get('width')}x{data.get('image_info', {}).get('height')}")
            
            # Show detection results
            plants = data.get('plants', [])
            if plants:
                print(f"\n🌿 Detected Plants:")
                for i, plant in enumerate(plants):
                    bbox = plant.get('bbox', {})
                    print(f"   {i+1}. {plant.get('label').upper()}")
                    print(f"      Confidence: {plant.get('confidence', 0):.3f}")
                    print(f"      Location: ({bbox.get('x1', 0):.0f},{bbox.get('y1', 0):.0f}) "
                          f"to ({bbox.get('x2', 0):.0f},{bbox.get('y2', 0):.0f})")
                    print(f"      Category: {plant.get('category')}")
                    print(f"      Scientific: {plant.get('scientific_name')}")
                    if plant.get('properties'):
                        print(f"      Properties: {', '.join(plant.get('properties', []))}")
                    print()
                
                # Test image quality analysis
                print("🔬 Testing image quality analysis...")
                img_bytes.seek(0)
                files = {'file': ('test_plant.png', img_bytes, 'image/png')}
                quality_response = requests.post("http://localhost:8000/api/analyze-image-quality", 
                                               files=files, timeout=10)
                
                if quality_response.status_code == 200:
                    quality_data = quality_response.json()
                    quality = quality_data.get('quality', {})
                    print(f"   Quality Score: {quality.get('score', 0):.1f}/100")
                    print(f"   Brightness: {quality.get('brightness', 0):.1f}")
                    print(f"   Contrast: {quality.get('contrast', 0):.1f}")
                    print(f"   Sharpness: {quality.get('sharpness', 0):.1f}")
                    print(f"   Recommendation: {quality.get('recommendation')}")
                
            else:
                print("\n⚠️  No plants detected")
                print("   This might be normal - YOLOv5 general model may not detect synthetic plants")
                print("   Try with a real plant image for better results")
            
            return True
            
        else:
            print(f"❌ Detection failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Detection error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 YOLOv5 Model Quick Test")
    print("=" * 30)
    
    success = test_yolov5_detection()
    
    print("\n" + "=" * 30)
    if success:
        print("🎉 YOLOv5 backend is working!")
        print("\n🌐 Try in your Virtual Garden:")
        print("   1. Upload a real plant image")
        print("   2. Watch AI detection with bounding boxes")
        print("   3. See confidence scores and plant properties")
        print("   4. Add detected plants to 3D garden")
        
        print("\n📸 Test Images:")
        print("   • test_plant_image.png created for testing")
        print("   • Try uploading photos of real plants")
        print("   • Better results with clear, well-lit plant images")
        
    else:
        print("❌ YOLOv5 test failed")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure backend is running: cd ml-backend && uvicorn main:app --reload")
        print("   2. Check health: curl http://localhost:8000/health")
        print("   3. View API docs: http://localhost:8000/docs")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
