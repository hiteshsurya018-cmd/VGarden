import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeGardenImage } from '../services/aiService.js';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload and analyze garden image
router.post('/analyze-garden', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Create analysis record
    const analysis = await req.prisma.aIAnalysis.create({
      data: {
        imageUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        imageMetadata: {
          size: req.file.size,
          mimetype: req.file.mimetype,
          originalname: req.file.originalname
        },
        status: 'processing'
      }
    });

    // Start AI analysis (async)
    analyzeGardenImage(req.file.buffer, analysis.id, req.prisma)
      .catch(error => {
        console.error('AI analysis failed:', error);
        // Update analysis status to failed
        req.prisma.aIAnalysis.update({
          where: { id: analysis.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date()
          }
        }).catch(console.error);
      });

    res.json({
      message: 'Image uploaded successfully, analysis in progress',
      analysisId: analysis.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Garden analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze garden image' });
  }
});

// Get analysis status and results
router.get('/analysis/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await req.prisma.aIAnalysis.findUnique({
      where: { id }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      id: analysis.id,
      status: analysis.status,
      confidence: analysis.confidence,
      gardenLayout: analysis.gardenLayout,
      processingTime: analysis.processingTime,
      errorMessage: analysis.errorMessage,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
});

// Plant identification endpoint
router.post('/identify-plant', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // This would integrate with PlantNet API
    // For now, return mock data
    const mockResults = [
      {
        species: "Rosa damascena",
        commonName: "Damask Rose",
        confidence: 0.92,
        family: "Rosaceae",
        properties: ["ornamental", "aromatic", "medicinal"]
      },
      {
        species: "Lavandula angustifolia",
        commonName: "English Lavender", 
        confidence: 0.78,
        family: "Lamiaceae",
        properties: ["aromatic", "medicinal", "culinary"]
      }
    ];

    res.json({
      success: true,
      results: mockResults,
      processingTime: 1200
    });
  } catch (error) {
    console.error('Plant identification error:', error);
    res.status(500).json({ error: 'Failed to identify plant' });
  }
});

// Object detection endpoint (YOLOv8)
router.post('/detect-objects', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Mock YOLOv8 detection results
    const mockDetections = [
      {
        class: "plant",
        confidence: 0.94,
        bbox: { x: 120, y: 80, width: 150, height: 200 }
      },
      {
        class: "pot",
        confidence: 0.87,
        bbox: { x: 100, y: 250, width: 180, height: 100 }
      },
      {
        class: "plant",
        confidence: 0.76,
        bbox: { x: 350, y: 120, width: 120, height: 180 }
      }
    ];

    res.json({
      success: true,
      detections: mockDetections,
      imageSize: { width: 600, height: 400 },
      processingTime: 850
    });
  } catch (error) {
    console.error('Object detection error:', error);
    res.status(500).json({ error: 'Failed to detect objects' });
  }
});

// Spatial segmentation endpoint (SAM)
router.post('/segment-layout', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Mock SAM segmentation results
    const mockSegments = [
      {
        id: "garden_bed_1",
        type: "planting_area",
        confidence: 0.89,
        polygon: [
          [50, 100], [250, 100], [250, 300], [50, 300]
        ]
      },
      {
        id: "pathway",
        type: "path",
        confidence: 0.92,
        polygon: [
          [250, 80], [400, 80], [400, 120], [250, 120]
        ]
      },
      {
        id: "garden_bed_2", 
        type: "planting_area",
        confidence: 0.85,
        polygon: [
          [300, 150], [500, 150], [500, 350], [300, 350]
        ]
      }
    ];

    res.json({
      success: true,
      segments: mockSegments,
      imageSize: { width: 600, height: 400 },
      processingTime: 2100
    });
  } catch (error) {
    console.error('Segmentation error:', error);
    res.status(500).json({ error: 'Failed to segment layout' });
  }
});

export default router;
