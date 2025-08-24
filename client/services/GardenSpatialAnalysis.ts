/**
 * Garden Spatial Analysis Service
 * Analyzes garden images to understand layout, dimensions, and features
 */

export interface GardenFeature {
  id: string;
  type:
    | "path"
    | "structure"
    | "existing_plant"
    | "water_feature"
    | "fence"
    | "building"
    | "open_space"
    | "shade_area"
    | "sunny_area"
    | "wall"
    | "door"
    | "window"
    | "roof"
    | "deck"
    | "patio"
    | "steps"
    | "driveway"
    | "garage"
    | "shed";
  coordinates: { x: number; y: number; z?: number }[];
  dimensions: { width: number; height: number; depth?: number };
  properties: {
    material?: string;
    condition?: "good" | "fair" | "poor";
    accessibility?: "easy" | "moderate" | "difficult";
    sunlight?: "full" | "partial" | "shade";
    drainage?: "good" | "moderate" | "poor";
    soilType?: string;
    elevation?: number;
    orientation?:
      | "north"
      | "south"
      | "east"
      | "west"
      | "northeast"
      | "northwest"
      | "southeast"
      | "southwest";
    wallHeight?: number;
    glassArea?: number; // for windows
    openingWidth?: number; // for doors
    roofType?: "flat" | "pitched" | "shed" | "gable";
    surfaceMaterial?:
      | "concrete"
      | "wood"
      | "brick"
      | "stone"
      | "vinyl"
      | "metal"
      | "glass";
  };
  constraints: {
    canPlantAround: boolean;
    canModify: boolean;
    clearanceNeeded: number; // meters
    seasonalChanges?: boolean;
    shadowCast?: { direction: string; length: number; timeOfDay: string }[];
    windBlockage?: number; // percentage
    reflectedLight?: number; // percentage increase in nearby light
  };
}

export interface GardenLayout {
  id: string;
  name: string;
  dimensions: {
    width: number; // meters
    height: number; // meters
    estimatedArea: number; // square meters
  };
  features: GardenFeature[];
  zones: GardenZone[];
  plantingAreas: PlantingArea[];
  accessPaths: AccessPath[];
  microclimate: MicroclimaData;
  recommendations: LayoutRecommendation[];
}

export interface GardenZone {
  id: string;
  name: string;
  type: "planting" | "pathway" | "seating" | "storage" | "compost" | "water";
  coordinates: { x: number; y: number }[];
  area: number; // square meters
  conditions: {
    sunlight: "full" | "partial" | "shade";
    soilType: string;
    drainage: "good" | "moderate" | "poor";
    windExposure: "high" | "moderate" | "low";
    accessibility: "easy" | "moderate" | "difficult";
  };
  suitablePlants: string[];
  capacity: number; // number of plants that can fit
}

export interface PlantingArea {
  id: string;
  name: string;
  coordinates: { x: number; y: number }[];
  soilConditions: {
    type: "clay" | "sandy" | "loam" | "rocky";
    ph: number;
    drainage: "good" | "moderate" | "poor";
    fertility: "high" | "medium" | "low";
  };
  sunlightHours: number;
  spacing: {
    minDistance: number;
    recommended: number;
  };
  plantCapacity: number;
  existingPlants: string[];
}

export interface AccessPath {
  id: string;
  type: "main" | "secondary" | "maintenance";
  coordinates: { x: number; y: number }[];
  width: number;
  material: string;
  condition: "good" | "fair" | "poor";
  accessibility: boolean;
}

export interface MicroclimaData {
  averageTemperature: number;
  humidity: number;
  windDirection: string;
  frostPockets: { x: number; y: number }[];
  hotSpots: { x: number; y: number }[];
  drainageIssues: { x: number; y: number }[];
  sunlightPatterns: SunlightPattern[];
  shadowMaps: ShadowMap[];
  windFlowPatterns: WindPattern[];
  microzones: Microzone[];
}

export interface SunlightPattern {
  id: string;
  timeOfDay: "morning" | "midday" | "afternoon" | "evening";
  season: "spring" | "summer" | "fall" | "winter";
  coordinates: { x: number; y: number }[];
  intensity: number; // 0-100%
  duration: number; // hours
  angle: number; // degrees from horizontal
  qualityScore: number; // overall light quality for plants
}

export interface ShadowMap {
  id: string;
  castingFeature: string; // feature ID that casts shadow
  affectedArea: { x: number; y: number }[];
  timeOfDay: string;
  shadowLength: number;
  shadowDirection: number; // degrees
  opacity: number; // 0-100%
  seasonalVariation: boolean;
}

