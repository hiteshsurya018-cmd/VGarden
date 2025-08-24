/**
 * Enhanced Plant Library Component
 * Comprehensive plant database with search, filtering, and garden integration
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  Search,
  Filter,
  Plus,
  Leaf,
  Heart,
  Sparkles,
  Shield,
  Circle,
  Wind,
  Brain,
  Zap,
  Hand,
  Droplets,
  Sun,
  CloudRain,
  Mountain,
  Clock,
  ChefHat,
  Stethoscope,
  Flower,
  Star,
  AlertTriangle,
  Info,
  BookOpen,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  PLANTS_DATABASE,
  PLANT_CATEGORIES,
  Plant,
  searchPlants,
} from "../data/plantsDatabase";

interface PlantLibraryProps {
  onAddPlantToGarden?: (plant: Plant) => void;
  className?: string;
}

const categoryIcons: Record<string, any> = {
  herbs: Leaf,
  medicinal: Heart,
  aromatic: Sparkles,
  adaptogenic: Shield,
  digestive: Circle,
  respiratory: Wind,
  nervous: Brain,
  immune: Zap,
  topical: Hand,
  detox: Droplets,
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  challenging: "bg-red-100 text-red-800",
};

const rarityColors = {
  common: "bg-gray-100 text-gray-800",
  uncommon: "bg-blue-100 text-blue-800",
  rare: "bg-purple-100 text-purple-800",
};

export const PlantLibrary: React.FC<PlantLibraryProps> = ({
  onAddPlantToGarden,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "difficulty" | "rarity">(
    "name",
  );
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtered and sorted plants
  const filteredPlants = useMemo(() => {
    let plants = searchPlants(
      searchQuery,
      selectedCategory === "all" ? undefined : selectedCategory,
    );

    // Sort plants
    plants.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "difficulty":
          const difficultyOrder = { easy: 1, moderate: 2, challenging: 3 };
          return (
            difficultyOrder[a.growingConditions.difficulty] -
            difficultyOrder[b.growingConditions.difficulty]
          );
        case "rarity":
          const rarityOrder = { common: 1, uncommon: 2, rare: 3 };
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        default:
          return 0;
      }
    });

    return plants;
  }, [searchQuery, selectedCategory, sortBy]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    Object.keys(PLANT_CATEGORIES).forEach((category) => {
      stats[category] = PLANTS_DATABASE.filter(
        (plant) => plant.category === category,
      ).length;
    });
    return stats;
  }, []);

  const handleAddToGarden = (plant: Plant) => {
    if (onAddPlantToGarden) {
      onAddPlantToGarden(plant);
    }
  };

  const PlantCard: React.FC<{ plant: Plant }> = ({ plant }) => {
    const CategoryIcon = categoryIcons[plant.category] || Leaf;

    return (
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-lg bg-opacity-20`}
                style={{
                  backgroundColor:
                    PLANT_CATEGORIES[plant.category]?.color + "40",
                }}
              >
                <CategoryIcon
                  className="w-4 h-4"
                  style={{ color: PLANT_CATEGORIES[plant.category]?.color }}
                />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold line-clamp-1">
                  {plant.name}
                </CardTitle>
                <CardDescription className="text-xs italic">
                  {plant.scientificName}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge
                className={`text-xs ${difficultyColors[plant.growingConditions.difficulty]}`}
              >
                {plant.growingConditions.difficulty}
              </Badge>
              <Badge className={`text-xs ${rarityColors[plant.rarity]}`}>
                {plant.rarity}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {plant.description}
          </p>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-yellow-500" />
              <span className="capitalize">
                {plant.growingConditions.sunlight}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-blue-500" />
              <span className="capitalize">
                {plant.growingConditions.water}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{plant.harvestTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-500" />
              <span>{plant.origin[0]}</span>
            </div>
          </div>

          {/* Medicinal uses */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {plant.medicinalUses.slice(0, 3).map((use, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {use}
                </Badge>
              ))}
              {plant.medicinalUses.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{plant.medicinalUses.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setSelectedPlant(plant)}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
            </Dialog>

            <Button
              size="sm"
              className="flex-1 text-xs"
              style={{
                backgroundColor: PLANT_CATEGORIES[plant.category]?.color,
              }}
              onClick={() => handleAddToGarden(plant)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Plant Library</h3>
          <p className="text-sm text-gray-600">
            {PLANTS_DATABASE.length} medicinal plants
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          {viewMode === "grid" ? "List" : "Grid"}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search plants, uses, or scientific names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Categories ({PLANTS_DATABASE.length})
              </SelectItem>
              {Object.entries(PLANT_CATEGORIES).map(([key, category]) => {
                const Icon = categoryIcons[key] || Leaf;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4"
                        style={{ color: category.color }}
                      />
                      {category.name} ({categoryStats[key] || 0})
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: "name" | "difficulty" | "rarity") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Overview */}
      {selectedCategory === "all" && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PLANT_CATEGORIES)
            .slice(0, 6)
            .map(([key, category]) => {
              const Icon = categoryIcons[key] || Leaf;
              return (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedCategory(key)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className="w-4 h-4"
                            style={{ color: category.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {categoryStats[key] || 0} plants
                            </p>
                          </div>
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredPlants.length} plant{filteredPlants.length !== 1 ? "s" : ""}{" "}
          found
          {selectedCategory !== "all" &&
            ` in ${PLANT_CATEGORIES[selectedCategory]?.name}`}
        </span>
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        )}
      </div>

      {/* Plants Grid/List */}
      <ScrollArea className="h-96">
        {filteredPlants.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                : "space-y-2"
            }
          >
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No plants found matching your search.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <Dialog
          open={!!selectedPlant}
          onOpenChange={() => setSelectedPlant(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(
                  categoryIcons[selectedPlant.category] || Leaf,
                  {
                    className: "w-5 h-5",
                    style: {
                      color: PLANT_CATEGORIES[selectedPlant.category]?.color,
                    },
                  },
                )}
                {selectedPlant.name}
                <Badge
                  className={`ml-2 ${difficultyColors[selectedPlant.growingConditions.difficulty]}`}
                >
                  {selectedPlant.growingConditions.difficulty}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-gray-600 italic">
                {selectedPlant.scientificName}
              </p>
            </DialogHeader>

            <div className="space-y-6">
              <p className="text-gray-700">{selectedPlant.description}</p>

              <Tabs defaultValue="medicinal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="medicinal">Medicinal</TabsTrigger>
                  <TabsTrigger value="growing">Growing</TabsTrigger>
                  <TabsTrigger value="preparation">Preparation</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>

                <TabsContent value="medicinal" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Medicinal Uses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlant.medicinalUses.map((use, index) => (
                        <Badge key={index} variant="secondary">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Active Compounds</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlant.activeCompounds.map((compound, index) => (
                        <Badge key={index} variant="outline">
                          {compound}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Parts Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlant.partUsed.map((part, index) => (
                        <Badge
                          key={index}
                          className="bg-green-100 text-green-800"
                        >
                          {part}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="growing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Growing Conditions
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sunlight:</span>
                          <Badge variant="outline">
                            {selectedPlant.growingConditions.sunlight}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Water:</span>
                          <Badge variant="outline">
                            {selectedPlant.growingConditions.water}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Soil:</span>
                          <span className="text-right text-gray-600">
                            {selectedPlant.growingConditions.soil}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Climate:</span>
                          <div className="flex gap-1">
                            {selectedPlant.growingConditions.climate.map(
                              (climate, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {climate}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Mountain className="w-4 h-4" />
                        Plant Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Height:</span>
                          <span>{selectedPlant.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Spacing:</span>
                          <span>{selectedPlant.spacing}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Harvest:</span>
                          <span>{selectedPlant.harvestTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zones:</span>
                          <div className="flex gap-1">
                            {selectedPlant.plantingZones.map((zone, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {zone}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedPlant.companionPlants.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Companion Plants</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlant.companionPlants.map(
                          (companion, index) => (
                            <Badge
                              key={index}
                              className="bg-green-100 text-green-800"
                            >
                              {companion}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preparation" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Preparation Methods
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlant.preparationMethods.map((method, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <Circle className="w-2 h-2 fill-current" />
                          <span className="text-sm">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Usage Types</h4>
                    <div className="flex gap-2">
                      {selectedPlant.uses.culinary && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Culinary
                        </Badge>
                      )}
                      {selectedPlant.uses.medicinal && (
                        <Badge className="bg-red-100 text-red-800">
                          Medicinal
                        </Badge>
                      )}
                      {selectedPlant.uses.aromatic && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Aromatic
                        </Badge>
                      )}
                      {selectedPlant.uses.decorative && (
                        <Badge className="bg-pink-100 text-pink-800">
                          Decorative
                        </Badge>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      Contraindications & Warnings
                    </h4>
                    {selectedPlant.contraindications.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPlant.contraindications.map(
                          (warning, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded"
                            >
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-800">
                                {warning}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                        No specific contraindications noted. Always consult
                        healthcare providers before medicinal use.
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-800">
                      General Safety Guidelines
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • Always consult with a healthcare provider before using
                        plants medicinally
                      </li>
                      <li>
                        • Start with small amounts to test for allergic
                        reactions
                      </li>
                      <li>
                        • Pregnant and nursing women should exercise extra
                        caution
                      </li>
                      <li>• Properly identify plants before use</li>
                      <li>• Be aware of potential drug interactions</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <strong>Origin:</strong> {selectedPlant.origin.join(", ")}
                </div>
                <Button
                  onClick={() => {
                    handleAddToGarden(selectedPlant);
                    setSelectedPlant(null);
                  }}
                  style={{
                    backgroundColor:
                      PLANT_CATEGORIES[selectedPlant.category]?.color,
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Garden
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PlantLibrary;
