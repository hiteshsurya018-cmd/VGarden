# 🤖 YOLOv5 Model Testing Guide

Your Virtual Garden backend is ready with YOLOv5 integration! Here's how to test the AI model:

## 🚀 Quick Backend Start

```bash
# Open terminal in your project directory
cd ml-backend

# Setup environment (first time only)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🧪 Test Scripts Available

1. **Quick Status Check**
   ```bash
   python check_backend.py
   ```

2. **Full YOLOv5 Test Suite**
   ```bash
   python test_yolov5_model.py
   ```

3. **Complete Backend Test**
   ```bash
   python test_backend.py
   ```

## 🔍 What Each Test Does

### Backend Status Check
- ✅ Verifies backend connection
- ✅ Confirms YOLOv5 model is loaded
- ✅ Lists available plant categories
- ✅ Shows API endpoints status

### YOLOv5 Model Test
- 🤖 Tests YOLOv5 model loading
- 🖼️ Creates synthetic plant image
- 🔬 Runs detection on test image
- 📊 Shows confidence scores and bounding boxes
- 🌿 Tests with real plant images (if available)

### Complete Backend Test
- 🌐 Tests all API endpoints
- 📈 Image quality analysis
- 🎯 Plant detection accuracy
- 📋 Medicinal plant database

## 🎯 Expected YOLOv5 Results

When working correctly, you should see:

```json
{
  "success": true,
  "plants": [
    {
      "label": "aloe",
      "confidence": 0.856,
      "bbox": {
        "x1": 120.5,
        "y1": 80.2,
        "x2": 280.1,
        "y2": 240.8
      },
      "category": "medicinal",
      "scientific_name": "Aloe barbadensis",
      "properties": ["healing", "anti-inflammatory"]
    }
  ],
  "count": 1,
  "message": "Detected 1 plant(s)"
}
```

## 🌐 Testing in Frontend

1. **Start Backend** (follow steps above)
2. **Open Virtual Garden** (already running)
3. **Upload Plant Image**
4. **Watch Real AI Detection**:
   - Bounding boxes appear around detected plants
   - Confidence scores show AI certainty
   - Scientific names and properties display
   - Plants can be added to 3D garden

## 🐛 Common Issues & Solutions

### "Backend not running"
```bash
cd ml-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### "Model loading failed"
```bash
pip install --upgrade ultralytics torch
python -c "from ultralytics import YOLO; YOLO('yolov5s.pt')"
```

### "CUDA errors" (GPU issues)
The system works fine with CPU-only inference.

### "Port 8000 in use"
```bash
pkill -f "uvicorn main:app"
```

## 📊 YOLOv5 Model Details

- **Model**: YOLOv5s (small, fast, accurate)
- **Classes**: 80 objects (person, car, plant, etc.)
- **Plant Detection**: Enhanced with custom plant mapping
- **Confidence Threshold**: 0.25 (adjustable)
- **Input Size**: 640x640 (auto-resized)

## 🔬 Advanced Testing

### Test Specific Plant Types
```bash
# Place test images in project directory
# Run: python test_yolov5_model.py
# Will automatically test with available images
```

### Custom Model Training
```bash
# To use your own trained plant model:
# 1. Place model as: ml-backend/models/best.pt
# 2. Restart backend
# 3. Model will automatically load
```

## ✅ Success Indicators

- Backend health check returns `"model_loaded": true`
- Detection API returns confidence scores > 0.3
- Bounding boxes appear around detected objects
- Scientific plant names are returned
- Frontend shows "Backend connected" in console

---

**Ready to test?** Start the backend and run `python test_yolov5_model.py` for a complete AI model verification! 🌿🤖
