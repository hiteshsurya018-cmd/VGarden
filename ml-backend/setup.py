#!/usr/bin/env python3
"""
Setup script for Plant Detection Backend
Run this to set up the environment and download models
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Error in {description}: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        return None

def main():
    print("🌱 Setting up Plant Detection Backend...")
    
    # Create models directory
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    print(f"📁 Created models directory: {models_dir}")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python version: {sys.version}")
    
    # Install dependencies
    print("📦 Installing dependencies...")
    pip_install = run_command("pip install -r requirements.txt", "Installing Python packages")
    if not pip_install:
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Download YOLOv5 model
    print("🤖 Downloading YOLOv5 model...")
    download_model = run_command(
        "python -c \"from ultralytics import YOLO; YOLO('yolov5s.pt')\"",
        "Downloading YOLOv5 model"
    )
    
    if download_model:
        print("✅ YOLOv5 model downloaded successfully")
    else:
        print("⚠️  Model download failed, but will download automatically on first run")
    
    # Create a simple test script
    test_script = '''
import torch
from ultralytics import YOLO
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
try:
    model = YOLO("yolov5s.pt")
    print("✅ YOLOv5 model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
'''
    
    with open("test_setup.py", "w") as f:
        f.write(test_script)
    
    print("\n🚀 Setup complete! You can now:")
    print("1. Run the server: uvicorn main:app --reload")
    print("2. Test setup: python test_setup.py")
    print("3. API docs: http://localhost:8000/docs")
    print("\n📝 Note: For better plant detection, place your custom trained model as 'models/best.pt'")

if __name__ == "__main__":
    main()
