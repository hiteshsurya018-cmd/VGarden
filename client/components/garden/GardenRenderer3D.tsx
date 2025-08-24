import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  Html,
  Text,
  Box,
  Plane,
  Sphere,
  Cylinder,
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { PlantInstance } from '../../store/slices/gardenSlice';

interface GardenRenderer3DProps {
  gardenData: {
    layout: {
      width: number;
      height: number;
      zones: Array<{
        id: string;
        type: string;
        polygon: number[][];
        confidence: number;
      }>;
    };
    plants: PlantInstance[];
  };
  onPlantClick?: (plant: PlantInstance) => void;
  onPlantDrag?: (plantId: string, position: { x: number; y: number; z: number }) => void;
  mode?: 'view' | 'edit';
  showGrid?: boolean;
  showZones?: boolean;
}

// Individual plant component
const Plant3D: React.FC<{
  plant: PlantInstance;
  onClick?: () => void;
  onDrag?: (position: { x: number; y: number; z: number }) => void;
  isSelected?: boolean;
  mode?: 'view' | 'edit';
}> = ({ plant, onClick, onDrag, isSelected = false, mode = 'view' }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Animation for growth and movement
  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      // Gentle swaying animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      // Breathing effect for selected plants
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const getPlantGeometry = () => {
    const category = plant.species.category.toLowerCase();
    switch (category) {
      case 'tree':
        return { stem: [0.3, 2, 0.3], crown: [1.5] };
      case 'flower':
        return { stem: [0.1, 1, 0.1], crown: [0.5] };
      case 'herb':
        return { stem: [0.15, 0.8, 0.15], crown: [0.7] };
      case 'vegetable':
        return { stem: [0.2, 1.2, 0.2], crown: [0.8] };
      default:
        return { stem: [0.2, 1, 0.2], crown: [0.6] };
    }
  };

  const getPlantColor = () => {
    const health = plant.health / 100;
    const growth = plant.growthStage / 100;
    
    // Health affects saturation
    const saturation = Math.max(0.3, health);
    
    // Growth affects brightness
    const lightness = 0.3 + (growth * 0.4);
    
    return new THREE.Color().setHSL(0.25, saturation, lightness);
  };

  const geometry = getPlantGeometry();
  const plantColor = getPlantColor();
  const scale = (plant.scale || 1) * (plant.growthStage / 100);

  const handlePointerDown = (event: any) => {
    if (mode === 'edit') {
      event.stopPropagation();
      setIsDragging(true);
    }
  };

  const handlePointerMove = (event: any) => {
    if (isDragging && mode === 'edit') {
      const { point } = event;
      onDrag?.({ x: point.x, y: point.y, z: point.z });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointerup', handlePointerUp);
      return () => document.removeEventListener('pointerup', handlePointerUp);
    }
  }, [isDragging]);

  return (
    <group
      ref={meshRef}
      position={[plant.x, plant.y, plant.z || 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Plant stem */}
      <Cylinder
        args={[geometry.stem[0] * scale, geometry.stem[0] * scale, geometry.stem[1] * scale]}
        position={[0, geometry.stem[1] * scale / 2, 0]}
      >
        <meshStandardMaterial color="#4a5d23" />
      </Cylinder>

      {/* Plant crown/foliage */}
      <Sphere
        args={[geometry.crown[0] * scale]}
        position={[0, geometry.stem[1] * scale + geometry.crown[0] * scale, 0]}
      >
        <meshStandardMaterial color={plantColor} />
      </Sphere>

      {/* Selection indicator */}
      {isSelected && (
        <Cylinder
          args={[1.2 * scale, 1.2 * scale, 0.05]}
          position={[0, 0.025, 0]}
        >
          <meshStandardMaterial color="#ffeb3b" transparent opacity={0.6} />
        </Cylinder>
      )}

      {/* Plant info on hover */}
      {hovered && (
        <Html position={[0, geometry.stem[1] * scale + geometry.crown[0] * scale + 0.5, 0]} center>
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none">
            <div className="font-semibold">{plant.species.name}</div>
            <div className="text-gray-600">{plant.species.scientificName}</div>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between gap-4">
                <span>Growth:</span>
                <span className="font-medium">{plant.growthStage}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Health:</span>
                <span className="font-medium">{plant.health}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Water:</span>
                <span className="font-medium">{plant.waterLevel}%</span>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Health/water indicators */}
      {plant.waterLevel < 30 && (
        <Html position={[0.5, geometry.stem[1] * scale, 0]} center>
          <div className="text-blue-500 text-xl">💧</div>
        </Html>
      )}
      
      {plant.health < 50 && (
        <Html position={[-0.5, geometry.stem[1] * scale, 0]} center>
          <div className="text-red-500 text-xl">⚠️</div>
        </Html>
      )}
    </group>
  );
};

// Garden zone visualization
const GardenZone3D: React.FC<{
  zone: {
    id: string;
    type: string;
    polygon: number[][];
    confidence: number;
  };
  visible: boolean;
}> = ({ zone, visible }) => {
  if (!visible) return null;

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'planting_area':
        return '#4ade80';
      case 'path':
        return '#d97706';
      case 'water_feature':
        return '#06b6d4';
      case 'structure':
        return '#6b7280';
      default:
        return '#8b5cf6';
    }
  };

  // Calculate center and size from polygon
  const avgX = zone.polygon.reduce((sum, point) => sum + point[0], 0) / zone.polygon.length;
  const avgY = zone.polygon.reduce((sum, point) => sum + point[1], 0) / zone.polygon.length;
  
  const minX = Math.min(...zone.polygon.map(p => p[0]));
  const maxX = Math.max(...zone.polygon.map(p => p[0]));
  const minY = Math.min(...zone.polygon.map(p => p[1]));
  const maxY = Math.max(...zone.polygon.map(p => p[1]));
  
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <Plane
      args={[width, height]}
      position={[avgX, 0.01, avgY]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial
        color={getZoneColor(zone.type)}
        transparent
        opacity={0.3}
      />
    </Plane>
  );
};

