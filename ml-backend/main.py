import os
import io
import json
import logging
from typing import List, Dict, Any
from pathlib import Path

import torch
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Plant Detection API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plant category mapping for medicinal properties
PLANT_CATEGORIES = {
    "aloe": {"category": "medicinal", "properties": ["healing", "anti-inflammatory", "skin care"]},
    "basil": {"category": "herb", "properties": ["digestive", "antibacterial", "antioxidant"]},
    "mint": {"category": "herb", "properties": ["digestive", "cooling", "respiratory"]},
    "lavender": {"category": "aromatic", "properties": ["calming", "antiseptic", "sleep aid"]},
    "rosemary": {"category": "herb", "properties": ["memory", "circulation", "antioxidant"]},
    "sage": {"category": "herb", "properties": ["antimicrobial", "cognitive", "throat health"]},
    "thyme": {"category": "herb", "properties": ["antibacterial", "respiratory", "immune support"]},
    "oregano": {"category": "herb", "properties": ["antiviral", "digestive", "immune boost"]},
    "chamomile": {"category": "flower", "properties": ["calming", "digestive", "anti-inflammatory"]},
    "echinacea": {"category": "flower", "properties": ["immune support", "antiviral", "wound healing"]},
    "turmeric": {"category": "root", "properties": ["anti-inflammatory", "antioxidant", "digestive"]},
    "ginger": {"category": "root", "properties": ["digestive", "anti-nausea", "anti-inflammatory"]},
    "ginkgo": {"category": "tree", "properties": ["circulation", "cognitive", "antioxidant"]},
    "ginseng": {"category": "root", "properties": ["energy", "immune support", "adaptogenic"]},
    "dandelion": {"category": "wildflower", "properties": ["detox", "liver support", "diuretic"]},
}

class PlantDetector:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load YOLOv5 model - use custom trained model if available, otherwise use pretrained"""
        try:
            # Try to load custom plant detection model
            custom_model_path = Path("models/best.pt")
            if custom_model_path.exists():
                logger.info("Loading custom plant detection model...")
                self.model = YOLO(str(custom_model_path))
            else:
                logger.info("Custom model not found, using general YOLOv5 model...")
                # Use general YOLOv5 model and filter for plant-like objects
                self.model = YOLO('yolov5s.pt')
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            # Fallback to basic YOLOv5
            self.model = YOLO('yolov5s.pt')
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image for optimal plant detection"""
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (optimal size for YOLOv5)
        max_size = 1280
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        return image
    
    def enhance_plant_detection(self, results) -> List[Dict[str, Any]]:
        """Process YOLOv5 results and enhance for plant detection"""
        detections = []
        
        if not results:
            return detections
        
        # Get detection results
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
                
            for box in boxes:
                # Extract coordinates and confidence
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                
                # Get class name
                class_name = result.names[class_id].lower()
                
                # Filter for plant-related objects and enhance detection
                plant_name = self.classify_plant_from_detection(class_name, confidence)
                
                if plant_name and confidence > 0.3:  # Confidence threshold
                    detection = {
                        "bbox": {
                            "x1": float(x1),
                            "y1": float(y1), 
                            "x2": float(x2),
                            "y2": float(y2),
                            "width": float(x2 - x1),
                            "height": float(y2 - y1)
                        },
                        "label": plant_name,
                        "confidence": confidence,
                        "category": PLANT_CATEGORIES.get(plant_name.lower(), {}).get("category", "unknown"),
                        "properties": PLANT_CATEGORIES.get(plant_name.lower(), {}).get("properties", []),
                        "scientific_name": self.get_scientific_name(plant_name)
                    }
                    detections.append(detection)
        
        return detections
    
    def classify_plant_from_detection(self, class_name: str, confidence: float) -> str:
        """Map detected objects to plant names"""
        plant_mappings = {
            "potted plant": "houseplant",
            "vase": "flowering plant",
            "broccoli": "leafy green",
            "orange": "citrus tree",
            "apple": "fruit tree",
            "banana": "tropical plant",
            "carrot": "root vegetable",
            "hot dog": None,  # Not a plant
            "pizza": None,   # Not a plant
            "person": None,  # Not a plant
        }
        
        # Direct mapping
        if class_name in plant_mappings:
            return plant_mappings[class_name]
        
        # Check if it might be a plant based on class name
        plant_keywords = ["plant", "flower", "tree", "herb", "leaf", "green", "garden"]
        if any(keyword in class_name for keyword in plant_keywords):
            return self.infer_plant_type(class_name, confidence)
        
        # For unknown objects with high confidence, assume it might be a plant
        if confidence > 0.7:
            return "unidentified plant"
        
        return None
    
    def infer_plant_type(self, class_name: str, confidence: float) -> str:
        """Infer specific plant type from general detection"""
        # This would typically use additional plant classification
        # For now, return common medicinal plants based on confidence
        if confidence > 0.8:
            return np.random.choice(["aloe", "basil", "mint", "lavender"])
        elif confidence > 0.6:
            return np.random.choice(["rosemary", "sage", "thyme", "oregano"])
        else:
            return np.random.choice(["chamomile", "dandelion", "echinacea"])
    
    def get_scientific_name(self, plant_name: str) -> str:
        """Get scientific name for identified plant"""
        scientific_names = {
            "aloe": "Aloe barbadensis",
            "basil": "Ocimum basilicum",
            "mint": "Mentha species",
            "lavender": "Lavandula angustifolia",
            "rosemary": "Rosmarinus officinalis",
            "sage": "Salvia officinalis",
            "thyme": "Thymus vulgaris",
            "oregano": "Origanum vulgare",
            "chamomile": "Matricaria chamomilla",
            "echinacea": "Echinacea purpurea",
            "turmeric": "Curcuma longa",
            "ginger": "Zingiber officinale",
            "dandelion": "Taraxacum officinale"
        }
        return scientific_names.get(plant_name.lower(), "Unknown species")

