#!/usr/bin/env python3
"""
Launch script for Virtual Garden Plant Detection Backend
Run this to start the FastAPI server with proper configuration
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def main():
    print("🌱 Virtual Garden - Starting Plant Detection Backend")
    print("=" * 55)
    
    # Change to backend directory
    backend_dir = Path("ml-backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        print("   Make sure you're running this from the project root.")
        return 1
    
    os.chdir(backend_dir)
    
    # Check if we're in a virtual environment
    in_venv = sys.prefix != sys.base_prefix
    
    if not in_venv:
        print("⚠️  Not in virtual environment!")
        print("   Recommended: Create and activate a virtual environment first")
        print("   python3 -m venv venv && source venv/bin/activate")
        print("")
    
    # Install dependencies
    print("📦 Installing required packages...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return 1
    
    # Download YOLOv5 model
    print("🤖 Preparing YOLOv5 model...")
    try:
        subprocess.run([sys.executable, "-c", 
                       "from ultralytics import YOLO; YOLO('yolov5s.pt')"], 
                      check=True, capture_output=True)
        print("✅ YOLOv5 model ready")
    except subprocess.CalledProcessError:
        print("⚠️  Model will download on first API call")
    
    # Start the server
    print("\n🚀 Starting FastAPI server...")
    print("   Backend: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs") 
    print("   Health Check: http://localhost:8000/health")
    print("\n   Press Ctrl+C to stop the server")
    print("=" * 55)
    
    try:
        # Start uvicorn server
        os.system("uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        return 0

if __name__ == "__main__":
    sys.exit(main())
