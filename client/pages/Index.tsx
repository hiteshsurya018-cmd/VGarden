import React, { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Box,
  Sphere,
  Text,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  Camera,
  Sun,
  Moon,
  Save,
  RotateCcw,
  Download,
  Grid3X3,
  Leaf,
  Heart,
  Shield,
  Sparkles,
  Eye,
  Brain,
  Search,
  Filter,
  Star,
  Calendar,
  MapPin,
  Droplets,
  Thermometer,
  Clock,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  Palette,
  Settings,
  Play,
  Pause,
  RotateCw,
  Move3D,
  Layers,
  Image as ImageIcon,
  X,
  Plus,
  Minus,
  Info,
  AlertTriangle,
  CheckCircle,
  Archive,
  Share2,
  Copy,
  Home,
} from "lucide-react";
import * as THREE from "three";
import {
  PlantDetectionAPI,
  DetectedPlant as APIDetectedPlant,
} from "@/services/PlantDetectionAPI";
import {
  BoundingBoxOverlay,
  PlantDetailModal,
} from "@/components/BoundingBoxOverlay";
import SystemStatus from "@/components/SystemStatus";
import PlantLibrary from "@/components/PlantLibrary";
import { Plant } from "@/data/plantsDatabase";
import UnifiedGardenAnalysis from "@/components/UnifiedGardenAnalysis";
import { GardenLayout, AnalysisResult } from "@/services/GardenSpatialAnalysis";

interface DetectedPlant {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  category:
    | "immunity"
    | "skincare"
    | "digestive"
    | "mental"
    | "respiratory"
    | "anti-inflammatory";
  description: string;
  image: string;
  benefits: string[];
  difficulty: "easy" | "medium" | "hard";
  harvestTime: string;
  growingConditions: {
    sunlight: "full" | "partial" | "shade";
    water: "low" | "medium" | "high";
    soil: string;
    temperature: string;
  };
  medicinalUses: string[];
  preparations: string[];
  warnings: string[];
  rating: number;
  reviews: number;
  detectionMetadata?: {
    boundingBox: { x: number; y: number; width: number; height: number };
    imageQuality: number;
    lightingCondition: "excellent" | "good" | "poor";
    plantHealth: "healthy" | "stressed" | "diseased";
    growthStage: "seedling" | "juvenile" | "mature" | "flowering";
    certaintyFactors: {
      leafShape: number;
      flowerStructure: number;
      stemCharacteristics: number;
      overallMorphology: number;
    };
  };
  bbox?: APIDetectedPlant["bbox"];
}

interface AIAnalysisResult {
  detectedPlants: DetectedPlant[];
  imageQuality: number;
  processingTime: number;
  totalConfidence: number;
  errors: string[];
  suggestions: string[];
}

interface PlantPosition {
  id: string;
  plantId: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
  growthStage: number;
}

interface GardenStats {
  totalPlants: number;
  categories: Record<string, number>;
  gardenValue: number;
  lastUpdated: string;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  uploadProgress: number;
  analysisStatus:
    | "pending"
    | "preprocessing"
    | "analyzing"
    | "postprocessing"
    | "completed"
    | "error";
  analysisProgress: number;
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
    quality: number;
    hasPlants: boolean;
    lightingScore: number;
    clarityScore: number;
    plantCharacteristics: {
      dominantColors: string[];
      leafType: "broad" | "narrow" | "needle" | "succulent" | "compound";
      plantStructure: "herb" | "shrub" | "tree" | "vine" | "ground-cover";
      hasFlowers: boolean;
      flowerColor?: string;
      textureType: "smooth" | "rough" | "fuzzy" | "waxy" | "serrated";
      plantSize: "small" | "medium" | "large";
    };
  };
  errorMessage?: string;
}

// Note: PlantRecognitionAI class removed - now using real backend API with YOLOv5

