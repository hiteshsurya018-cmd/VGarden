/**
 * Unified Garden Analysis Component
 * Single upload interface that performs both spatial analysis and plant recognition
 */

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Upload,
  Camera,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Zap,
  Clock,
  Target,
  Lightbulb,
  MapPin,
  Ruler,
  TreePine,
  Home,
  FileImage,
  Loader2,
  Leaf,
  Search,
  Brain,
  Settings,
  Info,
} from "lucide-react";
import {
  GardenLayout,
  AnalysisResult,
  gardenSpatialAnalysis,
} from "../services/GardenSpatialAnalysis";
import { PlantDetectionAPI } from "../services/PlantDetectionAPI";
import GardenSpaceRecreation from "./GardenSpaceRecreation";
import { BoundingBoxOverlay } from "./BoundingBoxOverlay";

interface DetectedPlant {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  category: string;
  bbox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  properties?: string[];
}

interface UnifiedAnalysisProps {
  onAnalysisComplete?: (result: {
    gardenLayout: GardenLayout;
    detectedPlants: DetectedPlant[];
    spatialResult: AnalysisResult;
  }) => void;
  onPlantsDetected?: (plants: DetectedPlant[]) => void;
  className?: string;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  analysisStatus: "pending" | "analyzing" | "completed" | "error";
  analysisProgress: number;
  spatialResult?: AnalysisResult;
  detectedPlants?: DetectedPlant[];
  plantAnalysisComplete: boolean;
  spatialAnalysisComplete: boolean;
}