// Ground plane with grass texture
const GroundPlane: React.FC<{
  width: number;
  height: number;
  showGrid: boolean;
}> = ({ width, height, showGrid }) => {
  return (
    <>
      {/* Main ground */}
      <Plane
        args={[width, height]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#4ade80" />
      </Plane>

      {/* Grid overlay */}
      {showGrid && (
        <Plane
          args={[width, height]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, 0]}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            wireframe
          />
        </Plane>
      )}
    </>
  );
};

// Weather effects
const WeatherEffects: React.FC<{ weather?: 'sunny' | 'rainy' | 'cloudy' }> = ({ weather = 'sunny' }) => {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (particlesRef.current && weather === 'rainy') {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  if (weather === 'rainy') {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    return (
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={particleCount}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#87ceeb" size={0.1} />
      </points>
    );
  }

  return null;
};

// Main garden renderer component
const GardenRenderer3D: React.FC<GardenRenderer3DProps> = ({
  gardenData,
  onPlantClick,
  onPlantDrag,
  mode = 'view',
  showGrid = true,
  showZones = true,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 10, 10]);

  const handlePlantClick = (plant: PlantInstance) => {
    setSelectedPlantId(plant.id === selectedPlantId ? null : plant.id);
    onPlantClick?.(plant);
  };

  const handlePlantDrag = (plantId: string, position: { x: number; y: number; z: number }) => {
    onPlantDrag?.(plantId, position);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={cameraPosition}
            fov={60}
          />

          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Ground */}
          <GroundPlane
            width={gardenData.layout.width}
            height={gardenData.layout.height}
            showGrid={showGrid}
          />

          {/* Garden zones */}
          {showZones && gardenData.layout.zones.map((zone) => (
            <GardenZone3D
              key={zone.id}
              zone={zone}
              visible={showZones}
            />
          ))}

          {/* Plants */}
          {gardenData.plants.map((plant) => (
            <Plant3D
              key={plant.id}
              plant={plant}
              onClick={() => handlePlantClick(plant)}
              onDrag={(position) => handlePlantDrag(plant.id, position)}
              isSelected={plant.id === selectedPlantId}
              mode={mode}
            />
          ))}

          {/* Weather effects */}
          <WeatherEffects weather="sunny" />

          {/* Garden boundaries */}
          <group>
            {[
              [-gardenData.layout.width / 2, 0, -gardenData.layout.height / 2],
              [gardenData.layout.width / 2, 0, -gardenData.layout.height / 2],
              [gardenData.layout.width / 2, 0, gardenData.layout.height / 2],
              [-gardenData.layout.width / 2, 0, gardenData.layout.height / 2],
            ].map((pos, index) => (
              <Box
                key={index}
                args={[0.1, 0.5, 0.1]}
                position={pos as [number, number, number]}
              >
                <meshStandardMaterial color="#8b4513" />
              </Box>
            ))}
          </group>

          {/* Controls */}
          <OrbitControls
            enablePan={mode === 'edit'}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg"
        >
          <h3 className="font-semibold text-sm">Garden Stats</h3>
          <div className="text-xs space-y-1 mt-2">
            <div>Plants: {gardenData.plants.length}</div>
            <div>Size: {gardenData.layout.width.toFixed(1)}m × {gardenData.layout.height.toFixed(1)}m</div>
            <div>Zones: {gardenData.layout.zones.length}</div>
          </div>
        </motion.div>

        {selectedPlantId && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg"
          >
            <h3 className="font-semibold text-sm">Selected Plant</h3>
            {(() => {
              const plant = gardenData.plants.find(p => p.id === selectedPlantId);
              if (!plant) return null;
              
              return (
                <div className="text-xs space-y-1 mt-2">
                  <div className="font-medium">{plant.species.name}</div>
                  <div>Growth: {plant.growthStage}%</div>
                  <div>Health: {plant.health}%</div>
                  <div>Water: {plant.waterLevel}%</div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* Camera controls */}
      <div className="absolute top-4 right-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg space-y-2"
        >
          <button
            onClick={() => setCameraPosition([0, 15, 0])}
            className="block w-full text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Top View
          </button>
          <button
            onClick={() => setCameraPosition([15, 5, 0])}
            className="block w-full text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Side View
          </button>
          <button
            onClick={() => setCameraPosition([10, 10, 10])}
            className="block w-full text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            3D View
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default GardenRenderer3D;