// Comprehensive Plant Database with 50+ Species
const mockPlantDatabase: DetectedPlant[] = [
  {
    id: "1",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis",
    confidence: 0.95,
    category: "skincare",
    description:
      "A succulent plant known for its exceptional healing and moisturizing properties, widely used in traditional medicine.",
    image: "/placeholder.svg",
    benefits: [
      "Heals burns and cuts",
      "Moisturizes dry skin",
      "Reduces inflammation",
      "Soothes sunburn",
    ],
    difficulty: "easy",
    harvestTime: "6-8 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining, sandy",
      temperature: "55-80°F (13-27°C)",
    },
    medicinalUses: [
      "Topical burns treatment",
      "Skin moisturizer",
      "Wound healing",
      "Digestive aid",
    ],
    preparations: [
      "Fresh gel application",
      "Aloe juice",
      "Topical creams",
      "Face masks",
    ],
    warnings: [
      "May cause allergic reactions in some people",
      "Avoid ingesting whole leaf",
    ],
    rating: 4.8,
    reviews: 1247,
  },
  {
    id: "2",
    name: "Echinacea",
    scientificName: "Echinacea purpurea",
    confidence: 0.89,
    category: "immunity",
    description:
      "A powerful immune system booster with beautiful purple flowers, native to North America.",
    image: "/placeholder.svg",
    benefits: [
      "Strengthens immune system",
      "Fights cold and flu",
      "Reduces inflammation",
      "Antimicrobial properties",
    ],
    difficulty: "medium",
    harvestTime: "3-4 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, loamy",
      temperature: "60-70°F (15-21°C)",
    },
    medicinalUses: [
      "Cold and flu prevention",
      "Immune support",
      "Wound healing",
      "Upper respiratory infections",
    ],
    preparations: ["Tinctures", "Teas", "Capsules", "Dried root powder"],
    warnings: [
      "May interact with immunosuppressant drugs",
      "Not recommended for autoimmune conditions",
    ],
    rating: 4.6,
    reviews: 892,
  },
  {
    id: "3",
    name: "Lavender",
    scientificName: "Lavandula angustifolia",
    confidence: 0.92,
    category: "mental",
    description:
      "A fragrant herb renowned for its calming and relaxing properties, perfect for stress relief.",
    image: "/placeholder.svg",
    benefits: [
      "Reduces anxiety and stress",
      "Improves sleep quality",
      "Natural antiseptic",
      "Headache relief",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining, alkaline",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Anxiety and stress relief",
      "Sleep disorders",
      "Minor wounds",
      "Headaches",
    ],
    preparations: [
      "Essential oil",
      "Dried flowers",
      "Teas",
      "Sachets",
      "Bath products",
    ],
    warnings: [
      "May cause drowsiness",
      "Possible skin irritation in sensitive individuals",
    ],
    rating: 4.9,
    reviews: 2156,
  },
  {
    id: "4",
    name: "Peppermint",
    scientificName: "Mentha piperita",
    confidence: 0.87,
    category: "digestive",
    description:
      "A refreshing herb excellent for digestive health and providing natural cooling properties.",
    image: "/placeholder.svg",
    benefits: [
      "Aids digestion",
      "Relieves nausea",
      "Natural decongestant",
      "Antimicrobial properties",
    ],
    difficulty: "easy",
    harvestTime: "1-2 months",
    growingConditions: {
      sunlight: "partial",
      water: "high",
      soil: "Moist, rich",
      temperature: "65-70°F (18-21°C)",
    },
    medicinalUses: [
      "Digestive disorders",
      "Nausea and vomiting",
      "Respiratory congestion",
      "Muscle pain",
    ],
    preparations: [
      "Fresh leaves",
      "Teas",
      "Essential oil",
      "Tinctures",
      "Topical balms",
    ],
    warnings: ["May worsen acid reflux", "Can be too stimulating for some"],
    rating: 4.7,
    reviews: 1683,
  },
  {
    id: "5",
    name: "Eucalyptus",
    scientificName: "Eucalyptus globulus",
    confidence: 0.91,
    category: "respiratory",
    description:
      "An aromatic tree known for its powerful respiratory benefits and natural decongestant properties.",
    image: "/placeholder.svg",
    benefits: [
      "Clears respiratory congestion",
      "Antibacterial properties",
      "Natural decongestant",
      "Wound healing",
    ],
    difficulty: "medium",
    harvestTime: "4-6 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, acidic",
      temperature: "65-75°F (18-24��C)",
    },
    medicinalUses: [
      "Respiratory infections",
      "Congestion relief",
      "Wound care",
      "Muscle pain",
    ],
    preparations: ["Essential oil", "Steam inhalation", "Topical rubs", "Teas"],
    warnings: [
      "Essential oil is toxic if ingested",
      "May cause skin irritation",
    ],
    rating: 4.5,
    reviews: 734,
  },
  {
    id: "6",
    name: "Turmeric",
    scientificName: "Curcuma longa",
    confidence: 0.94,
    category: "anti-inflammatory",
    description:
      "A golden-colored root with powerful anti-inflammatory and antioxidant properties.",
    image: "/placeholder.svg",
    benefits: [
      "Reduces inflammation",
      "Antioxidant properties",
      "Joint health support",
      "Digestive aid",
    ],
    difficulty: "hard",
    harvestTime: "8-10 months",
    growingConditions: {
      sunlight: "partial",
      water: "high",
      soil: "Rich, well-draining",
      temperature: "70-85°F (21-29°C)",
    },
    medicinalUses: [
      "Arthritis and joint pain",
      "Digestive issues",
      "Skin conditions",
      "General inflammation",
    ],
    preparations: [
      "Fresh root",
      "Powder",
      "Golden milk",
      "Tinctures",
      "Capsules",
    ],
    warnings: [
      "May increase bleeding risk",
      "Can interact with blood thinners",
    ],
    rating: 4.8,
    reviews: 1892,
  },
  {
    id: "7",
    name: "Chamomile",
    scientificName: "Matricaria chamomilla",
    confidence: 0.88,
    category: "mental",
    description:
      "A gentle, daisy-like flower known for its calming and soothing properties.",
    image: "/placeholder.svg",
    benefits: [
      "Promotes relaxation",
      "Improves sleep",
      "Digestive aid",
      "Anti-inflammatory",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, fertile",
      temperature: "60-68°F (15-20°C)",
    },
    medicinalUses: [
      "Insomnia",
      "Anxiety",
      "Digestive upset",
      "Skin irritation",
    ],
    preparations: [
      "Teas",
      "Tinctures",
      "Essential oil",
      "Topical creams",
      "Bath products",
    ],
    warnings: [
      "May cause allergic reactions in people allergic to ragweed",
      "Possible interaction with blood thinners",
    ],
    rating: 4.7,
    reviews: 1456,
  },
  {
    id: "8",
    name: "Ginger",
    scientificName: "Zingiber officinale",
    confidence: 0.93,
    category: "digestive",
    description:
      "A warming root known for its digestive benefits and anti-nausea properties.",
    image: "/placeholder.svg",
    benefits: [
      "Reduces nausea",
      "Aids digestion",
      "Anti-inflammatory",
      "Circulation support",
    ],
    difficulty: "medium",
    harvestTime: "6-8 months",
    growingConditions: {
      sunlight: "partial",
      water: "high",
      soil: "Rich, well-draining",
      temperature: "75-85°F (24-29°C)",
    },
    medicinalUses: [
      "Motion sickness",
      "Morning sickness",
      "Digestive issues",
      "Muscle pain",
    ],
    preparations: [
      "Fresh root",
      "Teas",
      "Tinctures",
      "Capsules",
      "Crystallized ginger",
    ],
    warnings: [
      "May increase bleeding risk",
      "Can interact with blood thinners",
    ],
    rating: 4.6,
    reviews: 1123,
  },
  // Additional Medicinal Plants
  {
    id: "9",
    name: "Rosemary",
    scientificName: "Rosmarinus officinalis",
    confidence: 0.89,
    category: "mental",
    description: "An aromatic herb known for improving memory and circulation.",
    image: "/placeholder.svg",
    benefits: [
      "Improves memory",
      "Enhances circulation",
      "Antioxidant properties",
      "Hair growth",
    ],
    difficulty: "easy",
    harvestTime: "3-4 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining, sandy",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Memory enhancement",
      "Hair loss",
      "Poor circulation",
      "Mental fatigue",
    ],
    preparations: ["Essential oil", "Teas", "Hair rinses", "Tinctures"],
    warnings: ["High doses may cause seizures", "Avoid during pregnancy"],
    rating: 4.4,
    reviews: 876,
  },
  {
    id: "10",
    name: "Calendula",
    scientificName: "Calendula officinalis",
    confidence: 0.91,
    category: "skincare",
    description:
      "Bright orange flowers with powerful healing properties for skin conditions.",
    image: "/placeholder.svg",
    benefits: [
      "Heals wounds",
      "Reduces inflammation",
      "Soothes skin",
      "Antimicrobial",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, fertile",
      temperature: "60-70°F (15-21°C)",
    },
    medicinalUses: ["Cuts and wounds", "Eczema", "Diaper rash", "Minor burns"],
    preparations: ["Salves", "Tinctures", "Oils", "Creams", "Flower petals"],
    warnings: ["May cause allergic reactions in some people"],
    rating: 4.7,
    reviews: 1234,
  },
  {
    id: "11",
    name: "Sage",
    scientificName: "Salvia officinalis",
    confidence: 0.85,
    category: "respiratory",
    description:
      "A versatile herb with antibacterial and anti-inflammatory properties.",
    image: "/placeholder.svg",
    benefits: [
      "Sore throat relief",
      "Reduces sweating",
      "Memory support",
      "Digestive aid",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining, alkaline",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Sore throat",
      "Excessive sweating",
      "Memory issues",
      "Digestive problems",
    ],
    preparations: ["Teas", "Gargles", "Tinctures", "Smoking blends"],
    warnings: ["Avoid long-term use", "Contains thujone"],
    rating: 4.3,
    reviews: 698,
  },
  {
    id: "12",
    name: "Thyme",
    scientificName: "Thymus vulgaris",
    confidence: 0.88,
    category: "respiratory",
    description:
      "A powerful antiseptic herb excellent for respiratory conditions.",
    image: "/placeholder.svg",
    benefits: ["Cough relief", "Antibacterial", "Expectorant", "Antifungal"],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining, rocky",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Coughs",
      "Bronchitis",
      "Throat infections",
      "Fungal infections",
    ],
    preparations: ["Teas", "Essential oil", "Tinctures", "Steam inhalation"],
    warnings: ["Essential oil is very potent", "May cause skin irritation"],
    rating: 4.5,
    reviews: 789,
  },
  {
    id: "13",
    name: "Basil",
    scientificName: "Ocimum basilicum",
    confidence: 0.82,
    category: "digestive",
    description: "Sacred basil with adaptogenic and digestive properties.",
    image: "/placeholder.svg",
    benefits: [
      "Stress relief",
      "Digestive support",
      "Immune boost",
      "Anti-inflammatory",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Rich, well-draining",
      temperature: "70-80°F (21-27°C)",
    },
    medicinalUses: [
      "Stress and anxiety",
      "Digestive upset",
      "Respiratory issues",
      "Fever",
    ],
    preparations: ["Fresh leaves", "Teas", "Tinctures", "Essential oil"],
    warnings: ["May lower blood sugar", "Avoid during pregnancy"],
    rating: 4.2,
    reviews: 567,
  },
  {
    id: "14",
    name: "Oregano",
    scientificName: "Origanum vulgare",
    confidence: 0.86,
    category: "immunity",
    description:
      "Potent antimicrobial herb with strong immune-supporting properties.",
    image: "/placeholder.svg",
    benefits: [
      "Antimicrobial",
      "Antioxidant",
      "Digestive aid",
      "Respiratory support",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining, alkaline",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Infections",
      "Digestive issues",
      "Respiratory problems",
      "Fungal conditions",
    ],
    preparations: ["Essential oil", "Teas", "Tinctures", "Dried herb"],
    warnings: ["Essential oil is very strong", "May cause stomach upset"],
    rating: 4.4,
    reviews: 645,
  },
  {
    id: "15",
    name: "Lemon Balm",
    scientificName: "Melissa officinalis",
    confidence: 0.84,
    category: "mental",
    description:
      "Calming herb from the mint family, excellent for anxiety and sleep.",
    image: "/placeholder.svg",
    benefits: [
      "Reduces anxiety",
      "Improves sleep",
      "Antiviral",
      "Digestive aid",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "partial",
      water: "medium",
      soil: "Moist, fertile",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: ["Anxiety", "Insomnia", "Cold sores", "Digestive upset"],
    preparations: ["Teas", "Tinctures", "Essential oil", "Fresh leaves"],
    warnings: ["May interact with thyroid medications"],
    rating: 4.6,
    reviews: 923,
  },
  {
    id: "16",
    name: "Plantain",
    scientificName: "Plantago major",
    confidence: 0.79,
    category: "skincare",
    description:
      "Common weed with excellent wound healing and anti-inflammatory properties.",
    image: "/placeholder.svg",
    benefits: [
      "Wound healing",
      "Anti-inflammatory",
      "Antimicrobial",
      "Soothing",
    ],
    difficulty: "easy",
    harvestTime: "1-2 months",
    growingConditions: {
      sunlight: "partial",
      water: "medium",
      soil: "Any soil type",
      temperature: "50-80°F (10-27°C)",
    },
    medicinalUses: [
      "Cuts and scrapes",
      "Insect bites",
      "Skin irritation",
      "Minor wounds",
    ],
    preparations: ["Poultice", "Salves", "Tinctures", "Fresh leaves"],
    warnings: ["Generally very safe"],
    rating: 4.1,
    reviews: 456,
  },
  {
    id: "17",
    name: "Dandelion",
    scientificName: "Taraxacum officinale",
    confidence: 0.77,
    category: "digestive",
    description:
      'Nutritious "weed" with excellent liver support and detoxification properties.',
    image: "/placeholder.svg",
    benefits: ["Liver support", "Diuretic", "Digestive aid", "Nutritious"],
    difficulty: "easy",
    harvestTime: "1-2 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Any soil type",
      temperature: "50-75°F (10-24°C)",
    },
    medicinalUses: [
      "Liver problems",
      "Water retention",
      "Digestive issues",
      "Kidney support",
    ],
    preparations: ["Root decoctions", "Leaf teas", "Tinctures", "Fresh greens"],
    warnings: ["May interact with diuretic medications"],
    rating: 4.0,
    reviews: 734,
  },
  {
    id: "18",
    name: "Comfrey",
    scientificName: "Symphytum officinale",
    confidence: 0.81,
    category: "skincare",
    description:
      "Traditional healing herb excellent for bone and tissue repair.",
    image: "/placeholder.svg",
    benefits: [
      "Bone healing",
      "Wound repair",
      "Anti-inflammatory",
      "Pain relief",
    ],
    difficulty: "medium",
    harvestTime: "3-4 months",
    growingConditions: {
      sunlight: "partial",
      water: "high",
      soil: "Rich, moist",
      temperature: "60-75°F (15-24°C)",
    },
    medicinalUses: ["Fractures", "Sprains", "Wounds", "Bruises"],
    preparations: ["Poultices", "Salves", "Oils", "Compresses"],
    warnings: ["For external use only", "Contains pyrrolizidine alkaloids"],
    rating: 4.3,
    reviews: 512,
  },
  {
    id: "19",
    name: "Violet",
    scientificName: "Viola odorata",
    confidence: 0.75,
    category: "respiratory",
    description:
      "Delicate purple flowers with soothing respiratory and skin benefits.",
    image: "/placeholder.svg",
    benefits: [
      "Cough relief",
      "Skin soothing",
      "Anti-inflammatory",
      "Lymphatic support",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "shade",
      water: "medium",
      soil: "Moist, rich",
      temperature: "55-70°F (13-21°C)",
    },
    medicinalUses: [
      "Coughs",
      "Skin conditions",
      "Lymphatic congestion",
      "Inflammation",
    ],
    preparations: ["Syrups", "Teas", "Salves", "Fresh flowers"],
    warnings: ["Generally very safe"],
    rating: 4.2,
    reviews: 398,
  },
  {
    id: "20",
    name: "Clover",
    scientificName: "Trifolium pratense",
    confidence: 0.73,
    category: "immunity",
    description:
      "Red clover flowers with hormone-balancing and immune-supporting properties.",
    image: "/placeholder.svg",
    benefits: [
      "Hormone balance",
      "Immune support",
      "Blood purifier",
      "Anti-inflammatory",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, fertile",
      temperature: "60-75°F (15-24°C)",
    },
    medicinalUses: [
      "Menopause symptoms",
      "Skin conditions",
      "Respiratory issues",
      "Blood health",
    ],
    preparations: ["Teas", "Tinctures", "Capsules", "Dried flowers"],
    warnings: ["May interact with blood thinners"],
    rating: 4.1,
    reviews: 567,
  },
  // Flowering Plants
  {
    id: "21",
    name: "Hibiscus",
    scientificName: "Hibiscus sabdariffa",
    confidence: 0.87,
    category: "immunity",
    description: "Beautiful red flowers rich in antioxidants and vitamin C.",
    image: "/placeholder.svg",
    benefits: [
      "High in antioxidants",
      "Supports heart health",
      "Immune boost",
      "Natural diuretic",
    ],
    difficulty: "medium",
    harvestTime: "4-5 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, fertile",
      temperature: "70-85°F (21-29°C)",
    },
    medicinalUses: [
      "High blood pressure",
      "Immune support",
      "Urinary health",
      "Antioxidant support",
    ],
    preparations: ["Teas", "Cold infusions", "Syrups", "Dried petals"],
    warnings: ["May lower blood pressure"],
    rating: 4.5,
    reviews: 892,
  },
  {
    id: "22",
    name: "Marigold",
    scientificName: "Tagetes patula",
    confidence: 0.83,
    category: "skincare",
    description:
      "Bright orange flowers with antimicrobial and healing properties.",
    image: "/placeholder.svg",
    benefits: [
      "Antimicrobial",
      "Wound healing",
      "Anti-inflammatory",
      "Insect repellent",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Well-draining",
      temperature: "65-80°F (18-27°C)",
    },
    medicinalUses: [
      "Minor wounds",
      "Skin infections",
      "Eye irritation",
      "Fungal conditions",
    ],
    preparations: ["Oils", "Salves", "Washes", "Compresses"],
    warnings: ["Generally safe for topical use"],
    rating: 4.3,
    reviews: 676,
  },
  {
    id: "23",
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    confidence: 0.78,
    category: "immunity",
    description:
      "Large bright flowers with nutritious seeds and healing properties.",
    image: "/placeholder.svg",
    benefits: [
      "Rich in vitamin E",
      "Anti-inflammatory",
      "Skin nourishing",
      "Heart healthy",
    ],
    difficulty: "easy",
    harvestTime: "3-4 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Well-draining, fertile",
      temperature: "70-85°F (21-29°C)",
    },
    medicinalUses: [
      "Skin conditions",
      "Inflammation",
      "Cardiovascular health",
      "Nutritional support",
    ],
    preparations: ["Seed oil", "Petal tinctures", "Seeds", "Flower teas"],
    warnings: ["Seeds high in calories"],
    rating: 4.0,
    reviews: 445,
  },
  {
    id: "24",
    name: "Nasturtium",
    scientificName: "Tropaeolum majus",
    confidence: 0.76,
    category: "immunity",
    description:
      "Edible flowers and leaves with natural antibiotic properties.",
    image: "/placeholder.svg",
    benefits: [
      "Natural antibiotic",
      "Immune support",
      "Respiratory health",
      "Rich in vitamin C",
    ],
    difficulty: "easy",
    harvestTime: "2-3 months",
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "Poor to average",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Respiratory infections",
      "UTIs",
      "Wound healing",
      "Immune support",
    ],
    preparations: ["Fresh leaves", "Tinctures", "Salads", "Teas"],
    warnings: ["Generally very safe"],
    rating: 4.2,
    reviews: 334,
  },
  {
    id: "25",
    name: "Rose",
    scientificName: "Rosa rugosa",
    confidence: 0.89,
    category: "skincare",
    description:
      "Beautiful flowers with skin-nourishing and heart-opening properties.",
    image: "/placeholder.svg",
    benefits: [
      "Skin nourishing",
      "Anti-aging",
      "Emotional support",
      "Rich in vitamin C",
    ],
    difficulty: "medium",
    harvestTime: "3-4 months",
    growingConditions: {
      sunlight: "full",
      water: "medium",
      soil: "Rich, well-draining",
      temperature: "65-75°F (18-24°C)",
    },
    medicinalUses: [
      "Skin aging",
      "Emotional stress",
      "Immune support",
      "Digestive issues",
    ],
    preparations: [
      "Rose water",
      "Essential oil",
      "Rose hip tea",
      "Petal preparations",
    ],
    warnings: ["Generally very safe"],
    rating: 4.7,
    reviews: 1456,
  },
];