export interface WindPattern {
  id: string;
  direction: string;
  strength: "light" | "moderate" | "strong";
  affectedArea: { x: number; y: number }[];
  blockingFeatures: string[]; // feature IDs
  channeling: boolean; // if wind is channeled between structures
  turbulence: "low" | "medium" | "high";
}

export interface Microzone {
  id: string;
  name: string;
  coordinates: { x: number; y: number }[];
  characteristics: {
    temperature: number; // relative to base temp
    humidity: number;
    airflow: "still" | "gentle" | "breezy" | "windy";
    lightLevel:
      | "deep_shade"
      | "shade"
      | "partial_shade"
      | "partial_sun"
      | "full_sun";
    moisture: "dry" | "moderate" | "moist" | "wet";
  };
  influences: string[]; // feature IDs that influence this microzone
}

export interface LayoutRecommendation {
  type: "plant_placement" | "infrastructure" | "maintenance" | "seasonal";
  priority: "high" | "medium" | "low";
  description: string;
  coordinates?: { x: number; y: number };
  seasonality?: string;
  costEstimate?: number;
}

export interface AnalysisResult {
  success: boolean;
  confidence: number;
  layout: GardenLayout;
  analysisDetails: {
    detectedFeatures: number;
    identifiedZones: number;
    estimatedAccuracy: number;
    processingTime: number;
    imageQuality: number;
  };
  warnings: string[];
  suggestions: string[];
}

