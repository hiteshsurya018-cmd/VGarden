# 🌱 Virtual Garden with Real Plant Detection

A complete plant detection system with YOLOv5 backend and interactive 3D frontend.

## 🚀 Quick Start

### 1. Backend Setup (Python FastAPI + YOLOv5)

```bash
# Navigate to backend
cd ml-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run setup script
python setup.py

# Start backend server
uvicorn main:app --reload
```

### 2. Frontend Setup (React + Three.js)

```bash
# Install frontend dependencies (from project root)
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Backend Features

### Real Plant Detection API

- **YOLOv5 Integration**: Professional plant detection using ultralytics/yolov5
- **Custom Model Support**: Place trained model as `ml-backend/models/best.pt`
- **Image Quality Analysis**: Automatic assessment of uploaded images
- **Bounding Box Detection**: Precise plant location identification
- **Medicinal Properties**: Comprehensive plant information database

### API Endpoints

```bash
POST /api/detect-plants     # Upload image for plant detection
GET  /api/plant-categories  # Get available plant categories
POST /api/analyze-image-quality  # Analyze image quality
GET  /health               # Backend health check
```

### Example API Usage

```python
import requests

# Upload image for detection
files = {'file': open('plant_image.jpg', 'rb')}
response = requests.post('http://localhost:8000/api/detect-plants', files=files)
result = response.json()

print(f"Detected {result['count']} plants:")
for plant in result['plants']:
    print(f"- {plant['label']} ({plant['confidence']:.2%} confidence)")
```

## 🎨 Frontend Features

### Real-Time Plant Detection

- **Drag & Drop Upload**: Easy image uploading with progress tracking
- **Bounding Box Overlay**: Visual plant detection results
- **Confidence Visualization**: Color-coded confidence indicators
- **Plant Detail Modals**: Comprehensive plant information

### 3D Garden Designer

- **Interactive 3D Environment**: Built with Three.js and React Three Fiber
- **Plant Placement**: Add detected plants to virtual garden
- **Garden Templates**: Pre-designed healing garden layouts
- **Export/Import**: Save and share garden designs

### Advanced Features

- **Multi-Image Support**: Process multiple plant images
- **Real-Time Analysis**: Live backend integration
- **Fallback Detection**: Browser-based backup when backend unavailable
- **Dark Mode**: Full dark/light theme support

## 🔬 Plant Detection Technology

### Computer Vision Pipeline

1. **Image Upload**: Secure multipart file upload
2. **Quality Analysis**: Brightness, contrast, and sharpness assessment
3. **YOLOv5 Detection**: Object detection and classification
4. **Plant Classification**: Species identification with confidence scoring
5. **Medicinal Mapping**: Properties and usage information

### Supported Plants

- **Herbs**: Basil, Mint, Rosemary, Sage, Thyme, Oregano
- **Medicinal**: Aloe, Chamomile, Echinacea, Turmeric, Ginger
- **Flowering**: Lavender, Rose, Sunflower, Hibiscus
- **And many more...**

## 🛠️ Development

### Backend Development

```bash
cd ml-backend

# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test setup
python test_setup.py
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Custom Model Training

To use your own trained YOLOv5 model:

1. Train YOLOv5 on plant datasets
2. Export model as `best.pt`
3. Place in `ml-backend/models/best.pt`
4. Restart backend server

## 📦 Deployment

### Backend Deployment

```dockerfile
# Dockerfile for backend
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to your hosting provider
```

## 🚨 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Kill existing process
pkill -f "uvicorn main:app"
```

**Model loading errors:**
```bash
# Download YOLOv5 model manually
python -c "from ultralytics import YOLO; YOLO('yolov5s.pt')"
```

**Python dependencies:**
```bash
# Reinstall with specific versions
pip install torch==2.1.0 torchvision==0.16.0
```

### Frontend Issues

**Backend connection errors:**
- Ensure backend is running on port 8000
- Check CORS configuration in `main.py`
- Verify API endpoint URLs in `PlantDetectionAPI.ts`

**Image upload failures:**
- Check file size limits (10MB max)
- Verify supported formats (JPG, PNG, WebP)
- Ensure backend `/api/detect-plants` endpoint is accessible

## 🎯 Performance Tips

### For Better Detection

- **Image Quality**: Use high-resolution images (800x600+)
- **Lighting**: Ensure good, natural lighting
- **Focus**: Keep plants in sharp focus
- **Composition**: Include leaves, flowers, and stems when possible

### Backend Optimization

- **GPU Support**: Use CUDA-enabled PyTorch for faster inference
- **Model Optimization**: Use smaller YOLOv5 variants (yolov5n, yolov5s) for speed
- **Caching**: Implement Redis for frequently detected plants

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **YOLOv5**: Ultralytics for the object detection framework
- **Three.js**: Amazing 3D graphics library
- **FastAPI**: Fast, modern Python web framework
- **React**: Powerful frontend library

---

Happy Plant Detection! 🌿🔬