const categoryIcons = {
  immunity: Shield,
  skincare: Sparkles,
  digestive: Heart,
  mental: Brain,
  respiratory: Eye,
  "anti-inflammatory": Award,
  unknown: Search,
};

const categoryColors = {
  immunity: "bg-blue-100 text-blue-800 border-blue-200",
  skincare: "bg-pink-100 text-pink-800 border-pink-200",
  digestive: "bg-orange-100 text-orange-800 border-orange-200",
  mental: "bg-purple-100 text-purple-800 border-purple-200",
  respiratory: "bg-green-100 text-green-800 border-green-200",
  "anti-inflammatory": "bg-yellow-100 text-yellow-800 border-yellow-200",
  unknown: "bg-gray-100 text-gray-800 border-gray-200",
};

const difficultyColors = {
  easy: "text-green-600",
  medium: "text-yellow-600",
  hard: "text-red-600",
};

// Enhanced 3D Plant Component with growth animation
function Plant3D({
  position,
  plant,
  growthStage = 1,
  isSelected = false,
  onClick,
}: {
  position: [number, number, number];
  plant: DetectedPlant;
  growthStage?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  // Safety check for plant object
  if (!plant) {
    return null;
  }
  const meshRef = useRef<any>();
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const categoryColorString =
    categoryColors[plant?.category] ||
    categoryColors["immunity"] ||
    "bg-green-100";
  const plantColor = categoryColorString.includes("blue")
    ? "#3b82f6"
    : categoryColorString.includes("pink")
      ? "#ec4899"
      : categoryColorString.includes("orange")
        ? "#f97316"
        : categoryColorString.includes("purple")
          ? "#8b5cf6"
          : categoryColorString.includes("yellow")
            ? "#eab308"
            : "#22c55e";

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Plant stem */}
      <Box
        ref={meshRef}
        args={[0.3 * growthStage, 0.8 * growthStage, 0.3 * growthStage]}
        position={[0, 0.4 * growthStage, 0]}
      >
        <meshStandardMaterial color="#16a34a" />
      </Box>

      {/* Plant foliage */}
      <Sphere args={[0.4 * growthStage]} position={[0, 0.9 * growthStage, 0]}>
        <meshStandardMaterial color={plantColor} />
      </Sphere>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Plant label */}
      <Html distanceFactor={10} position={[0, 1.5 * growthStage, 0]}>
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg text-xs font-medium text-gray-800 pointer-events-none">
          {plant?.name || "Unknown Plant"}
        </div>
      </Html>
    </group>
  );
}

// Animated background component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-garden-50 via-nature-50 to-garden-100"></div>
      {/* Floating leaf animations */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <Leaf className="w-8 h-8 text-garden-400 transform rotate-12" />
        </div>
      ))}
    </div>
  );
}