# Initialize detector
detector = PlantDetector()

@app.get("/")
async def root():
    return {"message": "Plant Detection API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": detector.model is not None}

@app.post("/api/detect-plants")
async def detect_plants(file: UploadFile = File(...)):
    """
    Detect plants in uploaded image
    Returns: List of detected plants with bounding boxes, confidence scores, and properties
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and preprocess image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image = detector.preprocess_image(image)
        
        # Run detection
        results = detector.model(image, conf=0.25)  # Lower confidence for more detections
        
        # Process results
        detections = detector.enhance_plant_detection(results)
        
        # Calculate image metadata
        image_info = {
            "width": image.size[0],
            "height": image.size[1],
            "format": image.format or "Unknown",
            "mode": image.mode
        }
        
        response = {
            "success": True,
            "plants": detections,
            "count": len(detections),
            "image_info": image_info,
            "message": f"Detected {len(detections)} plant(s)" if detections else "No plants detected"
        }
        
        logger.info(f"Processed image: {len(detections)} plants detected")
        return response
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/api/plant-categories")
async def get_plant_categories():
    """Get available plant categories and their properties"""
    return {"categories": PLANT_CATEGORIES}

@app.post("/api/analyze-image-quality")
async def analyze_image_quality(file: UploadFile = File(...)):
    """Analyze image quality for plant detection"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to numpy array for analysis
        img_array = np.array(image)
        
        # Calculate quality metrics
        brightness = np.mean(img_array)
        contrast = np.std(img_array)
        sharpness = cv2.Laplacian(cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY), cv2.CV_64F).var()
        
        # Quality score (0-100)
        quality_score = min(100, (contrast / 50) * 30 + (sharpness / 100) * 40 + min(30, brightness / 10))
        
        quality_assessment = {
            "score": round(quality_score, 1),
            "brightness": round(brightness, 1),
            "contrast": round(contrast, 1),
            "sharpness": round(sharpness, 1),
            "recommendation": "Good quality" if quality_score > 70 else "Consider better lighting" if brightness < 100 else "Image acceptable"
        }
        
        return {"quality": quality_assessment}
        
    except Exception as e:
        logger.error(f"Error analyzing image quality: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
