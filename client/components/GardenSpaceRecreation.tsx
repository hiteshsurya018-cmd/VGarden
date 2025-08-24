/**
 * Garden Space Recreation Component
 * Creates 3D representation of user's actual garden space
 */

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html, Box, Plane } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Upload,
  RotateCcw,
  Ruler,
  MapPin,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  TreePine,
  Home,
  Route,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
} from "lucide-react";
import {
  GardenLayout,
  GardenFeature,
  GardenZone,
  PlantingArea,
} from "../services/GardenSpatialAnalysis";

// 3D Detected Plant Component
const DetectedPlant3D: React.FC<{
  plant: DetectedPlant;
  layout: GardenLayout;
  onClick?: () => void;
}> = ({ plant, layout, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      if (hovered) {
        meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "medicinal":
        return "#10B981";
      case "herb":
        return "#059669";
      case "aromatic":
        return "#8B5CF6";
      case "flower":
        return "#EC4899";
      case "leafy":
        return "#22C55E";
      case "culinary":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  // Convert bbox coordinates to 3D position
  // Assuming bbox is relative to image dimensions and layout represents real-world meters
  const bboxCenterX = plant.bbox ? (plant.bbox.x1 + plant.bbox.x2) / 2 : layout.dimensions.width / 2;
  const bboxCenterY = plant.bbox ? (plant.bbox.y1 + plant.bbox.y2) / 2 : layout.dimensions.height / 2;

  // Convert normalized coordinates to 3D space
  const x = (bboxCenterX / 500) * layout.dimensions.width - layout.dimensions.width / 2; // Assuming 500px image width
  const z = (bboxCenterY / 400) * layout.dimensions.height - layout.dimensions.height / 2; // Assuming 400px image height

  const color = getCategoryColor(plant.category);
  const plantHeight = 0.3 + Math.random() * 0.7; // 0.3-1.0m height

  return (
    <group position={[x, plantHeight / 2, z]}>
      {/* Plant stem */}
      <Box
        args={[0.1, plantHeight, 0.1]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#4ADE80" />
      </Box>

      {/* Plant foliage */}
      <mesh
        ref={meshRef}
        position={[0, plantHeight * 0.7, 0]}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15 + Math.random() * 0.1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </mesh>

      {/* Confidence indicator */}
      <mesh position={[0, plantHeight + 0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial
          color={plant.confidence > 0.8 ? "#10B981" : plant.confidence > 0.6 ? "#F59E0B" : "#EF4444"}
        />
      </mesh>

      {/* Plant label */}
      {hovered && (
        <Html position={[0, plantHeight + 0.3, 0]} center>
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none max-w-xs">
            <div className="font-semibold text-gray-800">{plant.name}</div>
            <div className="text-gray-600 italic text-xs">{plant.scientificName}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {Math.round(plant.confidence * 100)}%
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {plant.category}
              </Badge>
            </div>
            {plant.properties && plant.properties.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {plant.properties.slice(0, 2).join(", ")}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

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

interface GardenSpaceRecreationProps {
  layout: GardenLayout | null;
  detectedPlants?: DetectedPlant[];
  onFeatureClick?: (feature: GardenFeature) => void;
  onZoneClick?: (zone: GardenZone) => void;
  onPlantingAreaClick?: (area: PlantingArea) => void;
  showMeasurements?: boolean;
  showZones?: boolean;
  showConstraints?: boolean;
  showDetectedPlants?: boolean;
  className?: string;
}

// 3D Garden Feature Component
const GardenFeature3D: React.FC<{
  feature: GardenFeature;
  onClick?: () => void;
  layout: GardenLayout;
}> = ({ feature, onClick, layout }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getFeatureColor = (type: string): string => {
    switch (type) {
      case "path":
        return "#8B7355";
      case "structure":
        return "#6B7280";
      case "existing_plant":
        return "#22C55E";
      case "water_feature":
        return "#3B82F6";
      case "fence":
        return "#92400E";
      case "building":
        return "#DC2626";
      case "open_space":
        return "#84CC16";
      case "shade_area":
        return "#6366F1";
      case "sunny_area":
        return "#F59E0B";
      default:
        return "#9CA3AF";
    }
  };

  const getFeatureHeight = (type: string): number => {
    switch (type) {
      case "path":
        return 0.05;
      case "structure":
        return 0.5;
      case "existing_plant":
        return 1.0;
      case "water_feature":
        return 0.1;
      case "fence":
        return 1.5;
      case "building":
        return 2.5;
      case "open_space":
        return 0.02;
      case "shade_area":
        return 0.03;
      case "sunny_area":
        return 0.03;
      default:
        return 0.1;
    }
  };

  const coords = feature.coordinates[0];
  const x = coords.x - layout.dimensions.width / 2;
  const z = coords.z || coords.y - layout.dimensions.height / 2;
  const color = getFeatureColor(feature.type);
  const height = getFeatureHeight(feature.type);

  return (
    <group position={[x, height / 2, z]}>
      <Box
        ref={meshRef}
        args={[feature.dimensions.width, height, feature.dimensions.height]}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.8 : 0.6}
        />
      </Box>

      {hovered && (
        <Html position={[0, height + 0.5, 0]}>
          <div className="bg-white rounded p-2 shadow-lg border text-xs">
            <div className="font-semibold">
              {feature.type.replace("_", " ")}
            </div>
            <div className="text-gray-600">
              {feature.dimensions.width.toFixed(1)}m ×{" "}
              {feature.dimensions.height.toFixed(1)}m
            </div>
            {feature.properties.condition && (
              <Badge variant="outline" className="text-xs mt-1">
                {feature.properties.condition}
              </Badge>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Garden Zone Component
const GardenZone3D: React.FC<{
  zone: GardenZone;
  onClick?: () => void;
  layout: GardenLayout;
  visible: boolean;
}> = ({ zone, onClick, layout, visible }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  if (!visible) return null;

  const getZoneColor = (type: string, sunlight: string): string => {
    if (type === "planting") {
      switch (sunlight) {
        case "full":
          return "#FEF3C7";
        case "partial":
          return "#D1FAE5";
        case "shade":
          return "#DBEAFE";
        default:
          return "#F3F4F6";
      }
    }
    return "#E5E7EB";
  };

  const centerX =
    zone.coordinates.reduce((sum, coord) => sum + coord.x, 0) /
      zone.coordinates.length -
    layout.dimensions.width / 2;
  const centerY =
    zone.coordinates.reduce((sum, coord) => sum + coord.y, 0) /
      zone.coordinates.length -
    layout.dimensions.height / 2;
  const width =
    Math.max(...zone.coordinates.map((c) => c.x)) -
    Math.min(...zone.coordinates.map((c) => c.x));
  const depth =
    Math.max(...zone.coordinates.map((c) => c.y)) -
    Math.min(...zone.coordinates.map((c) => c.y));

  return (
    <group position={[centerX, 0.01, centerY]}>
      <Plane
        ref={meshRef}
        args={[width, depth]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getZoneColor(zone.type, zone.conditions.sunlight)}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </Plane>

      {hovered && (
        <Html position={[0, 0.5, 0]}>
          <div className="bg-white rounded p-3 shadow-lg border text-xs max-w-48">
            <div className="font-semibold">{zone.name}</div>
            <div className="text-gray-600 mb-2">
              {zone.area.toFixed(1)}m² • {zone.capacity} plants
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Sun className="w-3 h-3" />
                <span className="capitalize">{zone.conditions.sunlight}</span>
              </div>
              <div className="flex items-center gap-1">
                <CloudRain className="w-3 h-3" />
                <span className="capitalize">{zone.conditions.drainage}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500">Suitable plants:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {zone.suitablePlants.slice(0, 3).map((plant) => (
                  <Badge key={plant} variant="secondary" className="text-xs">
                    {plant}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Main Garden Scene
const GardenScene: React.FC<{
  layout: GardenLayout;
  detectedPlants: DetectedPlant[];
  showZones: boolean;
  showConstraints: boolean;
  showDetectedPlants: boolean;
  onFeatureClick?: (feature: GardenFeature) => void;
  onZoneClick?: (zone: GardenZone) => void;
}> = ({ layout, detectedPlants, showZones, showConstraints, showDetectedPlants, onFeatureClick, onZoneClick }) => {
  return (
    <>
      {/* Ground plane */}
      <Plane
        args={[layout.dimensions.width, layout.dimensions.height]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#8FBC8F" />
      </Plane>

      {/* Garden boundary */}
      <group>
        {[
          [-layout.dimensions.width / 2, 0, -layout.dimensions.height / 2],
          [layout.dimensions.width / 2, 0, -layout.dimensions.height / 2],
          [layout.dimensions.width / 2, 0, layout.dimensions.height / 2],
          [-layout.dimensions.width / 2, 0, layout.dimensions.height / 2],
        ].map((pos, index) => (
          <Box
            key={index}
            args={[0.1, 0.5, 0.1]}
            position={pos as [number, number, number]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Box>
        ))}
      </group>

      {/* Zones */}
      {showZones &&
        layout.zones.map((zone) => (
          <GardenZone3D
            key={zone.id}
            zone={zone}
            layout={layout}
            visible={showZones}
            onClick={() => onZoneClick?.(zone)}
          />
        ))}

      {/* Features */}
      {layout.features.map((feature) => (
        <GardenFeature3D
          key={feature.id}
          feature={feature}
          layout={layout}
          onClick={() => onFeatureClick?.(feature)}
        />
      ))}

      {/* Detected Plants */}
      {showDetectedPlants &&
        detectedPlants.map((plant) => (
          <DetectedPlant3D
            key={plant.id}
            plant={plant}
            layout={layout}
            onClick={() => console.log("Clicked plant:", plant.name)}
          />
        ))}

      {/* Constraints visualization */}
      {showConstraints &&
        layout.features.map(
          (feature) =>
            feature.constraints.clearanceNeeded > 0 && (
              <group key={`constraint-${feature.id}`}>
                {feature.coordinates.map((coord, index) => (
                  <mesh
                    key={index}
                    position={[
                      coord.x - layout.dimensions.width / 2,
                      0.02,
                      (coord.z || coord.y) - layout.dimensions.height / 2,
                    ]}
                  >
                    <ringGeometry
                      args={[
                        feature.constraints.clearanceNeeded,
                        feature.constraints.clearanceNeeded + 0.2,
                        32,
                      ]}
                    />
                    <meshStandardMaterial
                      color="#FF6B6B"
                      transparent
                      opacity={0.3}
                    />
                  </mesh>
                ))}
              </group>
            ),
        )}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-5, 5, -5]} intensity={0.4} />
    </>
  );
};

export const GardenSpaceRecreation: React.FC<GardenSpaceRecreationProps> = ({
  layout,
  detectedPlants = [],
  onFeatureClick,
  onZoneClick,
  onPlantingAreaClick,
  showMeasurements = true,
  showZones = true,
  showConstraints = false,
  showDetectedPlants = true,
  className = "",
}) => {
  const [selectedFeature, setSelectedFeature] = useState<GardenFeature | null>(
    null,
  );
  const [selectedZone, setSelectedZone] = useState<GardenZone | null>(null);
  const [viewMode, setViewMode] = useState<
    "overview" | "planning" | "analysis"
  >("overview");

  if (!layout) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          Upload a garden image to see your space recreated in 3D
        </p>
      </div>
    );
  }

  const handleFeatureClick = (feature: GardenFeature) => {
    setSelectedFeature(feature);
    onFeatureClick?.(feature);
  };

  const handleZoneClick = (zone: GardenZone) => {
    setSelectedZone(zone);
    onZoneClick?.(zone);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Garden Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            {layout.name}
            <Badge variant="outline">
              {layout.dimensions.estimatedArea.toFixed(0)}m²
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium">
                  {layout.dimensions.width.toFixed(1)}m ×{" "}
                  {layout.dimensions.height.toFixed(1)}m
                </div>
                <div className="text-gray-500">Dimensions</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <div>
                <div className="font-medium">{layout.zones.length}</div>
                <div className="text-gray-500">Zones</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-orange-500" />
              <div>
                <div className="font-medium">{layout.features.length}</div>
                <div className="text-gray-500">Features</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {detectedPlants.length > 0 ? (
                <>
                  <TreePine className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-medium">{detectedPlants.length}</div>
                    <div className="text-gray-500">Detected Plants</div>
                  </div>
                </>
              ) : (
                <>
                  <Route className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium">{layout.accessPaths.length}</div>
                    <div className="text-gray-500">Paths</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Garden View */}
      <Card className="h-96">
        <CardContent className="p-0 h-full">
          <Canvas camera={{ position: [0, 8, 8], fov: 60 }}>
            <GardenScene
              layout={layout}
              detectedPlants={detectedPlants}
              showZones={showZones}
              showConstraints={showConstraints}
              showDetectedPlants={showDetectedPlants}
              onFeatureClick={handleFeatureClick}
              onZoneClick={handleZoneClick}
            />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </CardContent>
      </Card>

      {/* Garden Analysis Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Zones Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Garden Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {layout.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => handleZoneClick(zone)}
                  >
                    <div>
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-sm text-gray-600">
                        {zone.area.toFixed(1)}m² • {zone.conditions.sunlight}{" "}
                        sun
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{zone.capacity}</div>
                      <div className="text-sm text-gray-500">capacity</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Garden Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {layout.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleFeatureClick(feature)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#8B7355" }}
                      ></div>
                      <span className="text-sm capitalize">
                        {feature.type.replace("_", " ")}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.properties.condition || "Good"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          {/* Planting Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Planting Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {layout.plantingAreas.map((area) => (
                  <div key={area.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{area.name}</h4>
                      <Badge>{area.plantCapacity} plants</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Soil Type</div>
                        <div className="capitalize">
                          {area.soilConditions.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">pH Level</div>
                        <div>{area.soilConditions.ph.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Sunlight</div>
                        <div>{area.sunlightHours}h/day</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Drainage</div>
                        <div className="capitalize">
                          {area.soilConditions.drainage}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Microclimate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Microclimate Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium">
                      {layout.microclimate.averageTemperature}°C
                    </div>
                    <div className="text-sm text-gray-500">Avg Temperature</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">
                      {layout.microclimate.humidity}%
                    </div>
                    <div className="text-sm text-gray-500">Humidity</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium capitalize">
                      {layout.microclimate.windDirection}
                    </div>
                    <div className="text-sm text-gray-500">Wind Direction</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="font-medium">
                      {layout.microclimate.hotSpots.length}
                    </div>
                    <div className="text-sm text-gray-500">Hot Spots</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {layout.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-blue-50 rounded"
                  >
                    {rec.priority === "high" ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-sm">
                        {rec.description}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {rec.priority} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GardenSpaceRecreation;