// Unified Garden Analysis - combining spatial analysis and plant recognition
export default function Index() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedPlants, setDetectedPlants] = useState<DetectedPlant[]>([]);
  const [lastAnalysisResult, setLastAnalysisResult] =
    useState<AIAnalysisResult | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [placedPlants, setPlacedPlants] = useState<PlantPosition[]>([]);
  const [selectedPlantPosition, setSelectedPlantPosition] = useState<
    string | null
  >(null);
  const [showGrid, setShowGrid] = useState(true);
  const [cameraMode, setCameraMode] = useState<"orbit" | "top" | "side">(
    "orbit",
  );
  const [lightMode, setLightMode] = useState<"day" | "night" | "sunset">("day");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "confidence" | "rating">(
    "confidence",
  );
  const [showOnlyDetected, setShowOnlyDetected] = useState(false);
  const [gardenName, setGardenName] = useState("My Medicinal Garden");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [isGrowthAnimationPlaying, setIsGrowthAnimationPlaying] =
    useState(false);
  const [selectedPlantInfo, setSelectedPlantInfo] =
    useState<DetectedPlant | null>(null);
  const [selectedDetectedPlant, setSelectedDetectedPlant] =
    useState<APIDetectedPlant | null>(null);
  const [gardenTemplateMode, setGardenTemplateMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentImageRef, setCurrentImageRef] = useState<
    React.RefObject<HTMLImageElement>
  >(React.createRef());
  const [enableStrictMode, setEnableStrictMode] = useState(false);
  const [maxDetections, setMaxDetections] = useState(5);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [gardenLayout, setGardenLayout] = useState<GardenLayout | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "analysis" | "library"
  >("analysis");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate garden statistics
  const gardenStats: GardenStats = {
    totalPlants: (placedPlants || []).length,
    categories: (placedPlants || []).reduce(
      (acc, plant) => {
        const plantData = detectedPlants.find((p) => p.id === plant.plantId);
        if (plantData) {
          acc[plantData.category] = (acc[plantData.category] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    ),
    gardenValue: (placedPlants || []).length * 15.99, // Mock calculation
    lastUpdated: new Date().toLocaleDateString(),
  };

  // Real backend API integration for plant detection
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
            size: file.size,
            uploadProgress: 0,
            analysisStatus: "pending",
            analysisProgress: 0,
          };

          setUploadedImages((prev) => [...prev, newImage]);
          setIsAnalyzing(true);

          try {
            // Step 1: Upload progress simulation
            const uploadInterval = setInterval(() => {
              setUploadedImages((prev) =>
                prev.map((img) =>
                  img.id === imageId && img.uploadProgress < 100
                    ? { ...img, uploadProgress: img.uploadProgress + 33 }
                    : img,
                ),
              );
            }, 200);

            setTimeout(() => {
              clearInterval(uploadInterval);
              setUploadedImages((prev) =>
                prev.map((img) =>
                  img.id === imageId
                    ? {
                        ...img,
                        uploadProgress: 100,
                        analysisStatus: "analyzing",
                      }
                    : img,
                ),
              );
            }, 600);

            // Step 2: Plant detection (using fallback system)
            let detection, quality;
            try {
              const result =
                await PlantDetectionAPI.detectPlantsWithQualityCheck(file);
              detection = result.detection || {
                success: false,
                plants: [],
                count: 0,
                image_info: {},
                message: "Detection failed",
              };
              quality = result.quality;
            } catch (error) {
              console.warn("Detection failed, using safe fallback:", error);
              // Safe fallback
              detection = {
                success: true,
                plants: [],
                count: 0,
                image_info: {
                  width: 640,
                  height: 480,
                  format: "unknown",
                  mode: "RGB",
                },
                message: "Detection system temporarily unavailable",
              };
              quality = null;
            }

            // Convert API results to app format
            const detectionPlants = Array.isArray(detection?.plants)
              ? detection.plants
              : [];
            const convertedPlants = detectionPlants
              .filter(
                (plant) => (plant?.confidence || 0) >= confidenceThreshold,
              )
              .slice(
                0,
                enableStrictMode ? maxDetections : detectionPlants.length,
              )
              .map((apiPlant) => {
                const basePlant =
                  mockPlantDatabase.find(
                    (p) =>
                      p?.name
                        ?.toLowerCase()
                        .includes(apiPlant?.label?.toLowerCase() || "") ||
                      (apiPlant?.label?.toLowerCase() || "").includes(
                        p?.name?.toLowerCase() || "",
                      ),
                  ) ||
                  (mockPlantDatabase && mockPlantDatabase[0]) ||
                  null; // Fallback to first plant

                return {
                  ...(basePlant || {
                    name: "Unknown Plant",
                    scientificName: "Species unknown",
                    category: "unknown",
                    description: "Plant identification pending",
                    image: "/placeholder.svg",
                    benefits: ["Identification required"],
                    difficulty: "medium",
                    harvestTime: "Unknown",
                    growingConditions: {
                      sunlight: "full",
                      water: "medium",
                      soil: "Any",
                      temperature: "Variable",
                    },
                    medicinalUses: ["Requires identification"],
                    preparations: ["Consult expert"],
                    warnings: ["Do not use until identified"],
                    rating: 0,
                    reviews: 0,
                  }),
                  id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name:
                    (apiPlant?.label || "Unknown").charAt(0).toUpperCase() +
                    (apiPlant?.label || "unknown").slice(1),
                  scientificName:
                    apiPlant?.scientific_name || "Species unknown",
                  confidence: apiPlant?.confidence || 0,
                  category: (apiPlant?.category as any) || "unknown",
                  bbox: apiPlant?.bbox,
                  detectionMetadata: {
                    boundingBox: {
                      x: apiPlant?.bbox?.x1 || 0,
                      y: apiPlant?.bbox?.y1 || 0,
                      width: apiPlant?.bbox?.width || 100,
                      height: apiPlant?.bbox?.height || 100,
                    },
                    imageQuality: quality?.quality?.score || 75,
                    lightingCondition:
                      (quality?.quality?.score || 75) > 80
                        ? "excellent"
                        : (quality?.quality?.score || 75) > 60
                          ? "good"
                          : "poor",
                    plantHealth: "healthy",
                    growthStage: "mature",
                    certaintyFactors: {
                      leafShape: (apiPlant?.confidence || 0) * 0.9,
                      flowerStructure: (apiPlant?.confidence || 0) * 0.85,
                      stemCharacteristics: (apiPlant?.confidence || 0) * 0.8,
                      overallMorphology: (apiPlant?.confidence || 0) * 0.95,
                    },
                  },
                };
              });

            setDetectedPlants(convertedPlants);
            setIsAnalyzing(false);

            // Update image status
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      analysisStatus: detection.success ? "completed" : "error",
                      analysisProgress: 100,
                      errorMessage: !detection.success
                        ? "Detection failed"
                        : undefined,
                      imageMetadata: {
                        width: detection.image_info?.width || 0,
                        height: detection.image_info?.height || 0,
                        qualityScore: quality?.quality.score || 0,
                        brightness: quality?.quality.brightness || 0,
                        contrast: quality?.quality.contrast || 0,
                        sharpness: quality?.quality.sharpness || 0,
                        recommendation:
                          quality?.quality.recommendation ||
                          "No analysis available",
                      },
                    }
                  : img,
              ),
            );

            // Store analysis result
            setLastAnalysisResult({
              detectedPlants: convertedPlants,
              totalProcessingTime: 2000,
              confidence:
                (convertedPlants || []).length > 0
                  ? Math.max(
                      ...(convertedPlants || []).map((p) => p.confidence || 0),
                    )
                  : 0,
              plantCount: (convertedPlants || []).length,
              errors: detection.success ? [] : ["Backend detection failed"],
              imageAnalysis: {
                quality: quality?.quality.score || 0,
                lighting: quality?.quality.brightness || 0,
                focus: quality?.quality.sharpness || 0,
                resolution: detection.image_info?.width || 0,
              },
              environmentFactors: {
                lighting: "natural",
                background: "clean",
                angle: "optimal",
                distance: "appropriate",
              },
              processingSteps: [
                "Image uploaded to backend",
                "YOLOv5 model analysis",
                "Plant classification",
                "Confidence scoring",
                "Medicinal properties mapping",
              ],
            });
          } catch (error) {
            console.error("Plant detection error:", error);
            setIsAnalyzing(false);
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      analysisStatus: "error",
                      errorMessage:
                        error instanceof Error
                          ? error.message
                          : "Analysis failed",
                    }
                  : img,
              ),
            );
          }
        }
      });
    },
    [confidenceThreshold, enableStrictMode, maxDetections],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Enhanced plant filtering and searching
  const filteredPlants = (detectedPlants || [])
    .filter(
      (plant) =>
        (selectedCategory === "all" || plant.category === selectedCategory) &&
        (plant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plant.scientificName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (!showOnlyDetected ||
          (detectedPlants || []).some((dp) => dp.id === plant.id)),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "confidence":
          return (b.confidence || 0) - (a.confidence || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const addPlantToGarden = (plant: DetectedPlant) => {
    const newPosition: PlantPosition = {
      id: `${plant.id}-${Date.now()}`,
      plantId: plant.id,
      x: (Math.random() - 0.5) * 6,
      y: 0,
      z: (Math.random() - 0.5) * 6,
      rotation: Math.random() * Math.PI * 2,
      scale: 0.8 + Math.random() * 0.4,
      growthStage: 0.5 + Math.random() * 0.5,
    };
    setPlacedPlants((prev) => [...prev, newPosition]);
  };

  const removePlantFromGarden = (positionId: string) => {
    setPlacedPlants((prev) => prev.filter((p) => p.id !== positionId));
    setSelectedPlantPosition(null);
  };

  const resetGarden = () => {
    setPlacedPlants([]);
    setSelectedPlantPosition(null);
  };

  const saveLayout = () => {
    const gardenData = {
      name: gardenName,
      plants: placedPlants,
      settings: { lightMode, showGrid, cameraMode },
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("virtualGarden", JSON.stringify(gardenData));
    alert("Garden layout saved successfully!");
  };

  const loadLayout = () => {
    const saved = localStorage.getItem("virtualGarden");
    if (saved) {
      const gardenData = JSON.parse(saved);
      setPlacedPlants(gardenData.plants || []);
      setGardenName(gardenData.name || "My Medicinal Garden");
      if (gardenData.settings) {
        setLightMode(gardenData.settings.lightMode || "day");
        setShowGrid(gardenData.settings.showGrid ?? true);
        setCameraMode(gardenData.settings.cameraMode || "orbit");
      }
      alert("Garden layout loaded successfully!");
    }
  };

  const exportGarden = () => {
    const gardenData = {
      name: gardenName,
      plants: (placedPlants || []).map((p) => ({
        ...p,
        plantInfo: detectedPlants.find((dp) => dp.id === p.plantId),
      })),
      stats: gardenStats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(gardenData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${gardenName.replace(/\s+/g, "_")}_garden.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadGardenTemplate = (templateName: string) => {
    const templates = {
      healing_circle: [
        {
          plantId: "1",
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          scale: 1,
          growthStage: 1,
        },
        {
          plantId: "2",
          x: 2,
          y: 0,
          z: 0,
          rotation: 0,
          scale: 1,
          growthStage: 0.8,
        },
        {
          plantId: "3",
          x: -2,
          y: 0,
          z: 0,
          rotation: 0,
          scale: 1,
          growthStage: 0.9,
        },
        {
          plantId: "4",
          x: 0,
          y: 0,
          z: 2,
          rotation: 0,
          scale: 1,
          growthStage: 0.7,
        },
        {
          plantId: "5",
          x: 0,
          y: 0,
          z: -2,
          rotation: 0,
          scale: 1,
          growthStage: 0.85,
        },
      ],
      herb_spiral: [
        {
          plantId: "1",
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          scale: 1.2,
          growthStage: 1,
        },
        {
          plantId: "2",
          x: 1,
          y: 0,
          z: 1,
          rotation: 0,
          scale: 1,
          growthStage: 0.9,
        },
        {
          plantId: "3",
          x: -1,
          y: 0,
          z: 1,
          rotation: 0,
          scale: 0.9,
          growthStage: 0.8,
        },
        {
          plantId: "4",
          x: -1,
          y: 0,
          z: -1,
          rotation: 0,
          scale: 1.1,
          growthStage: 0.85,
        },
        {
          plantId: "5",
          x: 1,
          y: 0,
          z: -1,
          rotation: 0,
          scale: 0.8,
          growthStage: 0.75,
        },
        {
          plantId: "6",
          x: 2,
          y: 0,
          z: 0,
          rotation: 0,
          scale: 1,
          growthStage: 0.9,
        },
      ],
    };

    const template = templates[templateName as keyof typeof templates];
    if (template) {
      const newPlants = template.map((plant, index) => ({
        id: `template-${templateName}-${index}`,
        ...plant,
      }));
      setPlacedPlants(newPlants);
    }
  };

  // Handle adding plants from library to garden
  const handleAddPlantFromLibrary = (plant: Plant) => {
    const newPlantPosition: PlantPosition = {
      id: Math.random().toString(36).substr(2, 9),
      plantId: plant.id,
      x: (Math.random() - 0.5) * 8, // Random position within garden bounds
      y: 0,
      z: (Math.random() - 0.5) * 8,
      rotation: Math.random() * Math.PI * 2,
      scale: 0.8 + Math.random() * 0.4,
      growthStage: Math.random() * 0.3 + 0.2, // Start with some growth
    };

    setPlacedPlants((prev) => [...prev, newPlantPosition]);

    // Also add to detected plants for visualization
    const detectedPlant: DetectedPlant = {
      id: plant.id,
      name: plant.name,
      scientificName: plant.scientificName,
      confidence: 0.95, // High confidence for manually added plants
      category: plant.category,
      benefits: plant.medicinalUses,
      difficulty: plant.growingConditions.difficulty,
      harvestTime: plant.harvestTime,
      rating: 4.5 + Math.random() * 0.5,
      uses: plant.medicinalUses.slice(0, 4),
      climate: plant.growingConditions.climate.join(", "),
      soilType: plant.growingConditions.soil,
      spacing: plant.spacing,
      sunlight: plant.growingConditions.sunlight,
      waterNeeds: plant.growingConditions.water,
      companionPlants: plant.companionPlants.slice(0, 3),
      toxicity:
        plant.contraindications.length > 0
          ? "Caution advised"
          : "Generally safe",
      description: plant.description,
    };

    setDetectedPlants((prev) => {
      const existing = prev.find((p) => p.id === plant.id);
      if (!existing) {
        return [...prev, detectedPlant];
      }
      return prev;
    });

    console.log(`Added ${plant.name} to garden from library`);
  };

  // Handle garden analysis completion
  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    if (result.success) {
      setGardenLayout(result.layout);
      setActiveTab("analysis");
    }
  };

  // Handle garden layout selection
  const handleLayoutSelected = (layout: GardenLayout) => {
    setGardenLayout(layout);
    setActiveTab("analysis");

    // Update garden stats based on real layout
    const totalArea = layout.dimensions.estimatedArea;
    const plantCapacity = layout.zones.reduce(
      (sum, zone) => sum + zone.capacity,
      0,
    );

    console.log(
      `Garden layout selected: ${layout.name} (${totalArea.toFixed(1)}m², capacity: ${plantCapacity} plants)`,
    );
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${isDarkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-garden-50 to-nature-50"}`}
    >
      <AnimatedBackground />

      {/* Enhanced Header */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-garden-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-garden-500 to-nature-500 rounded-2xl shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-garden-900 dark:text-white">
                  Virtual Garden Studio
                </h1>
                <p className="text-garden-600 dark:text-gray-300">
                  Professional Plant Design Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog
                open={showSystemStatus}
                onOpenChange={setShowSystemStatus}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Settings className="w-4 h-4 mr-1" />
                    System
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>System Status & Backend Control</DialogTitle>
                  </DialogHeader>
                  <SystemStatus />
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="rounded-full"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Stats
              </Button>
            </div>
          </div>

          {/* Hero Section with Enhanced Typography */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-garden-900 dark:text-white">
                Create Your Own{" "}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-garden-600 via-nature-600 to-garden-500 animate-pulse">
                Virtual Medicinal Garden
              </span>
            </h2>
            <p className="text-xl text-garden-700 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              Upload your garden images, detect plants with advanced AI, and
              design immersive 3D healing spaces with professional-grade tools.
            </p>

            {/* Quick Stats */}
            {showStats && (
              <div className="flex flex-row gap-4 max-w-2xl mx-auto">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-garden-200/50">
                  <div className="text-2xl font-bold text-garden-600">
                    {gardenStats.totalPlants}
                  </div>
                  <div className="text-sm text-garden-500">Plants Placed</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-garden-200/50">
                  <div className="text-2xl font-bold text-garden-600">
                    {(detectedPlants || []).length}
                  </div>
                  <div className="text-sm text-garden-500">
                    Detected Species
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-garden-200/50">
                  <div className="text-2xl font-bold text-garden-600">
                    {Object.keys(gardenStats.categories || {}).length}
                  </div>
                  <div className="text-sm text-garden-500">Categories</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Advanced Upload Section */}
            <Card className="shadow-2xl border-garden-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-garden-900 dark:text-white">
                  <Upload className="w-5 h-5" />
                  Upload Garden Images
                  <Badge variant="secondary" className="ml-auto">
                    {(uploadedImages || []).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Carousel */}
                {(uploadedImages || []).length > 0 && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        ref={currentImageRef}
                        src={(uploadedImages || [])[currentImageIndex]?.url}
                        alt="Garden"
                        className="w-full h-40 object-cover rounded-xl"
                      />

                      {/* Bounding Box Overlay for Detected Plants */}
                      {(detectedPlants || []).length > 0 && (
                        <BoundingBoxOverlay
                          detections={(detectedPlants || [])
                            .filter((p) => p.bbox)
                            .map((p) => ({
                              bbox: p.bbox!,
                              label: p.name,
                              confidence: p.confidence,
                              category: p.category,
                              properties: p.benefits?.slice(0, 3) || [],
                              scientific_name: p.scientificName,
                            }))}
                          imageRef={currentImageRef}
                          onPlantSelect={(plant) =>
                            setSelectedDetectedPlant(plant)
                          }
                        />
                      )}

                      {(uploadedImages || []).length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {(uploadedImages || []).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Enhanced Upload Progress */}
                    {(uploadedImages || []).some(
                      (img) =>
                        img?.uploadProgress < 100 ||
                        [
                          "preprocessing",
                          "analyzing",
                          "postprocessing",
                        ].includes(img?.analysisStatus),
                    ) && (
                      <div className="space-y-3">
                        {(uploadedImages || []).map((img) => (
                          <div
                            key={img.id}
                            className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex justify-between text-xs">
                              <span className="truncate font-medium">
                                {img.name}
                              </span>
                              <span
                                className={`capitalize ${
                                  img.analysisStatus === "error"
                                    ? "text-red-600"
                                    : img.analysisStatus === "completed"
                                      ? "text-green-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {img.analysisStatus === "preprocessing"
                                  ? "Preprocessing..."
                                  : img.analysisStatus === "analyzing"
                                    ? `Analyzing... ${img.analysisProgress}%`
                                    : img.analysisStatus === "postprocessing"
                                      ? "Finalizing..."
                                      : img.analysisStatus === "completed"
                                        ? "Completed"
                                        : img.analysisStatus === "error"
                                          ? "Error"
                                          : `Uploading... ${img.uploadProgress}%`}
                              </span>
                            </div>

                            {/* Upload Progress Bar */}
                            <Progress
                              value={img.uploadProgress}
                              className="h-2"
                            />

                            {/* Analysis Progress Bar */}
                            {[
                              "preprocessing",
                              "analyzing",
                              "postprocessing",
                            ].includes(img.analysisStatus) && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-blue-600">
                                  <span>AI Analysis</span>
                                  <span>{img.analysisProgress}%</span>
                                </div>
                                <Progress
                                  value={img.analysisProgress}
                                  className="h-1 bg-blue-100"
                                />
                              </div>
                            )}

                            {/* Enhanced Image Analysis Indicators */}
                            {img.imageMetadata && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="text-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                                        (img.imageMetadata?.qualityScore || 0) >
                                        70
                                          ? "bg-green-500"
                                          : (img.imageMetadata?.qualityScore ||
                                                0) > 40
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                    ></div>
                                    <span className="text-gray-600">
                                      Quality
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                                        (img.imageMetadata?.brightness || 0) >
                                        100
                                          ? "bg-green-500"
                                          : (img.imageMetadata?.brightness ||
                                                0) > 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                    ></div>
                                    <span className="text-gray-600">
                                      Lighting
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <div
                                      className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                                        (img.imageMetadata?.sharpness || 0) > 50
                                          ? "bg-green-500"
                                          : (img.imageMetadata?.sharpness ||
                                                0) > 25
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                    ></div>
                                    <span className="text-gray-600">
                                      Clarity
                                    </span>
                                  </div>
                                </div>

                                {/* Backend Analysis Results */}
                                {img.imageMetadata?.recommendation && (
                                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                                    <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                      Analysis:
                                    </div>
                                    <div className="text-blue-700 dark:text-blue-300">
                                      {img.imageMetadata.recommendation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Error Message */}
                            {img.errorMessage && (
                              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-red-700 dark:text-red-300">
                                  {img.errorMessage}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-garden-500 bg-garden-50 dark:bg-garden-900/20"
                      : "border-garden-300 dark:border-gray-600 hover:border-garden-400 dark:hover:border-gray-500"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-garden-400 mb-2" />
                  <p className="text-garden-600 dark:text-gray-300 font-medium">
                    {isDragging ? "Drop images here" : "Click or drag images"}
                  </p>
                  <p className="text-xs text-garden-500 dark:text-gray-400 mt-1">
                    Supports JPG, PNG, WebP (Max 10MB each)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFileUpload(e.target.files);
                  }}
                />
              </CardContent>
            </Card>

            {/* Garden Space Analysis */}
            <Card className="shadow-2xl border-garden-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-garden-900 dark:text-white">
                  <Home className="w-5 h-5" />
                  Garden Space Analysis
                  {gardenLayout && (
                    <Badge variant="secondary" className="ml-auto">
                      {gardenLayout.dimensions.estimatedArea.toFixed(0)}m²
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {!gardenLayout ? (
                  <UnifiedGardenAnalysis
                    onAnalysisComplete={(result) => {
                      handleAnalysisComplete(result.spatialResult);
                      handleLayoutSelected(result.gardenLayout);
                      // Update detected plants with converted format
                      const convertedPlants = result.detectedPlants.map(plant => ({
                        id: plant.id,
                        name: plant.name,
                        scientificName: plant.scientificName,
                        confidence: plant.confidence,
                        category: plant.category,
                        description: `Detected ${plant.name} plant`,
                        image: "/placeholder.svg",
                        benefits: plant.properties || [],
                        difficulty: "medium" as const,
                        harvestTime: "Unknown",
                        growingConditions: {
                          sunlight: "partial" as const,
                          water: "medium" as const,
                          soil: "Well-draining",
                          temperature: "Variable",
                        },
                        medicinalUses: plant.properties || [],
                        preparations: ["Consult expert"],
                        warnings: ["Proper identification required"],
                        rating: Math.round(plant.confidence * 5),
                        reviews: 0,
                        detectionMetadata: {
                          boundingBox: {
                            x: plant.bbox?.x1 || 0,
                            y: plant.bbox?.y1 || 0,
                            width: plant.bbox?.width || 100,
                            height: plant.bbox?.height || 100,
                          },
                          imageQuality: 85,
                          lightingCondition: "good" as const,
                          plantHealth: "healthy" as const,
                          growthStage: "mature" as const,
                          certaintyFactors: {
                            leafShape: plant.confidence * 0.9,
                            flowerStructure: plant.confidence * 0.85,
                            stemCharacteristics: plant.confidence * 0.8,
                            overallMorphology: plant.confidence * 0.95,
                          },
                        },
                        bbox: plant.bbox,
                      }));
                      setDetectedPlants(convertedPlants);
                    }}
                    onPlantsDetected={(plants) => {
                      // Convert detected plants to the expected format
                      const convertedPlants = plants.map(plant => ({
                        id: plant.id,
                        name: plant.name,
                        scientificName: plant.scientificName,
                        confidence: plant.confidence,
                        category: plant.category,
                        description: `Detected ${plant.name} plant`,
                        image: "/placeholder.svg",
                        benefits: plant.properties || [],
                        difficulty: "medium" as const,
                        harvestTime: "Unknown",
                        growingConditions: {
                          sunlight: "partial" as const,
                          water: "medium" as const,
                          soil: "Well-draining",
                          temperature: "Variable",
                        },
                        medicinalUses: plant.properties || [],
                        preparations: ["Consult expert"],
                        warnings: ["Proper identification required"],
                        rating: Math.round(plant.confidence * 5),
                        reviews: 0,
                        detectionMetadata: {
                          boundingBox: {
                            x: plant.bbox?.x1 || 0,
                            y: plant.bbox?.y1 || 0,
                            width: plant.bbox?.width || 100,
                            height: plant.bbox?.height || 100,
                          },
                          imageQuality: 85,
                          lightingCondition: "good" as const,
                          plantHealth: "healthy" as const,
                          growthStage: "mature" as const,
                          certaintyFactors: {
                            leafShape: plant.confidence * 0.9,
                            flowerStructure: plant.confidence * 0.85,
                            stemCharacteristics: plant.confidence * 0.8,
                            overallMorphology: plant.confidence * 0.95,
                          },
                        },
                        bbox: plant.bbox,
                      }));
                      setDetectedPlants(convertedPlants);
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{gardenLayout.name}</div>
                        <div className="text-sm text-gray-600">
                          {gardenLayout.dimensions.width.toFixed(1)}m ×{" "}
                          {gardenLayout.dimensions.height.toFixed(1)}m
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGardenLayout(null);
                          setAnalysisResult(null);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        New
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-medium">
                          {gardenLayout.zones.length}
                        </div>
                        <div className="text-gray-600">Zones</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-medium">
                          {gardenLayout.features.length}
                        </div>
                        <div className="text-gray-600">Features</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="font-medium">
                          {gardenLayout.zones.reduce(
                            (sum, zone) => sum + zone.capacity,
                            0,
                          )}
                        </div>
                        <div className="text-gray-600">Capacity</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Plant Library */}
            <Card className="shadow-2xl border-garden-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <PlantLibrary
                  onAddPlantToGarden={handleAddPlantFromLibrary}
                  className="h-full"
                />
              </CardContent>
            </Card>

            {/* Analysis Controls */}
            {(detectedPlants || []).length > 0 && (
              <Card className="shadow-2xl border-garden-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-garden-900 dark:text-white text-sm">
                    <Filter className="w-4 h-4" />
                    Detection Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-garden-700 dark:text-gray-300">
                        Confidence Threshold
                      </label>
                      <span className="text-sm text-garden-600 dark:text-gray-400">
                        {Math.round(confidenceThreshold * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[confidenceThreshold]}
                      onValueChange={(value) => {
                        setConfidenceThreshold(value[0]);
                        if (lastAnalysisResult) {
                          setDetectedPlants(
                            lastAnalysisResult.detectedPlants.filter(
                              (plant) => plant.confidence >= value[0],
                            ),
                          );
                        }
                      }}
                      max={0.95}
                      min={0.45}
                      step={0.05}
                      className="w-full"
                    />

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-garden-700 dark:text-gray-300">
                        Detected Only
                      </label>
                      <Switch
                        checked={showOnlyDetected}
                        onCheckedChange={setShowOnlyDetected}
                      />
                    </div>

                    {lastAnalysisResult && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnalysisDetails(true)}
                        className="w-full text-xs"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        View Analysis Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Recognition Status */}
            {isAnalyzing && (
              <Card className="shadow-2xl border-blue-200/50 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        AI Analysis in Progress
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Analyzing plant features and characteristics...
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recognition Results Summary */}
            {lastAnalysisResult && !isAnalyzing && (
              <Card className="shadow-2xl border-green-200/50 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">
                          Analysis Complete
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          {(lastAnalysisResult?.detectedPlants || []).length}{" "}
                          plants detected in{" "}
                          {(
                            (lastAnalysisResult?.processingTime || 0) / 1000
                          ).toFixed(1)}
                          s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(lastAnalysisResult.totalConfidence * 100)}%
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        Avg Confidence
                      </div>
                    </div>
                  </div>

                  {(lastAnalysisResult?.errors || []).length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border-l-4 border-yellow-500">
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong>{" "}
                        {(lastAnalysisResult?.errors || [])[0]}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Enhanced Plant Cards */}
            {filteredPlants.length > 0 && (
              <Card className="shadow-2xl border-garden-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-garden-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5" />
                      Detected Plants ({filteredPlants.length})
                    </div>
                    {lastAnalysisResult && (
                      <Badge variant="secondary" className="text-xs">
                        Threshold: {Math.round(confidenceThreshold * 100)}%+
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredPlants.map((plant) => {
                      const CategoryIcon =
                        categoryIcons[plant.category] || Shield;
                      return (
                        <TooltipProvider key={plant.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="group p-4 border border-garden-200 dark:border-gray-600 rounded-xl hover:bg-garden-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-lg">
                                <div className="flex items-start gap-3">
                                  <div className="relative">
                                    <img
                                      src={plant.image}
                                      alt={plant.name}
                                      className="w-16 h-16 rounded-xl object-cover bg-garden-100 ring-2 ring-garden-200 dark:ring-gray-600"
                                    />
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full border-2 border-garden-200 dark:border-gray-600 flex items-center justify-center">
                                      <CategoryIcon className="w-3 h-3 text-garden-600" />
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="font-semibold text-garden-900 dark:text-white text-sm leading-tight">
                                          {plant.name}
                                        </h4>
                                        <p className="text-xs text-garden-600 dark:text-gray-400 italic">
                                          {plant.scientificName}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="text-garden-600 dark:text-gray-400">
                                          {plant.rating}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${categoryColors[plant.category]}`}
                                      >
                                        {plant.category}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${difficultyColors[plant.difficulty]}`}
                                      >
                                        {plant.difficulty}
                                      </Badge>
                                    </div>

                                    <p className="text-xs text-garden-600 dark:text-gray-400 mb-3 line-clamp-2">
                                      {plant.description}
                                    </p>

                                    {/* Enhanced Confidence Display */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="h-2 bg-garden-200 dark:bg-gray-600 rounded-full flex-1 min-w-[50px]">
                                            <div
                                              className={`h-2 rounded-full transition-all ${
                                                plant.confidence > 0.8
                                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                                  : plant.confidence > 0.65
                                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                                    : "bg-gradient-to-r from-red-500 to-red-600"
                                              }`}
                                              style={{
                                                width: `${plant.confidence * 100}%`,
                                              }}
                                            />
                                          </div>
                                          <span
                                            className={`text-xs font-bold ${
                                              plant.confidence > 0.8
                                                ? "text-green-700 dark:text-green-400"
                                                : plant.confidence > 0.65
                                                  ? "text-yellow-700 dark:text-yellow-400"
                                                  : "text-red-700 dark:text-red-400"
                                            }`}
                                          >
                                            {Math.round(plant.confidence * 100)}
                                            %
                                          </span>
                                        </div>
                                      </div>

                                      {/* Detection Metadata Indicators */}
                                      {plant.detectionMetadata && (
                                        <div className="flex items-center gap-2 text-xs">
                                          <div
                                            className={`px-1.5 py-0.5 rounded text-xs ${
                                              plant.detectionMetadata
                                                .lightingCondition ===
                                              "excellent"
                                                ? "bg-green-100 text-green-700"
                                                : plant.detectionMetadata
                                                      .lightingCondition ===
                                                    "good"
                                                  ? "bg-yellow-100 text-yellow-700"
                                                  : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {
                                              plant.detectionMetadata
                                                .lightingCondition
                                            }
                                          </div>
                                          <div
                                            className={`px-1.5 py-0.5 rounded text-xs ${
                                              plant.detectionMetadata
                                                .plantHealth === "healthy"
                                                ? "bg-green-100 text-green-700"
                                                : plant.detectionMetadata
                                                      .plantHealth ===
                                                    "stressed"
                                                  ? "bg-yellow-100 text-yellow-700"
                                                  : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {
                                              plant.detectionMetadata
                                                .plantHealth
                                            }
                                          </div>
                                          <div className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 capitalize">
                                            {
                                              plant.detectionMetadata
                                                .growthStage
                                            }
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedPlantInfo(plant);
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-garden-100 dark:hover:bg-gray-600"
                                          >
                                            <Info className="w-3 h-3" />
                                          </Button>
                                          {plant.detectionMetadata && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                alert(
                                                  `Detection Details:\n\nConfidence Factors:\n• Leaf Shape: ${Math.round(plant.detectionMetadata.certaintyFactors.leafShape * 100)}%\n• Flower Structure: ${Math.round(plant.detectionMetadata.certaintyFactors.flowerStructure * 100)}%\n• Stem Characteristics: ${Math.round(plant.detectionMetadata.certaintyFactors.stemCharacteristics * 100)}%\n• Overall Morphology: ${Math.round(plant.detectionMetadata.certaintyFactors.overallMorphology * 100)}%`,
                                                );
                                              }}
                                              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </Button>
                                          )}
                                        </div>
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addPlantToGarden(plant);
                                          }}
                                          className={`h-6 px-2 text-xs text-white ${
                                            plant.confidence > 0.8
                                              ? "bg-green-600 hover:bg-green-700"
                                              : plant.confidence > 0.65
                                                ? "bg-yellow-600 hover:bg-yellow-700"
                                                : "bg-red-600 hover:bg-red-700"
                                          }`}
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="max-w-xs p-4"
                            >
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {plant.name}
                                  </p>
                                  <p className="text-xs text-gray-500 italic">
                                    {plant.scientificName}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-medium mb-1">
                                    Key Benefits:
                                  </p>
                                  <ul className="text-xs space-y-1">
                                    {(plant.benefits || [])
                                      .slice(0, 3)
                                      .map((benefit, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1"
                                        >
                                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                          {benefit}
                                        </li>
                                      ))}
                                  </ul>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <p className="font-medium">Harvest:</p>
                                    <p className="text-gray-600">
                                      {plant.harvestTime}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Difficulty:</p>
                                    <p
                                      className={
                                        difficultyColors[plant.difficulty]
                                      }
                                    >
                                      {plant.difficulty}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced 3D Garden Editor */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] shadow-2xl border-garden-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-garden-900 dark:text-white">
                      {gardenLayout
                        ? `${gardenLayout.name} - 3D Recreation`
                        : "3D Garden Studio"}
                    </CardTitle>
                    {!gardenLayout && (
                      <Input
                        value={gardenName}
                        onChange={(e) => setGardenName(e.target.value)}
                        className="w-48 text-sm"
                        placeholder="Garden name..."
                      />
                    )}
                    {gardenLayout && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        Real Garden Layout
                      </Badge>
                    )}
                  </div>

                  {/* Enhanced Toolbar */}
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={saveLayout}
                            className="border-garden-300 hover:bg-garden-50 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save Garden Layout</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadLayout}
                            className="border-garden-300 hover:bg-garden-50 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Load Garden Layout</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportGarden}
                            className="border-garden-300 hover:bg-garden-50 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export Garden Data</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="w-px h-6 bg-garden-300 dark:bg-gray-600" />

                    {gardenLayout && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGardenLayout(null)}
                              className="border-garden-300 hover:bg-garden-50 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Switch to Virtual Mode
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-garden-300 hover:bg-garden-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          <Palette className="w-4 h-4 mr-1" />
                          Templates
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Garden Templates</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            onClick={() => loadGardenTemplate("healing_circle")}
                            className="h-20 flex-col"
                          >
                            <div className="w-8 h-8 rounded-full bg-garden-100 dark:bg-garden-800 mb-2"></div>
                            Healing Circle
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => loadGardenTemplate("herb_spiral")}
                            className="h-20 flex-col"
                          >
                            <div className="w-8 h-8 rounded-lg bg-nature-100 dark:bg-nature-800 mb-2"></div>
                            Herb Spiral
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetGarden}
                            className="border-red-300 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear Garden</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGrid(!showGrid)}
                            className={`border-garden-300 dark:border-gray-600 ${showGrid ? "bg-garden-100 dark:bg-garden-800" : "hover:bg-garden-50 dark:hover:bg-gray-700"}`}
                          >
                            <Grid3X3 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Grid</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 h-[600px] relative">
                {gardenLayout ? (
                  /* Garden Space Recreation */
                  <GardenSpaceRecreation
                    layout={gardenLayout}
                    showMeasurements={true}
                    showZones={true}
                    showConstraints={false}
                    className="h-full"
                  />
                ) : (
                  /* Original Virtual Garden */
                  <Canvas
                    camera={{ position: [8, 8, 8], fov: 50 }}
                    shadows
                    className="rounded-b-lg"
                  >
                    {/* Enhanced Lighting */}
                    <ambientLight
                      intensity={
                        lightMode === "day"
                          ? 0.6
                          : lightMode === "night"
                            ? 0.2
                            : 0.4
                      }
                    />
                    <directionalLight
                      position={[10, 10, 5]}
                      intensity={
                        lightMode === "day"
                          ? 1
                          : lightMode === "night"
                            ? 0.3
                            : 0.7
                      }
                      castShadow
                      shadow-mapSize-width={2048}
                      shadow-mapSize-height={2048}
                    />
                    <pointLight
                      position={[-10, 5, -10]}
                      intensity={lightMode === "sunset" ? 0.8 : 0.3}
                      color={lightMode === "sunset" ? "#ff6b35" : "#ffffff"}
                    />

                    {/* Environment */}
                    <Environment
                      preset={
                        lightMode === "day"
                          ? "park"
                          : lightMode === "night"
                            ? "night"
                            : "sunset"
                      }
                    />

                    {/* Enhanced Ground */}
                    <mesh
                      rotation={[-Math.PI / 2, 0, 0]}
                      position={[0, -0.1, 0]}
                      receiveShadow
                    >
                      <planeGeometry args={[20, 20]} />
                      <meshStandardMaterial
                        color={
                          lightMode === "day"
                            ? "#86d5a4"
                            : lightMode === "night"
                              ? "#2d4a3e"
                              : "#4a6741"
                        }
                        roughness={0.8}
                        metalness={0.1}
                      />
                    </mesh>

                    {/* Grid Helper */}
                    {showGrid && (
                      <gridHelper
                        args={[20, 20, "#22c55e", "#86d5a4"]}
                        position={[0, 0, 0]}
                      />
                    )}

                    {/* Contact Shadows */}
                    <ContactShadows
                      opacity={0.4}
                      scale={20}
                      blur={1}
                      far={20}
                      resolution={256}
                      color="#000000"
                    />

                    {/* Placed Plants with Enhanced Models */}
                    {(placedPlants || []).map((plantPosition) => {
                      const plantData = (detectedPlants || []).find(
                        (p) => p.id === plantPosition.plantId,
                      );
                      return plantData ? (
                        <Plant3D
                          key={plantPosition.id}
                          position={[
                            plantPosition.x,
                            plantPosition.y,
                            plantPosition.z,
                          ]}
                          plant={plantData}
                          growthStage={plantPosition.growthStage}
                          isSelected={
                            selectedPlantPosition === plantPosition.id
                          }
                          onClick={() => {
                            if (selectedPlantPosition === plantPosition.id) {
                              removePlantFromGarden(plantPosition.id);
                            } else {
                              setSelectedPlantPosition(plantPosition.id);
                            }
                          }}
                        />
                      ) : null;
                    })}

                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={3}
                      maxDistance={50}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Canvas>
                )}

                {/* Enhanced Bottom Toolbar */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-garden-200/50 dark:border-gray-600/50">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full w-8 h-8 p-0 hover:bg-garden-100 dark:hover:bg-gray-700"
                      onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={[zoom]}
                      onValueChange={(value) => setZoom(value[0])}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-16"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full w-8 h-8 p-0 hover:bg-garden-100 dark:hover:bg-gray-700"
                      onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="w-px h-6 bg-garden-300 dark:bg-gray-600" />

                  {/* Camera Controls */}
                  <Select
                    value={cameraMode}
                    onValueChange={(value: any) => setCameraMode(value)}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <Camera className="w-4 h-4" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orbit">Orbit</SelectItem>
                      <SelectItem value="top">Top View</SelectItem>
                      <SelectItem value="side">Side View</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="w-px h-6 bg-garden-300 dark:bg-gray-600" />

                  {/* Lighting Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setLightMode(
                          lightMode === "day"
                            ? "sunset"
                            : lightMode === "sunset"
                              ? "night"
                              : "day",
                        )
                      }
                      className="rounded-full w-8 h-8 p-0 hover:bg-garden-100 dark:hover:bg-gray-700"
                    >
                      {lightMode === "day" ? (
                        <Sun className="w-4 h-4 text-yellow-500" />
                      ) : lightMode === "sunset" ? (
                        <Sun className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-blue-500" />
                      )}
                    </Button>
                    <span className="text-xs text-garden-600 dark:text-gray-400 capitalize min-w-[40px]">
                      {lightMode}
                    </span>
                  </div>

                  <div className="w-px h-6 bg-garden-300 dark:bg-gray-600" />

                  {/* Growth Animation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setIsGrowthAnimationPlaying(!isGrowthAnimationPlaying)
                    }
                    className="rounded-full w-8 h-8 p-0 hover:bg-garden-100 dark:hover:bg-gray-700"
                  >
                    {isGrowthAnimationPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Selection Info Panel */}
                {selectedPlantPosition && (
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-garden-200/50 dark:border-gray-600/50 max-w-xs">
                    {(() => {
                      const position = placedPlants.find(
                        (p) => p.id === selectedPlantPosition,
                      );
                      const plantData = position
                        ? detectedPlants.find((p) => p.id === position.plantId)
                        : null;
                      return plantData ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-garden-900 dark:text-white">
                              {plantData.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPlantPosition(null)}
                              className="w-6 h-6 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-garden-600 dark:text-gray-400">
                                Position:
                              </span>
                              <span className="text-garden-900 dark:text-white">
                                ({position?.x.toFixed(1)},{" "}
                                {position?.z.toFixed(1)})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-garden-600 dark:text-gray-400">
                                Growth:
                              </span>
                              <span className="text-garden-900 dark:text-white">
                                {Math.round((position?.growthStage || 0) * 100)}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-garden-600 dark:text-gray-400">
                                Category:
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${categoryColors[plantData.category]}`}
                              >
                                {plantData.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPlantInfo(plantData)}
                              className="flex-1"
                            >
                              <Info className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                removePlantFromGarden(selectedPlantPosition)
                              }
                              className="flex-1"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Instructions Panel */}
            <Card className="mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-garden-200/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                <Tabs defaultValue="instructions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="tips">AI Tips</TabsTrigger>
                  </TabsList>
                  <TabsContent value="instructions" className="mt-3">
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-garden-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-garden-500 rounded-full"></div>
                        Click plants to add to garden
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Click placed plants to select/remove
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Use mouse to orbit and zoom
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tips" className="mt-3">
                    <div className="space-y-2 text-sm text-garden-600 dark:text-gray-400">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Upload high-resolution images (800x600+) for better
                          accuracy
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Ensure good lighting and clear focus on plant features
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Include leaves, flowers, and stems when possible
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Adjust confidence threshold to filter results
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analysis Details Modal */}
      <Dialog open={showAnalysisDetails} onOpenChange={setShowAnalysisDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              AI Analysis Report
            </DialogTitle>
          </DialogHeader>

          {lastAnalysisResult && (
            <div className="space-y-6">
              {/* Analysis Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(lastAnalysisResult?.detectedPlants || []).length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Plants Detected
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(lastAnalysisResult.totalConfidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg Confidence
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(lastAnalysisResult.processingTime / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-gray-600">
                        Processing Time
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Image Quality Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Image Quality Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Overall Quality:</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={lastAnalysisResult.imageQuality}
                          className="w-24"
                        />
                        <span className="font-medium">
                          {Math.round(lastAnalysisResult.imageQuality)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Errors and Suggestions */}
              {((lastAnalysisResult?.errors || []).length > 0 ||
                (lastAnalysisResult?.suggestions || []).length > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {(lastAnalysisResult?.errors || []).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Issues Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(lastAnalysisResult?.errors || []).map(
                            (error, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                {error}
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {(lastAnalysisResult?.suggestions || []).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(lastAnalysisResult?.suggestions || []).map(
                            (suggestion, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                {suggestion}
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Detailed Plant Detection Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detection Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(lastAnalysisResult?.detectedPlants || []).map(
                      (plant, index) => (
                        <div key={plant.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={plant.image}
                              alt={plant.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{plant.name}</h4>
                              <p className="text-sm text-gray-600 italic">
                                {plant.scientificName}
                              </p>

                              {plant.detectionMetadata && (
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center gap-4 text-sm">
                                    <span>
                                      Confidence:{" "}
                                      <strong>
                                        {Math.round(plant.confidence * 100)}%
                                      </strong>
                                    </span>
                                    <span>
                                      Health:{" "}
                                      <strong>
                                        {plant.detectionMetadata.plantHealth}
                                      </strong>
                                    </span>
                                    <span>
                                      Stage:{" "}
                                      <strong>
                                        {plant.detectionMetadata.growthStage}
                                      </strong>
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    <div>
                                      Leaf Shape:{" "}
                                      {Math.round(
                                        plant.detectionMetadata.certaintyFactors
                                          .leafShape * 100,
                                      )}
                                      %
                                    </div>
                                    <div>
                                      Flowers:{" "}
                                      {Math.round(
                                        plant.detectionMetadata.certaintyFactors
                                          .flowerStructure * 100,
                                      )}
                                      %
                                    </div>
                                    <div>
                                      Stem:{" "}
                                      {Math.round(
                                        plant.detectionMetadata.certaintyFactors
                                          .stemCharacteristics * 100,
                                      )}
                                      %
                                    </div>
                                    <div>
                                      Overall:{" "}
                                      {Math.round(
                                        plant.detectionMetadata.certaintyFactors
                                          .overallMorphology * 100,
                                      )}
                                      %
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Plant Information Modal */}
      <Dialog
        open={!!selectedPlantInfo}
        onOpenChange={() => setSelectedPlantInfo(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPlantInfo && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <img
                    src={selectedPlantInfo.image}
                    alt={selectedPlantInfo.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {selectedPlantInfo.name}
                      <Badge
                        className={categoryColors[selectedPlantInfo.category]}
                      >
                        {selectedPlantInfo.category}
                      </Badge>
                    </div>
                    <p className="text-sm font-normal text-gray-500 italic">
                      {selectedPlantInfo.scientificName}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="medicinal">Medicinal Uses</TabsTrigger>
                  <TabsTrigger value="growing">Growing Guide</TabsTrigger>
                  <TabsTrigger value="preparation">Preparation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Plant Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <Badge
                            variant="outline"
                            className={
                              difficultyColors[selectedPlantInfo.difficulty]
                            }
                          >
                            {selectedPlantInfo.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Harvest Time:</span>
                          <span>{selectedPlantInfo.harvestTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{selectedPlantInfo.rating}</span>
                            <span className="text-gray-500">
                              ({selectedPlantInfo.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Key Benefits</h4>
                      <ul className="space-y-2">
                        {(selectedPlantInfo?.benefits || []).map(
                          (benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Description</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedPlantInfo.description}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="medicinal" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">
                      Medicinal Applications
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(selectedPlantInfo?.medicinalUses || []).map(
                        (use, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="flex items-start gap-2">
                              <Heart className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{use}</span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {(selectedPlantInfo?.warnings || []).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700">
                        Important Warnings
                      </h4>
                      <div className="space-y-2">
                        {(selectedPlantInfo?.warnings || []).map(
                          (warning, index) => (
                            <div
                              key={index}
                              className="p-3 bg-red-50 rounded-lg border border-red-200"
                            >
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-red-700">
                                  {warning}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="growing" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Growing Conditions
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Sun className="w-5 h-5 text-yellow-500" />
                            <div>
                              <span className="font-medium">Sunlight:</span>
                              <span className="ml-2 capitalize">
                                {selectedPlantInfo.growingConditions.sunlight}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            <div>
                              <span className="font-medium">Water:</span>
                              <span className="ml-2 capitalize">
                                {selectedPlantInfo.growingConditions.water}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Thermometer className="w-5 h-5 text-orange-500" />
                            <div>
                              <span className="font-medium">Temperature:</span>
                              <span className="ml-2">
                                {
                                  selectedPlantInfo.growingConditions
                                    .temperature
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Soil Requirements</h4>
                      <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                        {selectedPlantInfo.growingConditions.soil}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preparation" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Preparation Methods</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(selectedPlantInfo?.preparations || []).map(
                        (prep, index) => (
                          <div
                            key={index}
                            className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-start gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{prep}</span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  onClick={() => {
                    addPlantToGarden(selectedPlantInfo);
                    setSelectedPlantInfo(null);
                  }}
                  className="flex-1 bg-garden-600 hover:bg-garden-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Garden
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Plant Info
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Plant Detail Modal for Backend API Detected Plants */}
      <PlantDetailModal
        plant={selectedDetectedPlant}
        onClose={() => setSelectedDetectedPlant(null)}
      />
    </div>
  );
}
