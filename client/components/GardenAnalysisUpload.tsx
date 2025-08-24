/**
 * Garden Analysis Upload Component
 * Handles garden image upload and spatial analysis workflow
 */

import React, { useState, useCallback } from "react";
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
} from "lucide-react";
import {
  GardenLayout,
  AnalysisResult,
  gardenSpatialAnalysis,
} from "../services/GardenSpatialAnalysis";
import GardenSpaceRecreation from "./GardenSpaceRecreation";

interface GardenAnalysisUploadProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onLayoutSelected?: (layout: GardenLayout) => void;
  className?: string;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  analysisStatus: "pending" | "analyzing" | "completed" | "error";
  analysisProgress: number;
  result?: AnalysisResult;
}

export const GardenAnalysisUpload: React.FC<GardenAnalysisUploadProps> = ({
  onAnalysisComplete,
  onLayoutSelected,
  className = "",
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<GardenLayout | null>(
    null,
  );
  const [analysisStep, setAnalysisStep] = useState<
    "upload" | "analyzing" | "results" | "recreation"
  >("upload");

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      Array.from(files).forEach(async (file) => {
        if (file.type.startsWith("image/")) {
          const imageId = Math.random().toString(36).substr(2, 9);
          const newImage: UploadedImage = {
            id: imageId,
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            analysisStatus: "pending",
            analysisProgress: 0,
          };

          setUploadedImages((prev) => [...prev, newImage]);
          setAnalysisStep("analyzing");
          setIsAnalyzing(true);

          try {
            // Update progress during analysis
            const progressInterval = setInterval(() => {
              setUploadedImages((prev) =>
                prev.map((img) =>
                  img.id === imageId && img.analysisProgress < 90
                    ? {
                        ...img,
                        analysisProgress: img.analysisProgress + 10,
                        analysisStatus: "analyzing",
                      }
                    : img,
                ),
              );
            }, 200);

            // Perform actual analysis
            const result =
              await gardenSpatialAnalysis.analyzeGardenLayout(file);

            clearInterval(progressInterval);

            setUploadedImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      analysisProgress: 100,
                      analysisStatus: result.success ? "completed" : "error",
                      result,
                    }
                  : img,
              ),
            );

            if (result.success) {
              setSelectedLayout(result.layout);
              setAnalysisStep("results");
              onAnalysisComplete?.(result);
            }
          } catch (error) {
            console.error("Analysis failed:", error);
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
        }
      });
    },
    [onAnalysisComplete],
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
      handleFileUpload(new DataTransfer().files);
    }
  };

  const useThisLayout = () => {
    if (selectedLayout) {
      onLayoutSelected?.(selectedLayout);
      setAnalysisStep("recreation");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs
        value={analysisStep}
        onValueChange={(value: any) => setAnalysisStep(value)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" disabled={isAnalyzing}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="analyzing"
            disabled={!isAnalyzing && analysisStep !== "analyzing"}
          >
            <Zap className="w-4 h-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!selectedLayout}>
            <Eye className="w-4 h-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="recreation" disabled={!selectedLayout}>
            <Home className="w-4 h-4 mr-2" />
            Recreation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Upload Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Garden Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription>
                    Upload a clear photo of your garden space to get started.
                    The AI will analyze the layout, identify existing features,
                    and create a 3D recreation of your garden.
                  </AlertDescription>
                </Alert>

                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() =>
                    document.getElementById("garden-file-input")?.click()
                  }
                >
                  {isAnalyzing ? (
                    <div className="space-y-3">
                      <Loader2 className="w-12 h-12 mx-auto text-green-500 animate-spin" />
                      <p className="text-lg font-medium">
                        Analyzing your garden...
                      </p>
                      <p className="text-gray-600">
                        This may take a few moments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
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
                  id="garden-file-input"
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
                        Take photos during daylight for best analysis
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded">
                    <Eye className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Full View</div>
                      <div className="text-gray-600">
                        Capture the entire garden area from above if possible
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-orange-50 rounded">
                    <Target className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Clear Features</div>
                      <div className="text-gray-600">
                        Ensure paths, plants, and structures are visible
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
                <CardTitle className="text-sm">Uploaded Images</CardTitle>
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
                        <div className="text-sm text-gray-600 mb-2">
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
                          <Progress
                            value={image.analysisProgress}
                            className="w-full"
                          />
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
                    Our AI is examining your garden image to understand the
                    layout and features
                  </p>
                </div>

                <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Detecting garden boundaries and dimensions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Identifying existing plants and features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Analyzing sunlight and growing conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating 3D spatial model...</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedLayout &&
            uploadedImages.find((img) => img.result?.success) && (
              <>
                {/* Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Analysis Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const result = uploadedImages.find(
                        (img) => img.result?.success,
                      )?.result;
                      if (!result) return null;

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round(result.confidence * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                Confidence
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {result.analysisDetails.detectedFeatures}
                              </div>
                              <div className="text-sm text-gray-600">
                                Features
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {result.analysisDetails.identifiedZones}
                              </div>
                              <div className="text-sm text-gray-600">Zones</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {(
                                  result.analysisDetails.processingTime / 1000
                                ).toFixed(1)}
                                s
                              </div>
                              <div className="text-sm text-gray-600">
                                Analysis Time
                              </div>
                            </div>
                          </div>

                          {/* Warnings */}
                          {result.warnings.length > 0 && (
                            <Alert>
                              <AlertTriangle className="w-4 h-4" />
                              <AlertDescription>
                                <div className="font-medium mb-1">
                                  Analysis Notes:
                                </div>
                                <ul className="list-disc list-inside text-sm">
                                  {result.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Suggestions */}
                          {result.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">
                                Suggestions for better analysis:
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {result.suggestions.map((suggestion, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4">
                            <Button onClick={useThisLayout} className="flex-1">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Use This Layout
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setAnalysisStep("upload")}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Try Another Image
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Quick Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Garden Layout Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            {selectedLayout.dimensions.width.toFixed(1)}m ×{" "}
                            {selectedLayout.dimensions.height.toFixed(1)}m
                          </div>
                          <div className="text-gray-500">Dimensions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="font-medium">
                            {selectedLayout.zones.length}
                          </div>
                          <div className="text-gray-500">Planting Zones</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="font-medium">
                            {selectedLayout.features.length}
                          </div>
                          <div className="text-gray-500">Features</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
        </TabsContent>

        <TabsContent value="recreation" className="space-y-4">
          {selectedLayout && (
            <GardenSpaceRecreation
              layout={selectedLayout}
              showMeasurements={true}
              showZones={true}
              showConstraints={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GardenAnalysisUpload;
