# 🐛 Virtual Garden Debugging Guide

## Quick Fixes for Common Errors

### ❌ Error: "Failed to fetch" - Backend not available

**Symptoms:**
- TypeError: Failed to fetch at PlantDetectionAPI.checkHealth
- Plant detection falling back to mock data

**Solutions:**

1. **Start the Backend Server:**
```bash
cd ml-backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Check Backend Status:**
- Visit: http://localhost:8000/health
- Should return: `{"status": "healthy", "model_loaded": true}`

3. **Alternative Start:**
```bash
# Use the start script
chmod +x start-plant-detection.sh
./start-plant-detection.sh
```

### ❌ Error: React component import issues

**Symptoms:**
- "type is invalid -- expected a string or function but got: undefined"
- Component rendering errors

**Fixed Issues:**
✅ BoundingBoxOverlay import corrected
✅ CategoryIcon fallback added
✅ Safe array access implemented

### ❌ Error: "Cannot read properties of undefined (reading 'length')"

**Fixed Issues:**
✅ Added null checks for detectedPlants arrays
✅ Safe access for plant properties
✅ Fallback values for undefined arrays

## Current System Status

### ✅ Working Features
- **Frontend**: React app with 3D visualization
- **Backend API Integration**: Real YOLOv5 plant detection
- **Bounding Box Overlay**: Visual plant detection results
- **Fallback System**: Works when backend unavailable
- **Error Handling**: Graceful degradation

### 🔧 System Architecture

```
Frontend (React + Three.js)
    ↓ API calls
Backend (FastAPI + YOLOv5)
    ↓ Plant detection
Database (In-memory plant data)
```

## Debugging Steps

### 1. Check Frontend
```bash
# From project root
npm run dev
# Should start on http://localhost:5173
```

### 2. Check Backend
```bash
cd ml-backend
uvicorn main:app --reload
# Should start on http://localhost:8000
```

### 3. Test API Connection
```bash
curl http://localhost:8000/health
# Should return health status
```

### 4. Upload Test Image
1. Open frontend: http://localhost:5173
2. Upload any plant image
3. Check browser console for errors
4. Verify bounding boxes appear on image

## Common Issues & Solutions

### Backend Issues

**Port 8000 in use:**
```bash
lsof -ti:8000 | xargs kill -9
```

**Python dependencies:**
```bash
pip install --upgrade -r requirements.txt
```

**CORS errors:**
- Backend automatically allows all origins in development
- Check browser network tab for actual error

### Frontend Issues

**Module not found:**
```bash
npm install
npm run dev
```

**TypeScript errors:**
```bash
npm run typecheck
```

**Build issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### 1. Start Both Services
```bash
# Terminal 1 - Backend
cd ml-backend && uvicorn main:app --reload

# Terminal 2 - Frontend  
npm run dev
```

### 2. Test Plant Detection
1. Upload clear plant image
2. Check browser console for API calls
3. Verify detection results
4. Look for bounding boxes on image

### 3. Debug API Issues
```bash
# Check backend logs
cd ml-backend
tail -f uvicorn.log

# Test API directly
curl -X POST http://localhost:8000/api/detect-plants \
  -F "file=@test_plant.jpg"
```

## Performance Tips

### Backend Optimization
- Use GPU if available: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118`
- Smaller models: Change to `yolov5n.pt` for speed
- Image preprocessing: Resize large images

### Frontend Optimization
- Disable dev tools in production
- Use React.memo for expensive components
- Lazy load 3D components

## Error Monitoring

### Browser Console
```javascript
// Check API status
PlantDetectionAPI.checkHealth().then(console.log)

// Test plant detection
const input = document.querySelector('input[type="file"]')
input.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const result = await PlantDetectionAPI.detectPlants(file)
  console.log('Detection result:', result)
})
```

### Backend Logs
```bash
# See uvicorn logs
cd ml-backend
uvicorn main:app --reload --log-level debug
```

## API Documentation

### Available Endpoints
- `GET /health` - Backend health check
- `POST /api/detect-plants` - Upload image for detection
- `POST /api/analyze-image-quality` - Image quality analysis
- `GET /api/plant-categories` - Available plant types
- `GET /docs` - Interactive API documentation

### Example API Call
```javascript
const formData = new FormData()
formData.append('file', imageFile)

fetch('http://localhost:8000/api/detect-plants', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data))
```

## Production Deployment

### Environment Variables
```bash
# Backend
export MODEL_PATH=models/best.pt
export API_HOST=0.0.0.0
export API_PORT=8000

# Frontend
export VITE_API_URL=https://your-backend.com
```

### Build Commands
```bash
# Frontend
npm run build

# Backend  
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

🌱 **Happy Plant Detection!** 

For additional help, check the main documentation in `PLANT_DETECTION_SETUP.md`.