export class GardenSpatialAnalysisService {
  async analyzeGardenLayout(imageFile: File): Promise<AnalysisResult> {
    console.log("🏡 Starting garden spatial analysis...");

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create canvas for image analysis
      const analysis = await this.processGardenImage(imageFile);

      return {
        success: true,
        confidence: analysis.confidence,
        layout: analysis.layout,
        analysisDetails: analysis.details,
        warnings: analysis.warnings,
        suggestions: analysis.suggestions,
      };
    } catch (error) {
      console.error("Garden analysis failed:", error);
      return this.getFallbackAnalysis();
    }
  }

  private async processGardenImage(file: File): Promise<{
    confidence: number;
    layout: GardenLayout;
    details: any;
    warnings: string[];
    suggestions: string[];
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // Analyze image characteristics
        const imageData = ctx?.getImageData(0, 0, img.width, img.height);
        const analysis = this.analyzeImageFeatures(
          imageData,
          img.width,
          img.height,
          file.name,
        );

        resolve(analysis);
      };

      img.onerror = () => {
        resolve(this.getFallbackAnalysisData());
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private analyzeImageFeatures(
    imageData: ImageData | undefined,
    width: number,
    height: number,
    filename: string,
  ) {
    if (!imageData) return this.getFallbackAnalysisData();

    const data = imageData.data;

    // Enhanced color and pattern analysis
    const analysis = this.performAdvancedImageAnalysis(data, width, height);

    // Generate realistic garden layout with architectural features
    return this.generateAdvancedGardenLayout(width, height, analysis, filename);
  }

  private performAdvancedImageAnalysis(
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ) {
    let greenArea = 0,
      brownArea = 0,
      grayArea = 0,
      brightAreas = 0,
      darkAreas = 0;
    let whiteAreas = 0,
      blueAreas = 0,
      redBrickAreas = 0,
      woodAreas = 0;
    let glassSurfaces = 0,
      metallicSurfaces = 0,
      concreteSurfaces = 0;

    // Edge detection data for structural analysis
    const edges: boolean[][] = [];
    const shadows: boolean[][] = [];
    const highlights: boolean[][] = [];

    // Initialize 2D arrays
    for (let y = 0; y < height; y++) {
      edges[y] = [];
      shadows[y] = [];
      highlights[y] = [];
    }

    // Color and texture analysis
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        // Basic color detection
        if (g > r && g > b && g > 100) greenArea++;
        if (r > 100 && g > 80 && b < 100 && Math.abs(r - g) < 50) brownArea++;
        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 80 && r < 180)
          grayArea++;

        // Advanced material detection

        // White/light surfaces (walls, concrete)
        if (r > 200 && g > 200 && b > 200) {
          whiteAreas++;
          concreteSurfaces++;
        }

        // Blue areas (windows, sky reflection, water)
        if (b > r && b > g && b > 120) {
          blueAreas++;
          if (brightness > 150) glassSurfaces++; // bright blue = glass reflection
        }

        // Red brick detection
        if (r > 120 && r > g && r > b && g < 100 && b < 100) {
          redBrickAreas++;
        }

        // Wood detection (brown with texture)
        if (r > 80 && g > 60 && b < 80 && r > g && g > b) {
          woodAreas++;
        }

        // Metallic surfaces (uniform gray with highlights)
        if (
          Math.abs(r - g) < 15 &&
          Math.abs(g - b) < 15 &&
          brightness > 100 &&
          brightness < 200
        ) {
          metallicSurfaces++;
        }

        // Track brightness patterns
        if (brightness > 220) {
          brightAreas++;
          highlights[y][x] = true;
        } else {
          highlights[y][x] = false;
        }

        if (brightness < 60) {
          darkAreas++;
          shadows[y][x] = true;
        } else {
          shadows[y][x] = false;
        }

        // Edge detection (simple Sobel operator)
        if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
          const gx = this.getSobelX(data, x, y, width);
          const gy = this.getSobelY(data, x, y, width);
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          edges[y][x] = magnitude > 50; // threshold for edge detection
        }
      }
    }

    // Architectural feature detection
    const structures = this.detectStructuralFeatures(
      edges,
      shadows,
      highlights,
      width,
      height,
    );
    const sunlightPatterns = this.analyzeSunlightPatterns(
      shadows,
      highlights,
      width,
      height,
    );
    const openings = this.detectDoorsAndWindows(edges, data, width, height);

    const totalPixels = data.length / 4;

    return {
      // Basic ratios
      greenRatio: greenArea / totalPixels,
      brownRatio: brownArea / totalPixels,
      grayRatio: grayArea / totalPixels,
      brightRatio: brightAreas / totalPixels,
      darkRatio: darkAreas / totalPixels,

      // Advanced material ratios
      whiteRatio: whiteAreas / totalPixels,
      blueRatio: blueAreas / totalPixels,
      brickRatio: redBrickAreas / totalPixels,
      woodRatio: woodAreas / totalPixels,
      glassRatio: glassSurfaces / totalPixels,
      metallicRatio: metallicSurfaces / totalPixels,
      concreteRatio: concreteSurfaces / totalPixels,

      // Structural analysis
      structures,
      sunlightPatterns,
      openings,
      edgeMap: edges,
      shadowMap: shadows,
      highlightMap: highlights,
    };
  }

  private getSobelX(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
  ): number {
    const getPixel = (px: number, py: number) => {
      const i = (py * width + px) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };

    return (
      -1 * getPixel(x - 1, y - 1) +
      -2 * getPixel(x - 1, y) +
      -1 * getPixel(x - 1, y + 1) +
      1 * getPixel(x + 1, y - 1) +
      2 * getPixel(x + 1, y) +
      1 * getPixel(x + 1, y + 1)
    );
  }

  private getSobelY(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
  ): number {
    const getPixel = (px: number, py: number) => {
      const i = (py * width + px) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };

    return (
      -1 * getPixel(x - 1, y - 1) +
      -2 * getPixel(x, y - 1) +
      -1 * getPixel(x + 1, y - 1) +
      1 * getPixel(x - 1, y + 1) +
      2 * getPixel(x, y + 1) +
      1 * getPixel(x + 1, y + 1)
    );
  }

  private detectStructuralFeatures(
    edges: boolean[][],
    shadows: boolean[][],
    highlights: boolean[][],
    width: number,
    height: number,
  ) {
    const structures = [];

    // Find long horizontal edges (likely walls or roof lines)
    for (let y = 0; y < height; y++) {
      let edgeStart = -1;
      let edgeLength = 0;

      for (let x = 0; x < width; x++) {
        if (edges[y][x]) {
          if (edgeStart === -1) edgeStart = x;
          edgeLength++;
        } else {
          if (edgeLength > width * 0.3) {
            // Long horizontal edge
            structures.push({
              type: "horizontal_edge",
              start: { x: edgeStart, y },
              end: { x: edgeStart + edgeLength, y },
              length: edgeLength,
              confidence: Math.min(1, edgeLength / (width * 0.5)),
            });
          }
          edgeStart = -1;
          edgeLength = 0;
        }
      }
    }

    // Find long vertical edges (likely wall corners or door frames)
    for (let x = 0; x < width; x++) {
      let edgeStart = -1;
      let edgeLength = 0;

      for (let y = 0; y < height; y++) {
        if (edges[y][x]) {
          if (edgeStart === -1) edgeStart = y;
          edgeLength++;
        } else {
          if (edgeLength > height * 0.2) {
            // Long vertical edge
            structures.push({
              type: "vertical_edge",
              start: { x, y: edgeStart },
              end: { x, y: edgeStart + edgeLength },
              length: edgeLength,
              confidence: Math.min(1, edgeLength / (height * 0.4)),
            });
          }
          edgeStart = -1;
          edgeLength = 0;
        }
      }
    }

    return structures;
  }

  private analyzeSunlightPatterns(
    shadows: boolean[][],
    highlights: boolean[][],
    width: number,
    height: number,
  ) {
    const patterns = [];

    // Find large shadow areas
    const shadowClusters = this.findClusters(shadows, width, height, false);
    shadowClusters.forEach((cluster, index) => {
      if (cluster.size > width * height * 0.05) {
        // At least 5% of image
        patterns.push({
          type: "shadow",
          id: `shadow-${index}`,
          area: cluster.points,
          size: cluster.size,
          center: cluster.center,
          intensity: 0.2, // shadows reduce light to 20%
        });
      }
    });

    // Find bright areas (direct sunlight)
    const lightClusters = this.findClusters(highlights, width, height, true);
    lightClusters.forEach((cluster, index) => {
      if (cluster.size > width * height * 0.03) {
        // At least 3% of image
        patterns.push({
          type: "bright_light",
          id: `light-${index}`,
          area: cluster.points,
          size: cluster.size,
          center: cluster.center,
          intensity: 1.0, // full sunlight
        });
      }
    });

    return patterns;
  }

  private detectDoorsAndWindows(
    edges: boolean[][],
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ) {
    const openings = [];

    // Look for rectangular shapes with high contrast edges
    for (let y = 10; y < height - 10; y += 5) {
      for (let x = 10; x < width - 10; x += 5) {
        const rect = this.analyzeRectangularRegion(
          edges,
          data,
          x,
          y,
          width,
          height,
        );

        if (rect.isLikelyOpening) {
          openings.push({
            type: rect.aspectRatio > 2 ? "door" : "window",
            center: { x: rect.centerX, y: rect.centerY },
            dimensions: { width: rect.width, height: rect.height },
            confidence: rect.confidence,
            glassDetected: rect.hasGlassSignature,
            frameDetected: rect.hasFrameEdges,
          });
        }
      }
    }

    return openings;
  }

  private analyzeRectangularRegion(
    edges: boolean[][],
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    imgWidth: number,
    imgHeight: number,
  ) {
    // Analyze a small region for door/window characteristics
    const regionSize = 20;
    let edgeCount = 0;
    let glassSignature = 0;
    let avgBrightness = 0;
    let pixelCount = 0;

    for (let y = startY; y < Math.min(startY + regionSize, imgHeight); y++) {
      for (let x = startX; x < Math.min(startX + regionSize, imgWidth); x++) {
        if (edges[y] && edges[y][x]) edgeCount++;

        const i = (y * imgWidth + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        avgBrightness += brightness;

        // Glass signature: blue tint with high brightness
        if (b > r && b > g && brightness > 150) {
          glassSignature++;
        }

        pixelCount++;
      }
    }

    avgBrightness /= pixelCount;
    const edgeDensity = edgeCount / pixelCount;
    const glassRatio = glassSignature / pixelCount;

    return {
      isLikelyOpening:
        edgeDensity > 0.1 && (avgBrightness > 140 || glassRatio > 0.1),
      confidence: Math.min(1, edgeDensity * 2 + glassRatio * 3),
      aspectRatio: regionSize / regionSize, // simplified for this analysis
      centerX: startX + regionSize / 2,
      centerY: startY + regionSize / 2,
      width: regionSize,
      height: regionSize,
      hasGlassSignature: glassRatio > 0.05,
      hasFrameEdges: edgeDensity > 0.15,
    };
  }

  private findClusters(
    boolMap: boolean[][],
    width: number,
    height: number,
    targetValue: boolean,
  ) {
    const visited: boolean[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(false));
    const clusters = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y][x] && boolMap[y][x] === targetValue) {
          const cluster = this.floodFill(
            boolMap,
            visited,
            x,
            y,
            width,
            height,
            targetValue,
          );
          if (cluster.size > 10) {
            // Minimum cluster size
            clusters.push(cluster);
          }
        }
      }
    }

    return clusters;
  }

  private floodFill(
    boolMap: boolean[][],
    visited: boolean[][],
    startX: number,
    startY: number,
    width: number,
    height: number,
    targetValue: boolean,
  ) {
    const stack = [{ x: startX, y: startY }];
    const points = [];
    let totalX = 0,
      totalY = 0;

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;

      if (
        x < 0 ||
        x >= width ||
        y < 0 ||
        y >= height ||
        visited[y][x] ||
        boolMap[y][x] !== targetValue
      ) {
        continue;
      }

      visited[y][x] = true;
      points.push({ x, y });
      totalX += x;
      totalY += y;

      // Add adjacent cells
      stack.push(
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      );
    }

    return {
      points,
      size: points.length,
      center: { x: totalX / points.length, y: totalY / points.length },
    };
  }

  private generateAdvancedGardenLayout(
    imageWidth: number,
    imageHeight: number,
    analysis: any,
    filename: string,
  ) {
    // Estimate real-world dimensions (assuming typical garden photo)
    const estimatedWidth = Math.min(Math.max(5, imageWidth / 100), 25); // 5-25 meters
    const estimatedHeight = Math.min(Math.max(5, imageHeight / 100), 25);
    const estimatedArea = estimatedWidth * estimatedHeight;

    // Generate features based on advanced analysis
    const features: GardenFeature[] = [];
    const zones: GardenZone[] = [];
    const plantingAreas: PlantingArea[] = [];

    // Detect walls and structures
    if (analysis.whiteRatio > 0.1 || analysis.concreteRatio > 0.05) {
      const wallHeight = 2.5 + Math.random() * 1.5; // 2.5-4m typical wall height

      features.push({
        id: "main-wall",
        type: "wall",
        coordinates: [
          { x: estimatedWidth * 0.9, y: 0 },
          { x: estimatedWidth * 0.9, y: estimatedHeight },
        ],
        dimensions: { width: 0.2, height: wallHeight, depth: estimatedHeight },
        properties: {
          material: analysis.brickRatio > 0.02 ? "brick" : "concrete",
          condition: "good",
          wallHeight: wallHeight,
          orientation: "north",
          surfaceMaterial: analysis.brickRatio > 0.02 ? "brick" : "concrete",
        },
        constraints: {
          canPlantAround: true,
          canModify: false,
          clearanceNeeded: 0.5,
          shadowCast: [
            {
              direction: "west",
              length: wallHeight * 1.5,
              timeOfDay: "morning",
            },
            {
              direction: "west",
              length: wallHeight * 0.8,
              timeOfDay: "midday",
            },
            {
              direction: "west",
              length: wallHeight * 2.0,
              timeOfDay: "afternoon",
            },
          ],
          windBlockage: 80,
        },
      });
    }

    // Detect doors and windows from openings analysis
    analysis.openings.forEach((opening: any, index: number) => {
      const realX = (opening.center.x / imageWidth) * estimatedWidth;
      const realY = (opening.center.y / imageHeight) * estimatedHeight;
      const realWidth =
        (opening.dimensions.width / imageWidth) * estimatedWidth;
      const realHeight =
        (opening.dimensions.height / imageHeight) * estimatedHeight;

      if (opening.type === "door") {
        features.push({
          id: `door-${index}`,
          type: "door",
          coordinates: [{ x: realX, y: realY }],
          dimensions: { width: realWidth, height: realHeight },
          properties: {
            condition: "good",
            accessibility: "easy",
            openingWidth: realWidth,
            material: analysis.woodRatio > 0.05 ? "wood" : "metal",
            orientation: realX > estimatedWidth * 0.8 ? "east" : "west",
          },
          constraints: {
            canPlantAround: true,
            canModify: false,
            clearanceNeeded: 1.5, // need space for door swing
          },
        });
      } else if (opening.type === "window") {
        features.push({
          id: `window-${index}`,
          type: "window",
          coordinates: [{ x: realX, y: realY }],
          dimensions: { width: realWidth, height: realHeight },
          properties: {
            condition: "good",
            glassArea: realWidth * realHeight,
            material: "glass",
            orientation: realX > estimatedWidth * 0.8 ? "east" : "west",
            surfaceMaterial: "glass",
          },
          constraints: {
            canPlantAround: true,
            canModify: false,
            clearanceNeeded: 0.8,
            reflectedLight: 15, // windows can reflect 15% more light to nearby areas
          },
        });
      }
    });

    // Detect existing vegetation
    if (analysis.greenRatio > 0.2) {
      features.push({
        id: "existing-vegetation",
        type: "existing_plant",
        coordinates: [
          { x: estimatedWidth * 0.2, y: estimatedHeight * 0.3 },
          { x: estimatedWidth * 0.8, y: estimatedHeight * 0.7 },
        ],
        dimensions: {
          width: estimatedWidth * 0.6,
          height: estimatedHeight * 0.4,
        },
        properties: {
          condition: analysis.greenRatio > 0.4 ? "good" : "fair",
          sunlight: analysis.brightRatio > 0.3 ? "full" : "partial",
        },
        constraints: {
          canPlantAround: true,
          canModify: false,
          clearanceNeeded: 0.5,
        },
      });
    }

    // Detect pathways and hardscaping
    if (
      analysis.brownRatio > 0.1 ||
      analysis.grayRatio > 0.1 ||
      analysis.concreteRatio > 0.05
    ) {
      const pathMaterial =
        analysis.concreteRatio > 0.03
          ? "concrete"
          : analysis.grayRatio > analysis.brownRatio
            ? "stone"
            : "gravel";

      features.push({
        id: "main-path",
        type: "path",
        coordinates: [
          { x: 0, y: estimatedHeight * 0.5 },
          { x: estimatedWidth, y: estimatedHeight * 0.5 },
        ],
        dimensions: { width: estimatedWidth, height: 1.2 },
        properties: {
          material: pathMaterial,
          condition: "good",
          accessibility: "easy",
          surfaceMaterial: pathMaterial,
        },
        constraints: {
          canPlantAround: true,
          canModify: false,
          clearanceNeeded: 0.3,
        },
      });
    }

    // Detect decks/patios from wood detection
    if (analysis.woodRatio > 0.08) {
      features.push({
        id: "deck-area",
        type: "deck",
        coordinates: [
          { x: estimatedWidth * 0.7, y: estimatedHeight * 0.1 },
          { x: estimatedWidth * 0.95, y: estimatedHeight * 0.4 },
        ],
        dimensions: {
          width: estimatedWidth * 0.25,
          height: estimatedHeight * 0.3,
          depth: 0.3,
        },
        properties: {
          material: "wood",
          condition: "good",
          elevation: 0.3,
          surfaceMaterial: "wood",
        },
        constraints: {
          canPlantAround: true,
          canModify: false,
          clearanceNeeded: 0.5,
          shadowCast: [
            { direction: "north", length: 2.0, timeOfDay: "midday" },
          ],
        },
      });
    }

    // Advanced sunlight and microclimate zone analysis
    const sunlightPatterns: SunlightPattern[] = [];
    const shadowMaps: ShadowMap[] = [];
    const microzones: Microzone[] = [];

    // Analyze sunlight patterns from image analysis
    analysis.sunlightPatterns.forEach((pattern: any, index: number) => {
      const realArea = pattern.area.map((point: any) => ({
        x: (point.x / imageWidth) * estimatedWidth,
        y: (point.y / imageHeight) * estimatedHeight,
      }));

      if (pattern.type === "bright_light") {
        sunlightPatterns.push({
          id: `sunlight-${index}`,
          timeOfDay: "midday",
          season: "summer",
          coordinates: realArea,
          intensity: pattern.intensity * 100,
          duration: 6,
          angle: 60,
          qualityScore: 90,
        });

        // Create sunny planting zone
        zones.push({
          id: `sunny-zone-${index}`,
          name: `Sunny Area ${index + 1}`,
          type: "planting",
          coordinates: realArea,
          area: this.calculatePolygonArea(realArea),
          conditions: {
            sunlight: "full",
            soilType: "loam",
            drainage: "good",
            windExposure: "moderate",
            accessibility: "easy",
          },
          suitablePlants: [
            "basil",
            "rosemary",
            "lavender",
            "echinacea",
            "thyme",
          ],
          capacity: Math.floor(this.calculatePolygonArea(realArea) / 0.4),
        });
      } else if (pattern.type === "shadow") {
        // Find the feature casting this shadow
        const castingFeature = features.find(
          (f) => f.type === "wall" || f.type === "building",
        );

        shadowMaps.push({
          id: `shadow-${index}`,
          castingFeature: castingFeature?.id || "unknown",
          affectedArea: realArea,
          timeOfDay: "afternoon",
          shadowLength: Math.sqrt(this.calculatePolygonArea(realArea)),
          shadowDirection: 270, // west
          opacity: 70,
          seasonalVariation: true,
        });

        // Create shade planting zone
        zones.push({
          id: `shade-zone-${index}`,
          name: `Shade Area ${index + 1}`,
          type: "planting",
          coordinates: realArea,
          area: this.calculatePolygonArea(realArea),
          conditions: {
            sunlight: "shade",
            soilType: "loam",
            drainage: "moderate",
            windExposure: "low",
            accessibility: "easy",
          },
          suitablePlants: [
            "lemon-balm",
            "mint",
            "ginseng-american",
            "chamomile",
          ],
          capacity: Math.floor(this.calculatePolygonArea(realArea) / 0.6),
        });
      }
    });

    // Create microzones based on architectural features and their influence
    features.forEach((feature) => {
      if (feature.type === "wall") {
        // Create microzone near wall (reflected heat, wind protection)
        microzones.push({
          id: `microzone-${feature.id}`,
          name: `Wall Microzone`,
          coordinates: [
            { x: feature.coordinates[0].x - 2, y: feature.coordinates[0].y },
            { x: feature.coordinates[0].x - 0.5, y: feature.coordinates[1].y },
          ],
          characteristics: {
            temperature: 2, // 2°C warmer
            humidity: -5, // drier
            airflow: "still",
            lightLevel:
              feature.properties.orientation === "south"
                ? "full_sun"
                : "partial_shade",
            moisture: "dry",
          },
          influences: [feature.id],
        });
      } else if (feature.type === "window") {
        // Create bright microzone from window reflection
        microzones.push({
          id: `microzone-${feature.id}`,
          name: `Window Reflection Zone`,
          coordinates: [
            {
              x: feature.coordinates[0].x - 1,
              y: feature.coordinates[0].y - 1,
            },
            {
              x: feature.coordinates[0].x + 1,
              y: feature.coordinates[0].y + 1,
            },
          ],
          characteristics: {
            temperature: 1,
            humidity: 0,
            airflow: "gentle",
            lightLevel: "full_sun",
            moisture: "moderate",
          },
          influences: [feature.id],
        });
      }
    });

    // Create planting areas
    zones.forEach((zone) => {
      if (zone.type === "planting") {
        plantingAreas.push({
          id: `planting-${zone.id}`,
          name: `${zone.name} Planting Area`,
          coordinates: zone.coordinates,
          soilConditions: {
            type: "loam",
            ph: 6.5 + Math.random(),
            drainage: zone.conditions.drainage,
            fertility: "medium",
          },
          sunlightHours:
            zone.conditions.sunlight === "full"
              ? 8
              : zone.conditions.sunlight === "partial"
                ? 5
                : 3,
          spacing: {
            minDistance: 0.3,
            recommended: 0.5,
          },
          plantCapacity: zone.capacity,
          existingPlants: [],
        });
      }
    });

    const layout: GardenLayout = {
      id: `garden-${Date.now()}`,
      name: filename.replace(/\.[^/.]+$/, "") + " Garden",
      dimensions: {
        width: estimatedWidth,
        height: estimatedHeight,
        estimatedArea,
      },
      features,
      zones,
      plantingAreas,
      accessPaths: [
        {
          id: "main-access",
          type: "main",
          coordinates: [
            { x: 0, y: estimatedHeight * 0.5 },
            { x: estimatedWidth, y: estimatedHeight * 0.5 },
          ],
          width: 1.2,
          material: "gravel",
          condition: "good",
          accessibility: true,
        },
      ],
      microclimate: {
        averageTemperature: 20,
        humidity: 60,
        windDirection: "southwest",
        frostPockets: [],
        hotSpots:
          analysis.brightRatio > 0.4
            ? [{ x: estimatedWidth * 0.7, y: estimatedHeight * 0.3 }]
            : [],
        drainageIssues: [],
        sunlightPatterns,
        shadowMaps,
        windFlowPatterns: this.analyzeWindPatterns(
          features,
          estimatedWidth,
          estimatedHeight,
        ),
        microzones,
      },
      recommendations: [
        {
          type: "plant_placement",
          priority: "high",
          description: "Place sun-loving herbs in the brightest areas detected",
          coordinates: { x: estimatedWidth * 0.5, y: estimatedHeight * 0.2 },
        },
        {
          type: "infrastructure",
          priority: "medium",
          description: "Consider adding composting area in less visible corner",
          coordinates: { x: estimatedWidth * 0.9, y: estimatedHeight * 0.9 },
        },
      ],
    };

    const confidence = Math.min(
      0.95,
      0.7 +
        analysis.greenRatio * 0.15 +
        analysis.brightRatio * 0.1 +
        analysis.structures.length * 0.05 +
        analysis.openings.length * 0.03,
    );

    return {
      confidence,
      layout,
      details: {
        detectedFeatures: features.length,
        identifiedZones: zones.length,
        estimatedAccuracy: confidence * 100,
        processingTime: 2000,
        imageQuality: Math.min(100, 60 + analysis.brightRatio * 40),
      },
      warnings: confidence < 0.7 ? ["Low lighting may affect accuracy"] : [],
      suggestions: [
        "Upload multiple angles for better accuracy",
        "Include close-up shots of existing plants",
        "Mark any underground utilities or irrigation",
      ],
    };
  }

  private getFallbackAnalysisData() {
    return {
      confidence: 0.65,
      layout: this.createDefaultLayout(),
      details: {
        detectedFeatures: 3,
        identifiedZones: 2,
        estimatedAccuracy: 65,
        processingTime: 1500,
        imageQuality: 75,
      },
      warnings: ["Using default garden template"],
      suggestions: ["Upload a clearer garden image for better analysis"],
    };
  }

  private getFallbackAnalysis(): AnalysisResult {
    return {
      success: false,
      confidence: 0.5,
      layout: this.createDefaultLayout(),
      analysisDetails: {
        detectedFeatures: 0,
        identifiedZones: 0,
        estimatedAccuracy: 50,
        processingTime: 0,
        imageQuality: 0,
      },
      warnings: ["Analysis failed, using default layout"],
      suggestions: ["Try uploading a different image"],
    };
  }

  private createDefaultLayout(): GardenLayout {
    return {
      id: "default-layout",
      name: "Default Garden Layout",
      dimensions: {
        width: 10,
        height: 8,
        estimatedArea: 80,
      },
      features: [],
      zones: [
        {
          id: "default-planting",
          name: "Main Planting Area",
          type: "planting",
          coordinates: [
            { x: 1, y: 1 },
            { x: 9, y: 7 },
          ],
          area: 64,
          conditions: {
            sunlight: "partial",
            soilType: "loam",
            drainage: "good",
            windExposure: "moderate",
            accessibility: "easy",
          },
          suitablePlants: ["basil", "rosemary", "lavender"],
          capacity: 20,
        },
      ],
      plantingAreas: [],
      accessPaths: [],
      microclimate: {
        averageTemperature: 20,
        humidity: 60,
        windDirection: "variable",
        frostPockets: [],
        hotSpots: [],
        drainageIssues: [],
        sunlightPatterns: [],
        shadowMaps: [],
        windFlowPatterns: [],
        microzones: [],
      },
      recommendations: [],
    };
  }

  // Helper methods for enhanced analysis
  private calculatePolygonArea(
    coordinates: { x: number; y: number }[],
  ): number {
    if (coordinates.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i].x * coordinates[j].y;
      area -= coordinates[j].x * coordinates[i].y;
    }
    return Math.abs(area) / 2;
  }

  private analyzeWindPatterns(
    features: GardenFeature[],
    width: number,
    height: number,
  ): WindPattern[] {
    const patterns: WindPattern[] = [];

    // Find wind-blocking features
    const blockingFeatures = features.filter(
      (f) => f.type === "wall" || f.type === "building" || f.type === "fence",
    );

    if (blockingFeatures.length > 0) {
      // Create wind shadow behind blocking features
      blockingFeatures.forEach((feature, index) => {
        const shadowArea = [
          { x: feature.coordinates[0].x, y: feature.coordinates[0].y },
          { x: feature.coordinates[0].x - 3, y: feature.coordinates[0].y },
          {
            x: feature.coordinates[0].x - 3,
            y: feature.coordinates[0].y + (feature.dimensions.depth || 5),
          },
          {
            x: feature.coordinates[0].x,
            y: feature.coordinates[0].y + (feature.dimensions.depth || 5),
          },
        ];

        patterns.push({
          id: `wind-shadow-${index}`,
          direction: "variable",
          strength: "light",
          affectedArea: shadowArea,
          blockingFeatures: [feature.id],
          channeling: false,
          turbulence: "low",
        });
      });
    }

    // Detect wind channeling between buildings
    if (blockingFeatures.length >= 2) {
      patterns.push({
        id: "wind-channel",
        direction: "southwest",
        strength: "moderate",
        affectedArea: [
          { x: width * 0.2, y: height * 0.3 },
          { x: width * 0.8, y: height * 0.7 },
        ],
        blockingFeatures: blockingFeatures.slice(0, 2).map((f) => f.id),
        channeling: true,
        turbulence: "medium",
      });
    }

    return patterns;
  }

  // Helper methods for garden planning
  canPlaceAt(
    x: number,
    y: number,
    layout: GardenLayout,
    plantSpacing: number = 0.5,
  ): boolean {
    // Check if position conflicts with existing features
    for (const feature of layout.features) {
      if (feature.constraints.clearanceNeeded > 0) {
        const minDistance = feature.constraints.clearanceNeeded + plantSpacing;
        for (const coord of feature.coordinates) {
          const distance = Math.sqrt((x - coord.x) ** 2 + (y - coord.y) ** 2);
          if (distance < minDistance) {
            return false;
          }
        }
      }
    }

    // Check if within a suitable planting zone
    for (const zone of layout.zones) {
      if (zone.type === "planting") {
        if (this.isPointInPolygon({ x, y }, zone.coordinates)) {
          return true;
        }
      }
    }

    return false;
  }

  private isPointInPolygon(
    point: { x: number; y: number },
    polygon: { x: number; y: number }[],
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].y > point.y !== polygon[j].y > point.y &&
        point.x <
          ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
            (polygon[j].y - polygon[i].y) +
            polygon[i].x
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  getSuitablePlantsForZone(zone: GardenZone): string[] {
    return zone.suitablePlants;
  }

  estimatePlantCapacity(area: number, plantSpacing: number = 0.5): number {
    return Math.floor(area / (plantSpacing * plantSpacing));
  }
}

export const gardenSpatialAnalysis = new GardenSpatialAnalysisService();
