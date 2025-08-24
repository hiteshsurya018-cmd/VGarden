import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setCurrentGarden, waterPlant, harvestPlant } from '../../store/slices/gardenSlice';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  Settings,
  Camera,
  Droplets,
  Scissors,
  Plus,
  Eye,
  Grid3X3,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GardenRenderer3D from './GardenRenderer3D';
import UnifiedGardenAnalysis from '../UnifiedGardenAnalysis';

const GardenView: React.FC = () => {
  const { gardenId } = useParams<{ gardenId: string }>();
  const dispatch = useAppDispatch();
  const { currentGarden, gardens } = useAppSelector((state) => state.garden);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [showGrid, setShowGrid] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (gardenId && gardens.length > 0) {
      const garden = gardens.find(g => g.id === gardenId);
      if (garden) {
        dispatch(setCurrentGarden(garden));
      }
    }
  }, [gardenId, gardens, dispatch]);

  const handlePlantAction = async (plantId: string, action: 'water' | 'harvest') => {
    if (action === 'water') {
      await dispatch(waterPlant(plantId));
    } else if (action === 'harvest') {
      await dispatch(harvestPlant(plantId));
    }
  };

  const handlePlantDrag = (plantId: string, position: { x: number; y: number; z: number }) => {
    // Update plant position in real-time
    console.log(`Moving plant ${plantId} to:`, position);
  };

  if (!currentGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Garden not found</div>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const gardenData = {
    layout: {
      width: currentGarden.width || 10,
      height: currentGarden.height || 8,
      zones: currentGarden.layoutData?.layout?.zones || [],
    },
    plants: currentGarden.plants || [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentGarden.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Level {currentGarden.level}</span>
                  <span>{currentGarden.plantsCount} plants</span>
                  <span>
                    {currentGarden.width?.toFixed(1)}m × {currentGarden.height?.toFixed(1)}m
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showAnalysis ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                <Camera className="w-4 h-4 mr-2" />
                AI Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {showAnalysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Garden Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedGardenAnalysis
                  onAnalysisComplete={(result) => {
                    console.log('Analysis complete:', result);
                    setShowAnalysis(false);
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Garden View */}
            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Garden View
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'view' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode('view')}
                      >
                        View
                      </Button>
                      <Button
                        variant={viewMode === 'edit' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode('edit')}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={showGrid ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowGrid(!showGrid)}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={showZones ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowZones(!showZones)}
                      >
                        <Layers className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[520px]">
                  <GardenRenderer3D
                    gardenData={gardenData}
                    onPlantDrag={handlePlantDrag}
                    mode={viewMode}
                    showGrid={showGrid}
                    showZones={showZones}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Garden Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Garden Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Level</span>
                    <Badge variant="secondary">{currentGarden.level}</Badge>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Experience</span>
                      <span className="text-sm font-medium">
                        {currentGarden.experience} / {currentGarden.level * 100}
                      </span>
                    </div>
                    <Progress value={(currentGarden.experience / (currentGarden.level * 100)) * 100} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Plants</span>
                    <span className="font-medium">{currentGarden.plantsCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Size</span>
                    <span className="font-medium">
                      {currentGarden.width?.toFixed(1)}m × {currentGarden.height?.toFixed(1)}m
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plant
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Droplets className="w-4 h-4 mr-2" />
                    Water All
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Scissors className="w-4 h-4 mr-2" />
                    Harvest Ready
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </CardContent>
              </Card>

              {/* Plant Care */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plant Care</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentGarden.plants.length > 0 ? (
                    <div className="space-y-3">
                      {currentGarden.plants.slice(0, 3).map((plant) => (
                        <div key={plant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{plant.species.name}</div>
                            <div className="text-xs text-gray-600">
                              Health: {plant.health}% | Water: {plant.waterLevel}%
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePlantAction(plant.id, 'water')}
                              disabled={plant.waterLevel > 80}
                            >
                              <Droplets className="w-3 h-3" />
                            </Button>
                            {plant.growthStage >= 80 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePlantAction(plant.id, 'harvest')}
                              >
                                <Scissors className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {currentGarden.plants.length > 3 && (
                        <div className="text-center text-sm text-gray-500">
                          +{currentGarden.plants.length - 3} more plants
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <div className="text-sm">No plants yet</div>
                      <Button size="sm" className="mt-2">
                        Add Your First Plant
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weather */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weather</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-6 h-6 text-yellow-500" />
                      <div>
                        <div className="font-medium">Sunny</div>
                        <div className="text-sm text-gray-600">22°C</div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>Humidity: 65%</div>
                      <div>Perfect for growth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenView;
