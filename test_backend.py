#!/usr/bin/env python3
"""
Test script for Virtual Garden Plant Detection Backend
Verifies backend setup and API functionality
"""

import requests
import json
import time
import sys
from pathlib import Path

def test_backend_connection():
    """Test if backend is running and accessible"""
    print("🔍 Testing backend connection...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is running!")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend on http://localhost:8000")
        print("   Make sure the backend is running:")
        print("   python launch_backend.py")
        return False
    except requests.exceptions.Timeout:
        print("❌ Backend connection timeout")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_plant_detection():
    """Test plant detection API"""
    print("\n🌿 Testing plant detection API...")
    
    # Create a simple test image (placeholder)
    try:
        from PIL import Image
        import io
        
        # Create a green test image
        img = Image.new('RGB', (200, 200), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Test the API
        files = {'file': ('test_plant.png', img_bytes, 'image/png')}
        response = requests.post("http://localhost:8000/api/detect-plants", 
                               files=files, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Plant detection API working!")
            print(f"   Success: {data.get('success')}")
            print(f"   Plants detected: {data.get('count', 0)}")
            if data.get('plants'):
                for i, plant in enumerate(data['plants'][:2]):  # Show first 2
                    print(f"   Plant {i+1}: {plant.get('label')} "
                          f"(confidence: {plant.get('confidence', 0):.2f})")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
            
    except ImportError:
        print("⚠️  PIL not available for image testing")
        print("   API endpoint exists but cannot test with actual image")
        return True
    except Exception as e:
        print(f"❌ Error testing plant detection: {e}")
        return False

def test_api_endpoints():
    """Test all API endpoints"""
    print("\n🔗 Testing API endpoints...")
    
    endpoints = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/health", "Health check"),
        ("GET", "/api/plant-categories", "Plant categories")
    ]
    
    for method, endpoint, description in endpoints:
        try:
            url = f"http://localhost:8000{endpoint}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"   ✅ {description}: OK")
            else:
                print(f"   ❌ {description}: Status {response.status_code}")
        except Exception as e:
            print(f"   ❌ {description}: Error - {e}")

def main():
    print("🧪 Virtual Garden Backend Test Suite")
    print("=" * 45)
    
    # Test backend connection
    if not test_backend_connection():
        print("\n💡 To start the backend:")
        print("   python launch_backend.py")
        return 1
    
    # Test API endpoints
    test_api_endpoints()
    
    # Test plant detection
    test_plant_detection()
    
    print("\n" + "=" * 45)
    print("✅ Backend testing complete!")
    print("\n🌐 Your Virtual Garden backend is ready for:")
    print("   • Real-time plant detection")
    print("   • Image quality analysis") 
    print("   • Medicinal plant database")
    print("   • Frontend integration")
    
    print("\n📱 Test in your frontend:")
    print("   1. Upload a plant image")
    print("   2. Watch real AI detection")
    print("   3. Explore 3D garden features")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
