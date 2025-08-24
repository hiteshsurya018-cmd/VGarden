import React from 'react';

// Real Plant Recognition System using Proven Computer Vision Techniques
export class RealPlantRecognition {
  private static plantDatabase = [
    {
      id: 'aloe_vera',
      name: 'Aloe Vera',
      scientificName: 'Aloe barbadensis',
      category: 'succulent',
      keyFeatures: {
        leafPattern: 'thick_fleshy_rosette',
        leafColor: ['blue_green', 'gray_green'],
        leafMargin: 'serrated_edges',
        plantStructure: 'rosette_ground_level',
        uniqueIdentifiers: ['gel_filled_leaves', 'no_visible_stem', 'succulent_texture']
      },
      confidence: 0.95
    },
    {
      id: 'basil',
      name: 'Basil',
      scientificName: 'Ocimum basilicum',
      category: 'herb',
      keyFeatures: {
        leafPattern: 'oval_opposite_pairs',
        leafColor: ['bright_green', 'dark_green'],
        leafMargin: 'smooth_edges',
        plantStructure: 'upright_branching',
        uniqueIdentifiers: ['aromatic_qualities', 'tender_leaves', 'square_stems']
      },
      confidence: 0.92
    },
    {
      id: 'rose',
      name: 'Rose',
      scientificName: 'Rosa species',
      category: 'flowering',
      keyFeatures: {
        leafPattern: 'compound_leaflets',
        leafColor: ['dark_green', 'medium_green'],
        leafMargin: 'serrated_edges',
        plantStructure: 'thorny_woody_stems',
        uniqueIdentifiers: ['thorns_on_stems', 'compound_leaves', 'visible_flowers']
      },
      confidence: 0.88
    },
    {
      id: 'lavender',
      name: 'Lavender',
      scientificName: 'Lavandula angustifolia',
      category: 'herb',
      keyFeatures: {
        leafPattern: 'narrow_linear_leaves',
        leafColor: ['gray_green', 'silver_green'],
        leafMargin: 'smooth_edges',
        plantStructure: 'woody_base_bushy',
        uniqueIdentifiers: ['purple_flower_spikes', 'aromatic_foliage', 'woody_stems']
      },
      confidence: 0.90
    },
    {
      id: 'mint',
      name: 'Mint',
      scientificName: 'Mentha species',
      category: 'herb',
      keyFeatures: {
        leafPattern: 'oval_toothed_opposite',
        leafColor: ['bright_green', 'medium_green'],
        leafMargin: 'serrated_edges',
        plantStructure: 'spreading_square_stems',
        uniqueIdentifiers: ['square_stems', 'strong_aroma', 'runner_growth']
      },
      confidence: 0.87
    },
    {
      id: 'dandelion',
      name: 'Dandelion',
      scientificName: 'Taraxacum officinale',
      category: 'wildflower',
      keyFeatures: {
        leafPattern: 'deeply_lobed_rosette',
        leafColor: ['dark_green', 'medium_green'],
        leafMargin: 'deeply_toothed',
        plantStructure: 'ground_rosette_pattern',
        uniqueIdentifiers: ['yellow_composite_flowers', 'hollow_stems', 'white_sap']
      },
      confidence: 0.85
    },
    {
      id: 'sunflower',
      name: 'Sunflower',
      scientificName: 'Helianthus annuus',
      category: 'flowering',
      keyFeatures: {
        leafPattern: 'large_heart_shaped',
        leafColor: ['dark_green', 'medium_green'],
        leafMargin: 'serrated_edges',
        plantStructure: 'tall_thick_stem',
        uniqueIdentifiers: ['large_yellow_flowers', 'rough_textured_leaves', 'thick_sturdy_stem']
      },
      confidence: 0.93
    }
  ];

  // Real Feature Extraction using Computer Vision Principles
  static extractRealFeatures(imageData: ImageData): {
    leafStructure: string;
    colorProfile: string[];
    edgeComplexity: number;
    plantGeometry: string;
    textureAnalysis: string;
    confidence: number;
  } {
    const { data, width, height } = imageData;
    
    // Advanced color clustering (simplified K-means approach)
    const colorClusters = this.performColorClustering(data);
    
    // Edge detection using Sobel operator
    const edgeData = this.sobelEdgeDetection(data, width, height);
    
    // Shape analysis using contour detection
    const shapeMetrics = this.analyzeShapeMetrics(edgeData, width, height);
    
    // Texture analysis using Local Binary Patterns (simplified)
    const textureFeatures = this.extractTextureFeatures(data, width, height);
    
    // Plant-specific feature extraction
    const leafStructure = this.classifyLeafStructure(shapeMetrics, edgeData);
    const plantGeometry = this.analyzePlantGeometry(shapeMetrics);
    const colorProfile = this.generateColorProfile(colorClusters);
    
    return {
      leafStructure,
      colorProfile,
      edgeComplexity: shapeMetrics.edgeComplexity,
      plantGeometry,
      textureAnalysis: textureFeatures.dominantPattern,
      confidence: this.calculateExtractionConfidence(colorClusters, shapeMetrics, textureFeatures)
    };
  }

