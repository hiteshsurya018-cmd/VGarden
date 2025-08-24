#!/usr/bin/env python3
"""
Quick Backend Status Checker for Virtual Garden
"""

import requests
import json

def check_backend_status():
    """Check if the backend is running and YOLOv5 model is loaded"""
    
    print("🔍 Checking Virtual Garden Backend...")
    print("-" * 40)
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=3)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is RUNNING!")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            
            # Test root endpoint
            root_response = requests.get("http://localhost:8000/", timeout=3)
            if root_response.status_code == 200:
                root_data = root_response.json()
                print(f"   API Version: {root_data.get('version')}")
                print(f"   Message: {root_data.get('message')}")
            
            # Check plant categories
            try:
                cat_response = requests.get("http://localhost:8000/api/plant-categories", timeout=3)
                if cat_response.status_code == 200:
                    cat_data = cat_response.json()
                    categories = cat_data.get('categories', {})
                    print(f"   Plant categories available: {len(categories)}")
                    print(f"   Sample plants: {list(categories.keys())[:5]}")
            except:
                pass
            
            print("\n🎯 Backend is ready for plant detection!")
            print("   Upload an image in your Virtual Garden frontend")
            
            return True
            
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running on localhost:8000")
        print("\n🚀 To start the backend:")
        print("   cd ml-backend")
        print("   uvicorn main:app --reload")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Backend connection timeout")
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    is_running = check_backend_status()
    
    if not is_running:
        print("\n💡 Quick start commands:")
        print("   cd ml-backend")
        print("   python3 -m venv venv")
        print("   source venv/bin/activate  # Windows: venv\\Scripts\\activate")
        print("   pip install -r requirements.txt")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        
    print("\n📋 Available test scripts:")
    print("   python check_backend.py     # Check backend status")
    print("   python test_yolov5_model.py # Full YOLOv5 test suite")
    print("   python test_backend.py      # Complete backend test")
