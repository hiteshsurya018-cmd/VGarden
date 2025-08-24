# Plant Detection Backend

FastAPI backend for real-time plant detection using YOLOv5.

## Quick Start

1. **Setup Environment**
   ```bash
   cd ml-backend
   python setup.py
   ```

2. **Run Server**
   ```bash
   uvicorn main:app --reload
   ```

3. **Test API**
   - Health check: http://localhost:8000/health
   - API docs: http://localhost:8000/docs
   - Frontend integration: http://localhost:8000/api/detect-plants

## API Endpoints

### POST /api/detect-plants
Upload image for plant detection
- **Input**: multipart/form-data with image file
- **Output**: JSON with detected plants, bounding boxes, and properties

### GET /api/plant-categories  
Get available plant categories and medicinal properties

### POST /api/analyze-image-quality
Analyze uploaded image quality for optimal detection

## Model Information

- **Default**: YOLOv5s (general object detection)
- **Custom**: Place trained plant model as `models/best.pt`
- **Training**: Use Ultralytics YOLOv5 with plant datasets

## Plant Categories

Supports detection and classification of:
- **Herbs**: Basil, Mint, Rosemary, Sage, Thyme, Oregano
- **Medicinal**: Aloe, Chamomile, Echinacea, Turmeric, Ginger
- **Aromatic**: Lavender
- **Wildflowers**: Dandelion

Each plant includes:
- Scientific name
- Medicinal properties
- Category classification
- Confidence scoring

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test setup
python test_setup.py
```

## Production Deployment

1. **Environment Variables**
   ```bash
   export MODEL_PATH=models/best.pt
   export API_HOST=0.0.0.0
   export API_PORT=8000
   ```

2. **Docker (Optional)**
   ```dockerfile
   FROM python:3.9-slim
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

3. **CORS Configuration**
   Update `allow_origins` in main.py for production domains.