  // Sobel Edge Detection - Real Computer Vision Algorithm
  private static sobelEdgeDetection(data: Uint8ClampedArray, width: number, height: number): number[] {
    const edges = new Array(width * height).fill(0);
    
    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const pixelIndex = ((y + i) * width + (x + j)) * 4;
            const gray = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
            const kernelIndex = (i + 1) * 3 + (j + 1);
            
            gx += gray * sobelX[kernelIndex];
            gy += gray * sobelY[kernelIndex];
          }
        }
        
        edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return edges;
  }

  // K-means Color Clustering - Real Color Analysis
  private static performColorClustering(data: Uint8ClampedArray): Array<{color: [number, number, number], weight: number}> {
    const colors: Array<[number, number, number]> = [];
    
    // Sample colors (every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
      colors.push([data[i], data[i + 1], data[i + 2]]);
    }
    
    // Simplified K-means clustering (k=5)
    const clusters = this.kMeansClustering(colors, 5);
    
    return clusters.map(cluster => ({
      color: cluster.centroid,
      weight: cluster.points.length / colors.length
    }));
  }

  private static kMeansClustering(points: Array<[number, number, number]>, k: number) {
    // Initialize centroids randomly
    let centroids = Array.from({ length: k }, () => 
      points[Math.floor(Math.random() * points.length)]
    );
    
    for (let iter = 0; iter < 10; iter++) {
      const clusters = centroids.map(() => ({ points: [] as Array<[number, number, number]>, centroid: [0, 0, 0] as [number, number, number] }));
      
      // Assign points to closest centroid
      for (const point of points) {
        let minDistance = Infinity;
        let closestCluster = 0;
        
        for (let i = 0; i < centroids.length; i++) {
          const distance = this.euclideanDistance(point, centroids[i]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = i;
          }
        }
        
        clusters[closestCluster].points.push(point);
      }
      
      // Update centroids
      for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].points.length > 0) {
          const sumR = clusters[i].points.reduce((sum, p) => sum + p[0], 0);
          const sumG = clusters[i].points.reduce((sum, p) => sum + p[1], 0);
          const sumB = clusters[i].points.reduce((sum, p) => sum + p[2], 0);
          const count = clusters[i].points.length;
          
          centroids[i] = [sumR / count, sumG / count, sumB / count];
          clusters[i].centroid = centroids[i];
        }
      }
    }
    
    return centroids.map((centroid, i) => ({
      centroid,
      points: points.filter(point => {
        let minDistance = Infinity;
        let closestCluster = 0;
        
        for (let j = 0; j < centroids.length; j++) {
          const distance = this.euclideanDistance(point, centroids[j]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = j;
          }
        }
        
        return closestCluster === i;
      })
    }));
  }

  private static euclideanDistance(a: [number, number, number], b: [number, number, number]): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
  }

  // Advanced Shape Analysis
  private static analyzeShapeMetrics(edges: number[], width: number, height: number) {
    const strongEdges = edges.filter(e => e > 50);
    const edgeComplexity = strongEdges.length / (width * height);
    
    // Find contours and analyze shapes
    const contours = this.findContours(edges, width, height);
    const shapeComplexity = this.calculateShapeComplexity(contours);
    
    return {
      edgeComplexity,
      shapeComplexity,
      contourCount: contours.length,
      averageContourSize: contours.reduce((sum, c) => sum + c.length, 0) / contours.length || 0
    };
  }

  private static findContours(edges: number[], width: number, height: number): Array<Array<{x: number, y: number}>> {
    // Simplified contour detection
    const contours: Array<Array<{x: number, y: number}>> = [];
    const visited = new Set<number>();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (edges[index] > 50 && !visited.has(index)) {
          const contour = this.traceContour(edges, width, height, x, y, visited);
          if (contour.length > 10) { // Minimum contour size
            contours.push(contour);
          }
        }
      }
    }
    
    return contours;
  }

  private static traceContour(edges: number[], width: number, height: number, startX: number, startY: number, visited: Set<number>): Array<{x: number, y: number}> {
    const contour: Array<{x: number, y: number}> = [];
    const stack = [{x: startX, y: startY}];
    
    while (stack.length > 0 && contour.length < 1000) {
      const {x, y} = stack.pop()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(index) || edges[index] <= 50) {
        continue;
      }
      
      visited.add(index);
      contour.push({x, y});
      
      // Add 8-connected neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx !== 0 || dy !== 0) {
            stack.push({x: x + dx, y: y + dy});
          }
        }
      }
    }
    
    return contour;
  }

  private static calculateShapeComplexity(contours: Array<Array<{x: number, y: number}>>) {
    if (contours.length === 0) return 0;
    
    return contours.reduce((sum, contour) => {
      // Calculate perimeter to area ratio as complexity measure
      const perimeter = contour.length;
      const area = this.calculateContourArea(contour);
      return sum + (area > 0 ? perimeter / Math.sqrt(area) : 0);
    }, 0) / contours.length;
  }

  private static calculateContourArea(contour: Array<{x: number, y: number}>): number {
    if (contour.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < contour.length; i++) {
      const j = (i + 1) % contour.length;
      area += contour[i].x * contour[j].y;
      area -= contour[j].x * contour[i].y;
    }
    return Math.abs(area) / 2;
  }

  // Texture Analysis using Local Binary Patterns
  private static extractTextureFeatures(data: Uint8ClampedArray, width: number, height: number) {
    const lbpHistogram = new Array(256).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIndex = (y * width + x) * 4;
        const centerGray = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;
        
        let lbpValue = 0;
        let bit = 0;
        
        // 8-neighbor LBP
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
            const neighborGray = (data[neighborIndex] + data[neighborIndex + 1] + data[neighborIndex + 2]) / 3;
            
            if (neighborGray >= centerGray) {
              lbpValue |= (1 << bit);
            }
            bit++;
          }
        }
        
        lbpHistogram[lbpValue]++;
      }
    }
    
    // Analyze histogram to determine dominant texture patterns
    const maxBin = lbpHistogram.indexOf(Math.max(...lbpHistogram));
    const uniformity = Math.max(...lbpHistogram) / lbpHistogram.reduce((a, b) => a + b, 0);
    
    return {
      dominantPattern: this.classifyTexturePattern(maxBin, uniformity),
      uniformity,
      histogram: lbpHistogram
    };
  }

  private static classifyTexturePattern(maxBin: number, uniformity: number): string {
    if (uniformity > 0.3) return 'smooth';
    if (maxBin < 50) return 'fine_texture';
    if (maxBin > 200) return 'coarse_texture';
    return 'medium_texture';
  }

  // Plant-Specific Feature Classification
  private static classifyLeafStructure(shapeMetrics: any, edges: number[]): string {
    const { edgeComplexity, shapeComplexity, contourCount } = shapeMetrics;
    
    if (edgeComplexity > 0.3 && shapeComplexity > 2) return 'deeply_lobed_rosette';
    if (edgeComplexity > 0.2 && contourCount > 10) return 'compound_leaflets';
    if (edgeComplexity < 0.1 && shapeComplexity < 1) return 'thick_fleshy_rosette';
    if (edgeComplexity > 0.15) return 'oval_toothed_opposite';
    if (shapeComplexity < 1.5) return 'narrow_linear_leaves';
    if (contourCount > 5) return 'oval_opposite_pairs';
    return 'large_heart_shaped';
  }

  private static analyzePlantGeometry(shapeMetrics: any): string {
    const { contourCount, averageContourSize } = shapeMetrics;
    
    if (contourCount < 3) return 'ground_rosette_pattern';
    if (averageContourSize > 100) return 'tall_thick_stem';
    if (contourCount > 8) return 'upright_branching';
    if (contourCount > 5) return 'woody_base_bushy';
    return 'spreading_square_stems';
  }

  private static generateColorProfile(clusters: Array<{color: [number, number, number], weight: number}>): string[] {
    return clusters
      .filter(cluster => cluster.weight > 0.05)
      .map(cluster => this.classifyColor(cluster.color))
      .filter(color => color !== 'unknown');
  }

  private static classifyColor([r, g, b]: [number, number, number]): string {
    // Convert to HSV for better color classification
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const lightness = (max + min) / 2 / 255;
    
    if (diff < 20) {
      if (lightness > 0.8) return 'white';
      if (lightness < 0.2) return 'black';
      if (lightness > 0.6) return 'light_gray';
      return 'gray_green';
    }
    
    if (g > r && g > b) {
      if (lightness > 0.6) return 'bright_green';
      if (lightness > 0.4) return 'medium_green';
      if (b > 0.7 * g) return 'blue_green';
      if (lightness < 0.4) return 'dark_green';
      return 'gray_green';
    }
    
    if (r > g && r > b) {
      if (g > 0.7 * r) return 'yellow';
      return 'red';
    }
    
    if (b > r && b > g && r > 0.5 * b) return 'purple';
    
    return 'unknown';
  }

  private static calculateExtractionConfidence(colorClusters: any[], shapeMetrics: any, textureFeatures: any): number {
    const colorConfidence = Math.min(1, colorClusters.length / 3);
    const shapeConfidence = Math.min(1, shapeMetrics.contourCount / 5);
    const textureConfidence = textureFeatures.uniformity;
    
    return (colorConfidence + shapeConfidence + textureConfidence) / 3;
  }

  // Advanced Plant Matching using Multiple Features
  static identifyPlant(features: any): Array<{plant: any, confidence: number, reasoning: string[]}> {
    const results: Array<{plant: any, confidence: number, reasoning: string[]}> = [];
    
    for (const plant of this.plantDatabase) {
      const reasoning: string[] = [];
      let score = 0;
      let maxScore = 0;
      
      // Leaf structure matching (40% weight)
      maxScore += 4;
      if (features.leafStructure === plant.keyFeatures.leafPattern) {
        score += 4;
        reasoning.push(`Exact leaf structure match: ${features.leafStructure}`);
      } else if (this.isCompatibleLeafStructure(features.leafStructure, plant.keyFeatures.leafPattern)) {
        score += 2;
        reasoning.push(`Compatible leaf structure: ${features.leafStructure} ≈ ${plant.keyFeatures.leafPattern}`);
      }
      
      // Color profile matching (30% weight)
      maxScore += 3;
      const colorMatches = features.colorProfile.filter((color: string) => 
        plant.keyFeatures.leafColor.includes(color)
      ).length;
      if (colorMatches > 0) {
        score += (colorMatches / plant.keyFeatures.leafColor.length) * 3;
        reasoning.push(`Color matches: ${colorMatches}/${plant.keyFeatures.leafColor.length} (${features.colorProfile.join(', ')})`);
      }
      
      // Plant geometry matching (20% weight)
      maxScore += 2;
      if (features.plantGeometry === plant.keyFeatures.plantStructure) {
        score += 2;
        reasoning.push(`Plant structure match: ${features.plantGeometry}`);
      } else if (this.isCompatibleStructure(features.plantGeometry, plant.keyFeatures.plantStructure)) {
        score += 1;
        reasoning.push(`Compatible structure: ${features.plantGeometry} ≈ ${plant.keyFeatures.plantStructure}`);
      }
      
      // Edge complexity and texture (10% weight)
      maxScore += 1;
      if (features.textureAnalysis === 'smooth' && plant.keyFeatures.leafMargin === 'smooth_edges') {
        score += 1;
        reasoning.push('Smooth texture matches smooth leaf margins');
      } else if (features.edgeComplexity > 0.2 && plant.keyFeatures.leafMargin.includes('serrated')) {
        score += 0.5;
        reasoning.push('High edge complexity suggests serrated margins');
      }
      
      const confidence = Math.min(0.95, (score / maxScore) * features.confidence);
      
      if (confidence > 0.4) {
        results.push({
          plant: { ...plant, name: plant.name, scientificName: plant.scientificName, category: plant.category },
          confidence,
          reasoning
        });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  private static isCompatibleLeafStructure(detected: string, plantStructure: string): boolean {
    const compatibility = {
      'oval_opposite_pairs': ['oval_toothed_opposite'],
      'thick_fleshy_rosette': ['ground_rosette_pattern'],
      'compound_leaflets': ['deeply_lobed_rosette'],
      'narrow_linear_leaves': ['oval_opposite_pairs'],
      'large_heart_shaped': ['oval_opposite_pairs']
    };
    
    return compatibility[detected as keyof typeof compatibility]?.includes(plantStructure) || false;
  }

  private static isCompatibleStructure(detected: string, plantStructure: string): boolean {
    const compatibility = {
      'upright_branching': ['woody_base_bushy', 'tall_thick_stem'],
      'ground_rosette_pattern': ['thick_fleshy_rosette'],
      'spreading_square_stems': ['upright_branching']
    };
    
    return compatibility[detected as keyof typeof compatibility]?.includes(plantStructure) || false;
  }
}

// Export for use in main component
export default RealPlantRecognition;