export const UnifiedGardenAnalysis: React.FC<UnifiedAnalysisProps> = ({
  onAnalysisComplete,
  onPlantsDetected,
  className = "",
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState<
    "upload" | "analyzing" | "results" | "recreation"
  >("upload");
  const [selectedResult, setSelectedResult] = useState<{
    gardenLayout: GardenLayout;
    detectedPlants: DetectedPlant[];
    spatialResult: AnalysisResult;
  } | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const plantDetectionAPI = new PlantDetectionAPI();

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      const file = files[0]; // Single file upload
      const imageId = Math.random().toString(36).substr(2, 9);
      const newImage: UploadedImage = {
        id: imageId,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        analysisStatus: "pending",
        analysisProgress: 0,
        plantAnalysisComplete: false,
        spatialAnalysisComplete: false,
      };

      setUploadedImages([newImage]); // Replace any existing image
      setSelectedImageId(imageId);
      setCurrentAnalysisStep("analyzing");
      setIsAnalyzing(true);

      try {
        // Start both analyses in parallel
        const progressInterval = setInterval(() => {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === imageId && img.analysisProgress < 90
                ? {
                    ...img,
                    analysisProgress: img.analysisProgress + 2,
                    analysisStatus: "analyzing",
                  }
                : img,
            ),
          );
        }, 150);

        // Perform both analyses simultaneously
        const [spatialResult, plantResult] = await Promise.all([
          gardenSpatialAnalysis.analyzeGardenLayout(file),
          plantDetectionAPI.detectPlantsWithQualityCheck(file),
        ]);

        clearInterval(progressInterval);

        // Convert detected plants to our format
        const detectedPlants: DetectedPlant[] = plantResult.plants.map(
          (plant, index) => ({
            id: `plant_${Date.now()}_${index}`,
            name: plant.label?.charAt(0).toUpperCase() + plant.label?.slice(1) || "Unknown Plant",
            scientificName: plant.scientific_name || "Species unknown",
            confidence: plant.confidence || 0,
            category: plant.category || "unknown",
            bbox: plant.bbox,
            properties: plant.properties || [],
          }),
        );

        // Update image with both results
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  analysisProgress: 100,
                  analysisStatus: spatialResult.success ? "completed" : "error",
                  spatialResult,
                  detectedPlants,
                  plantAnalysisComplete: true,
                  spatialAnalysisComplete: spatialResult.success,
                }
              : img,
          ),
        );

        if (spatialResult.success) {
          const combinedResult = {
            gardenLayout: spatialResult.layout,
            detectedPlants,
            spatialResult,
          };

          setSelectedResult(combinedResult);
          setCurrentAnalysisStep("results");
          
          // Call callbacks
          onAnalysisComplete?.(combinedResult);
          onPlantsDetected?.(detectedPlants);
        }
      } catch (error) {
        console.error("Unified analysis failed:", error);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, analysisStatus: "error", analysisProgress: 0 }
              : img,
          ),
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onAnalysisComplete, onPlantsDetected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload],
  );

  const retryAnalysis = (imageId: string) => {
    const image = uploadedImages.find((img) => img.id === imageId);
    if (image) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(image.file);
      handleFileUpload(dataTransfer.files);
    }
  };

  const useThisLayout = () => {
    if (selectedResult) {
      setCurrentAnalysisStep("recreation");
    }
  };

  const selectedImage = uploadedImages.find((img) => img.id === selectedImageId);

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs
        value={currentAnalysisStep}
        onValueChange={(value: any) => setCurrentAnalysisStep(value)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" disabled={isAnalyzing}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="analyzing"
            disabled={!isAnalyzing && currentAnalysisStep !== "analyzing"}
          >
            <Zap className="w-4 h-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!selectedResult}>
            <Eye className="w-4 h-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="recreation" disabled={!selectedResult}>
            <Home className="w-4 h-4 mr-2" />
            Garden View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Upload Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Garden Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription>
                    Upload a clear photo of your garden. Our AI will simultaneously:
                    <br />• Analyze the spatial layout and identify features
                    <br />• Recognize existing plants in the image
                    <br />• Create a 3D recreation with detected plants included
                  </AlertDescription>
                </Alert>

                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isAnalyzing ? (
                    <div className="space-y-3">
                      <Loader2 className="w-12 h-12 mx-auto text-green-500 animate-spin" />
                      <p className="text-lg font-medium">
                        Analyzing your garden...
                      </p>
                      <p className="text-gray-600">
                        Running spatial analysis and plant recognition
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center items-center gap-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <Brain className="w-8 h-8 text-blue-500" />
                        <Leaf className="w-8 h-8 text-green-500" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Drop your garden image here
                        </p>
                        <p className="text-gray-600">
                          or click to browse files
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Supports JPG, PNG, WebP • Max 10MB
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Photo Tips */}
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
                    <Camera className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Good Lighting</div>
                      <div className="text-gray-600">
                        Daylight photos work best for both analyses
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded">
                    <Eye className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Clear View</div>
                      <div className="text-gray-600">
                        Include both garden layout and plant details
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-orange-50 rounded">
                    <Leaf className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Plant Focus</div>
                      <div className="text-gray-600">
                        Ensure plants are visible and well-lit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Analysis Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 p-3 border rounded"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{image.name}</div>
                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                          Status:{" "}
                          <Badge
                            variant={
                              image.analysisStatus === "completed"
                                ? "default"
                                : image.analysisStatus === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {image.analysisStatus}
                          </Badge>
                        </div>
                        {image.analysisStatus === "analyzing" && (
                          <div className="space-y-2">
                            <Progress
                              value={image.analysisProgress}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-500 flex gap-4">
                              <span className={image.spatialAnalysisComplete ? "text-green-600" : ""}>
                                Spatial Analysis {image.spatialAnalysisComplete ? "✓" : "..."}
                              </span>
                              <span className={image.plantAnalysisComplete ? "text-green-600" : ""}>
                                Plant Recognition {image.plantAnalysisComplete ? "✓" : "..."}
                              </span>
                            </div>
                          </div>
                        )}
                        {image.analysisStatus === "completed" && (
                          <div className="text-xs text-green-600 flex gap-4">
                            <span>Plants: {image.detectedPlants?.length || 0}</span>
                            <span>Features: {image.spatialResult?.analysisDetails.detectedFeatures || 0}</span>
                          </div>
                        )}
                      </div>
                      {image.analysisStatus === "error" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryAnalysis(image.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyzing" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-green-500 animate-spin" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Analyzing Your Garden
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our AI is performing comprehensive analysis of your garden image
                  </p>
                </div>

                <div className="space-y-3 text-sm text-left max-w-md mx-auto">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Detecting garden boundaries and dimensions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Identifying architectural features (walls, doors, windows)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Recognizing existing plants and vegetation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Analyzing sunlight patterns and microclimates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating integrated 3D spatial model...</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedResult && selectedImage && (
            <>
              {/* Combined Analysis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Unified Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(selectedResult.spatialResult.confidence * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Confidence
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedResult.detectedPlants.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Plants Found
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedResult.spatialResult.analysisDetails.detectedFeatures}
                        </div>
                        <div className="text-sm text-gray-600">Features</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedResult.gardenLayout.zones.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Planting Zones
                        </div>
                      </div>
                    </div>

                    {/* Plant Detection Results */}
                    {selectedResult.detectedPlants.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-500" />
                          Detected Plants
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedResult.detectedPlants.map((plant) => (
                            <div key={plant.id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                              <Badge variant="outline" className="text-xs">
                                {Math.round(plant.confidence * 100)}%
                              </Badge>
                              <span className="font-medium">{plant.name}</span>
                              <span className="text-xs text-gray-500 italic">
                                {plant.scientificName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {selectedResult.spatialResult.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <div className="font-medium mb-1">
                            Analysis Notes:
                          </div>
                          <ul className="list-disc list-inside text-sm">
                            {selectedResult.spatialResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button onClick={useThisLayout} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        View Garden Recreation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentAnalysisStep("upload")}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Try Another Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image with Plant Detections */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Plant Detection Overlay</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {showBoundingBoxes ? "Hide" : "Show"} Detections
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <img
                      src={selectedImage.url}
                      alt="Garden analysis"
                      className="w-full h-auto rounded-lg"
                    />
                    {showBoundingBoxes && selectedResult.detectedPlants.length > 0 && (
                      <BoundingBoxOverlay
                        plants={selectedResult.detectedPlants.map(plant => ({
                          bbox: plant.bbox!,
                          label: plant.name,
                          confidence: plant.confidence,
                          category: plant.category,
                          scientific_name: plant.scientificName,
                          properties: plant.properties || []
                        }))}
                        imageWidth={400}
                        imageHeight={300}
                        onPlantSelect={(plant) => console.log("Selected plant:", plant)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="recreation" className="space-y-4">
          {selectedResult && (
            <GardenSpaceRecreation
              layout={selectedResult.gardenLayout}
              detectedPlants={selectedResult.detectedPlants}
              showMeasurements={true}
              showZones={true}
              showConstraints={false}
              showDetectedPlants={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedGardenAnalysis;
