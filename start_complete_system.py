#!/usr/bin/env python3
"""
Complete Virtual Garden System Startup Script
Sets up backend, installs dependencies, and starts full system
"""

import os
import sys
import subprocess
import time
import requests
import threading
from pathlib import Path

class VirtualGardenSetup:
    def __init__(self):
        self.project_root = Path.cwd()
        self.backend_dir = self.project_root / "ml-backend"
        self.venv_dir = self.backend_dir / "venv"
        self.backend_process = None
        
    def print_step(self, step, message):
        print(f"\n{'='*50}")
        print(f"STEP {step}: {message}")
        print(f"{'='*50}")
    
    def print_success(self, message):
        print(f"✅ {message}")
    
    def print_error(self, message):
        print(f"❌ {message}")
    
    def print_info(self, message):
        print(f"🔧 {message}")
    
    def check_prerequisites(self):
        """Check if required tools are available"""
        self.print_step(1, "Checking Prerequisites")
        
        # Check Python
        try:
            python_version = sys.version_info
            if python_version >= (3, 8):
                self.print_success(f"Python {python_version.major}.{python_version.minor}.{python_version.micro}")
            else:
                self.print_error("Python 3.8+ required")
                return False
        except:
            self.print_error("Python not found")
            return False
        
        # Check if backend directory exists
        if self.backend_dir.exists():
            self.print_success("Backend directory found")
        else:
            self.print_error("Backend directory not found")
            return False
        
        # Check pip
        try:
            subprocess.run([sys.executable, "-m", "pip", "--version"], 
                         check=True, capture_output=True)
            self.print_success("pip is available")
        except:
            self.print_error("pip not available")
            return False
        
        return True
    
    def setup_virtual_environment(self):
        """Create and setup virtual environment"""
        self.print_step(2, "Setting up Virtual Environment")
        
        os.chdir(self.backend_dir)
        
        # Create virtual environment if it doesn't exist
        if not self.venv_dir.exists():
            self.print_info("Creating virtual environment...")
            try:
                subprocess.run([sys.executable, "-m", "venv", "venv"], 
                             check=True, capture_output=True)
                self.print_success("Virtual environment created")
            except subprocess.CalledProcessError as e:
                self.print_error(f"Failed to create virtual environment: {e}")
                return False
        else:
            self.print_success("Virtual environment already exists")
        
        return True
    
    def install_dependencies(self):
        """Install Python dependencies"""
        self.print_step(3, "Installing Dependencies")
        
        # Get Python executable from virtual environment
        if os.name == 'nt':  # Windows
            python_exe = self.venv_dir / "Scripts" / "python.exe"
            pip_exe = self.venv_dir / "Scripts" / "pip.exe"
        else:  # Unix/Linux/macOS
            python_exe = self.venv_dir / "bin" / "python"
            pip_exe = self.venv_dir / "bin" / "pip"
        
        if not python_exe.exists():
            # Fallback to system Python
            python_exe = sys.executable
            pip_exe = sys.executable
            pip_args = ["-m", "pip"]
        else:
            pip_args = []
        
        self.print_info("Installing requirements...")
        try:
            if pip_args:
                cmd = [str(pip_exe)] + pip_args + ["install", "-r", "requirements.txt"]
            else:
                cmd = [str(pip_exe), "install", "-r", "requirements.txt"]
            
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            self.print_success("Dependencies installed successfully")
            
            # Try to download YOLOv5 model
            self.print_info("Downloading YOLOv5 model...")
            try:
                if pip_args:
                    model_cmd = [str(python_exe)] + ["-c", "from ultralytics import YOLO; YOLO('yolov5s.pt')"]
                else:
                    model_cmd = [str(python_exe), "-c", "from ultralytics import YOLO; YOLO('yolov5s.pt')"]
                
                subprocess.run(model_cmd, check=True, capture_output=True, timeout=60)
                self.print_success("YOLOv5 model ready")
            except subprocess.TimeoutExpired:
                self.print_info("Model download taking longer, will complete on first run")
            except Exception:
                self.print_info("Model will download automatically on first API call")
            
            return True
            
        except subprocess.CalledProcessError as e:
            self.print_error(f"Failed to install dependencies: {e}")
            if e.stderr:
                print(f"Error details: {e.stderr}")
            return False
    
    def start_backend_server(self):
        """Start the FastAPI backend server"""
        self.print_step(4, "Starting Backend Server")
        
        # Get Python executable from virtual environment
        if os.name == 'nt':  # Windows
            python_exe = self.venv_dir / "Scripts" / "python.exe"
        else:  # Unix/Linux/macOS
            python_exe = self.venv_dir / "bin" / "python"
        
        if not python_exe.exists():
            python_exe = sys.executable
        
        self.print_info("Starting FastAPI server on port 8000...")
        
        try:
            # Start uvicorn server
            cmd = [
                str(python_exe), "-m", "uvicorn", 
                "main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000", 
                "--reload"
            ]
            
            self.backend_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Wait a moment for server to start
            time.sleep(3)
            
            # Check if process is still running
            if self.backend_process.poll() is None:
                self.print_success("Backend server started successfully")
                return True
            else:
                self.print_error("Backend server failed to start")
                return False
                
        except Exception as e:
            self.print_error(f"Failed to start backend: {e}")
            return False
    
    def test_backend_health(self):
        """Test backend health and API endpoints"""
        self.print_step(5, "Testing Backend Health")
        
        # Wait for server to be ready
        max_retries = 10
        for attempt in range(max_retries):
            try:
                response = requests.get("http://localhost:8000/health", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    self.print_success("Backend health check passed")
                    self.print_info(f"Status: {data.get('status')}")
                    self.print_info(f"Model loaded: {data.get('model_loaded')}")
                    
                    # Test plant categories endpoint
                    try:
                        cat_response = requests.get("http://localhost:8000/api/plant-categories", timeout=5)
                        if cat_response.status_code == 200:
                            cat_data = cat_response.json()
                            categories = cat_data.get('categories', {})
                            self.print_success(f"Plant database loaded: {len(categories)} plants available")
                        
                    except Exception:
                        self.print_info("Plant categories endpoint not fully ready yet")
                    
                    return True
                    
            except requests.exceptions.ConnectionError:
                if attempt < max_retries - 1:
                    self.print_info(f"Waiting for backend to start... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(2)
                else:
                    self.print_error("Backend failed to respond after multiple attempts")
                    return False
            except Exception as e:
                self.print_error(f"Health check failed: {e}")
                return False
        
        return False
    
    def show_system_status(self):
        """Show final system status and URLs"""
        self.print_step(6, "System Status")
        
        print("🌱 Virtual Garden System is now running!")
        print()
        print("🌐 Frontend: Already running in your browser")
        print("🔌 Backend API: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("❤️  Health Check: http://localhost:8000/health")
        print()
        print("🔍 Plant Detection Features:")
        print("   • Real YOLOv5 AI plant detection")
        print("   • Bounding box visualization")
        print("   • Confidence scoring")
        print("   • Medicinal properties database")
        print("   • 3D garden visualization")
        print()
        print("🧪 Test Instructions:")
        print("   1. Upload a plant image in your frontend")
        print("   2. Watch real AI detection with bounding boxes")
        print("   3. Add detected plants to your 3D garden")
        print("   4. Explore plant properties and categories")
        print()
        print("💡 Tips for best results:")
        print("   • Use clear, well-lit plant images")
        print("   • Ensure plants are the main subject")
        print("   • Try different plant types (herbs, flowers, etc.)")
        
    def monitor_backend(self):
        """Monitor backend output in a separate thread"""
        if self.backend_process:
            def read_output():
                for line in iter(self.backend_process.stdout.readline, ''):
                    if line:
                        print(f"[BACKEND] {line.rstrip()}")
            
            monitor_thread = threading.Thread(target=read_output, daemon=True)
            monitor_thread.start()
    
    def cleanup(self):
        """Clean up processes"""
        if self.backend_process:
            self.print_info("Stopping backend server...")
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
    
    def run_complete_setup(self):
        """Run the complete system setup"""
        try:
            print("🌱 Virtual Garden Complete System Setup")
            print("🚀 Setting up backend with YOLOv5 AI plant detection")
            
            # Step 1: Prerequisites
            if not self.check_prerequisites():
                return False
            
            # Step 2: Virtual Environment
            if not self.setup_virtual_environment():
                return False
            
            # Step 3: Dependencies
            if not self.install_dependencies():
                return False
            
            # Step 4: Start Backend
            if not self.start_backend_server():
                return False
            
            # Step 5: Test Health
            if not self.test_backend_health():
                return False
            
            # Step 6: Show Status
            self.show_system_status()
            
            # Start monitoring
            self.monitor_backend()
            
            # Keep running
            print("\n🎯 System is ready! Press Ctrl+C to stop all services")
            
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n🛑 Shutting down system...")
                self.cleanup()
                print("✅ System stopped")
            
            return True
            
        except Exception as e:
            self.print_error(f"Setup failed: {e}")
            self.cleanup()
            return False

def main():
    setup = VirtualGardenSetup()
    success = setup.run_complete_setup()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
