#!/usr/bin/env python3
"""
Complete Virtual Garden System Test
Tests the entire integrated system: frontend, backend, and API integration
"""

import requests
import json
import time
import sys
from pathlib import Path
from PIL import Image, ImageDraw
import io

class SystemTester:
    def __init__(self):
        self.frontend_url = "http://localhost:5173"  # Vite dev server
        self.backend_url = "http://localhost:8000"   # FastAPI backend
        self.api_proxy_url = "http://localhost:5173/api"  # Express proxy
        
    def print_header(self, title):
        print("\n" + "="*60)
        print(f"  {title}")
        print("="*60)
    
    def print_test(self, test_name, status, details=""):
        status_icon = "✅" if status else "���"
        print(f"{status_icon} {test_name}")
        if details:
            print(f"   {details}")
    
    def test_frontend(self):
        """Test frontend availability"""
        self.print_header("FRONTEND TESTS")
        
        try:
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                self.print_test("Frontend Loading", True, "React application is running")
            else:
                self.print_test("Frontend Loading", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Frontend Loading", False, f"Error: {e}")
            return False
        
        # Test API proxy endpoints
        try:
            response = requests.get(f"{self.api_proxy_url}/ping", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.print_test("API Proxy", True, data.get("message", "OK"))
            else:
                self.print_test("API Proxy", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("API Proxy", False, f"Error: {e}")
        
        # Test garden status endpoint
        try:
            response = requests.get(f"{self.api_proxy_url}/garden/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.print_test("Garden API", True, f"Version: {data.get('version')}")
                
                # Show features
                features = data.get('features', {})
                for feature, enabled in features.items():
                    status_text = "Enabled" if enabled else "Disabled"
                    self.print_test(f"  {feature.replace('_', ' ').title()}", enabled, status_text)
            else:
                self.print_test("Garden API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Garden API", False, f"Error: {e}")
        
        return True
    
    def test_backend_management(self):
        """Test backend management through API proxy"""
        self.print_header("BACKEND MANAGEMENT TESTS")
        
        # Test backend status check
        try:
            response = requests.get(f"{self.api_proxy_url}/backend/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                running = data.get('running', False)
                healthy = data.get('healthy', False)
                status = data.get('status', 'unknown')
                
                self.print_test("Backend Status Check", True, f"Status: {status}")
                self.print_test("  Backend Running", running)
                self.print_test("  Backend Healthy", healthy)
                
                if not running:
                    # Try to start backend
                    print("\n🚀 Attempting to start backend...")
                    start_response = requests.post(f"{self.api_proxy_url}/backend/start", timeout=30)
                    if start_response.status_code == 200:
                        start_data = start_response.json()
                        self.print_test("Backend Start Command", start_data.get('success', False), 
                                      start_data.get('message', ''))
                        
                        # Wait and check status again
                        time.sleep(5)
                        return self.check_backend_after_start()
                    else:
                        self.print_test("Backend Start Command", False, 
                                      f"Status: {start_response.status_code}")
                
                return running and healthy
            else:
                self.print_test("Backend Status Check", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Backend Status Check", False, f"Error: {e}")
            return False
    
    def check_backend_after_start(self):
        """Check backend status after start attempt"""
        print("\n🔄 Checking backend status after start...")
        
        max_retries = 6
        for attempt in range(max_retries):
            try:
                response = requests.get(f"{self.api_proxy_url}/backend/status", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    running = data.get('running', False)
                    healthy = data.get('healthy', False)
                    
                    if healthy:
                        self.print_test(f"Backend Ready (attempt {attempt + 1})", True, "Backend is healthy")
                        return True
                    elif running:
                        self.print_test(f"Backend Starting (attempt {attempt + 1})", True, "Still initializing...")
                        time.sleep(3)
                    else:
                        self.print_test(f"Backend Check (attempt {attempt + 1})", False, "Not running")
                        if attempt < max_retries - 1:
                            time.sleep(3)
                else:
                    self.print_test(f"Status Check Failed (attempt {attempt + 1})", False, 
                                  f"Status: {response.status_code}")
                    time.sleep(3)
            except Exception as e:
                self.print_test(f"Connection Failed (attempt {attempt + 1})", False, f"Error: {e}")
                time.sleep(3)
        
        self.print_test("Backend Startup", False, "Failed to start within timeout")
        return False
    
    def test_direct_backend(self):
        """Test direct backend connection"""
        self.print_header("DIRECT BACKEND TESTS")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.print_test("Backend Health", True, f"Status: {data.get('status')}")
                self.print_test("Model Loaded", data.get('model_loaded', False))
                return True
            else:
                self.print_test("Backend Health", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Backend Health", False, f"Error: {e}")
            return False
    
    def test_plant_detection(self):
        """Test plant detection functionality"""
        self.print_header("PLANT DETECTION TESTS")
        
        # Create test image
        img = Image.new('RGB', (400, 300), color='lightgreen')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple plant
        draw.rectangle([150, 200, 250, 280], fill='brown')  # Pot
        draw.rectangle([195, 100, 205, 200], fill='green')  # Stem
        draw.ellipse([175, 80, 225, 130], fill='darkgreen')  # Leaves
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Test through direct backend
        backend_success = False
        try:
            files = {'file': ('test_plant.png', img_bytes, 'image/png')}
            response = requests.post(f"{self.backend_url}/api/detect-plants", 
                                   files=files, timeout=15)
            if response.status_code == 200:
                data = response.json()
                plant_count = data.get('count', 0)
                self.print_test("Direct Backend Detection", True, f"Detected {plant_count} plants")
                backend_success = True
            else:
                self.print_test("Direct Backend Detection", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Direct Backend Detection", False, f"Error: {e}")
        
        # Test image quality analysis
        try:
            img_bytes.seek(0)
            files = {'file': ('test_plant.png', img_bytes, 'image/png')}
            response = requests.post(f"{self.backend_url}/api/analyze-image-quality", 
                                   files=files, timeout=10)
            if response.status_code == 200:
                data = response.json()
                quality = data.get('quality', {})
                score = quality.get('score', 0)
                self.print_test("Image Quality Analysis", True, f"Score: {score:.1f}/100")
            else:
                self.print_test("Image Quality Analysis", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Image Quality Analysis", False, f"Error: {e}")
        
        return backend_success
    
    def test_plant_database(self):
        """Test plant database endpoints"""
        self.print_header("PLANT DATABASE TESTS")
        
        try:
            response = requests.get(f"{self.backend_url}/api/plant-categories", timeout=5)
            if response.status_code == 200:
                data = response.json()
                categories = data.get('categories', {})
                plant_count = len(categories)
                self.print_test("Plant Database", True, f"{plant_count} plants available")
                
                # Show sample plants
                if plant_count > 0:
                    sample_plants = list(categories.keys())[:5]
                    self.print_test("Sample Plants", True, f"{', '.join(sample_plants)}")
                
                return True
            else:
                self.print_test("Plant Database", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Plant Database", False, f"Error: {e}")
            return False
    
    def run_complete_test(self):
        """Run all system tests"""
        print("🌱 Virtual Garden Complete System Test")
        print("Testing integrated frontend + backend + API system")
        
        results = {
            'frontend': self.test_frontend(),
            'backend_mgmt': self.test_backend_management(),
            'direct_backend': self.test_direct_backend(),
            'plant_detection': self.test_plant_detection(),
            'plant_database': self.test_plant_database()
        }
        
        # Summary
        self.print_header("TEST SUMMARY")
        
        total_tests = len(results)
        passed_tests = sum(results.values())
        
        for test_name, passed in results.items():
            status_text = "PASS" if passed else "FAIL"
            self.print_test(f"{test_name.replace('_', ' ').title()}", passed, status_text)
        
        print(f"\n📊 Overall Result: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED! Your Virtual Garden system is fully operational.")
            print("\n🌐 System URLs:")
            print(f"   Frontend: {self.frontend_url}")
            print(f"   Backend: {self.backend_url}")
            print(f"   API Docs: {self.backend_url}/docs")
            print("\n🧪 Ready to test:")
            print("   1. Upload a plant image in your browser")
            print("   2. Watch real AI detection with bounding boxes")
            print("   3. Add plants to your 3D garden")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            print("\n💡 Troubleshooting:")
            print("   1. Make sure frontend is running: npm run dev")
            print("   2. Start backend manually if needed")
            print("   3. Check browser console for errors")
        
        return passed_tests == total_tests

def main():
    tester = SystemTester()
    success = tester.run_complete_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
