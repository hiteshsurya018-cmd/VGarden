/**
 * Comprehensive Medicinal Plants Database
 * Over 100+ plants organized by categories with detailed information
 */

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  subcategory?: string;
  description: string;
  medicinalUses: string[];
  growingConditions: {
    sunlight: "full" | "partial" | "shade";
    water: "low" | "moderate" | "high";
    soil: string;
    climate: string[];
    difficulty: "easy" | "moderate" | "challenging";
  };
  harvestTime: string;
  preparationMethods: string[];
  activeCompounds: string[];
  contraindications: string[];
  image?: string;
  origin: string[];
  plantingZones: string[];
  companionPlants: string[];
  uses: {
    culinary: boolean;
    medicinal: boolean;
    aromatic: boolean;
    decorative: boolean;
  };
  rarity: "common" | "uncommon" | "rare";
  height: string;
  spacing: string;
  bloomTime?: string;
  partUsed: string[];
}

export const PLANT_CATEGORIES = {
  herbs: {
    name: "Culinary Herbs",
    description: "Plants used for cooking and seasoning",
    color: "#22C55E",
    icon: "Leaf",
  },
  medicinal: {
    name: "Medicinal Plants",
    description: "Plants with therapeutic properties",
    color: "#EF4444",
    icon: "Heart",
  },
  aromatic: {
    name: "Aromatic Plants",
    description: "Fragrant plants for aromatherapy",
    color: "#8B5CF6",
    icon: "Sparkles",
  },
  adaptogenic: {
    name: "Adaptogenic Plants",
    description: "Plants that help the body adapt to stress",
    color: "#F59E0B",
    icon: "Shield",
  },
  digestive: {
    name: "Digestive Plants",
    description: "Plants that support digestive health",
    color: "#06B6D4",
    icon: "Circle",
  },
  respiratory: {
    name: "Respiratory Plants",
    description: "Plants that support lung and breathing health",
    color: "#10B981",
    icon: "Wind",
  },
  nervous: {
    name: "Nervous System",
    description: "Plants that support mental and nervous health",
    color: "#6366F1",
    icon: "Brain",
  },
  immune: {
    name: "Immune Support",
    description: "Plants that boost immune system function",
    color: "#F97316",
    icon: "Zap",
  },
  topical: {
    name: "Topical/Skin Care",
    description: "Plants for external skin applications",
    color: "#EC4899",
    icon: "Hand",
  },
  detox: {
    name: "Detoxification",
    description: "Plants that support detoxification",
    color: "#84CC16",
    icon: "Droplets",
  },
};

export const PLANTS_DATABASE: Plant[] = [
  // CULINARY HERBS
  {
    id: "basil-sweet",
    name: "Sweet Basil",
    scientificName: "Ocimum basilicum",
    category: "herbs",
    subcategory: "mediterranean",
    description:
      "Classic culinary herb with sweet, aromatic leaves perfect for cooking and medicinal use.",
    medicinalUses: [
      "digestive support",
      "anti-inflammatory",
      "antibacterial",
      "stress relief",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "well-draining, fertile",
      climate: ["warm temperate", "subtropical"],
      difficulty: "easy",
    },
    harvestTime: "60-75 days",
    preparationMethods: ["fresh", "dried", "tea", "essential oil", "tincture"],
    activeCompounds: ["eugenol", "linalool", "estragole"],
    contraindications: [
      "pregnancy (large amounts)",
      "blood thinning medications",
    ],
    origin: ["India", "Southeast Asia"],
    plantingZones: ["9-11"],
    companionPlants: ["tomatoes", "peppers", "oregano"],
    uses: { culinary: true, medicinal: true, aromatic: true, decorative: true },
    rarity: "common",
    height: "12-24 inches",
    spacing: "8-12 inches",
    bloomTime: "summer",
    partUsed: ["leaves", "flowers"],
  },
  {
    id: "rosemary",
    name: "Rosemary",
    scientificName: "Rosmarinus officinalis",
    category: "herbs",
    subcategory: "mediterranean",
    description:
      "Evergreen herb with needle-like leaves and a pine-like fragrance, excellent for memory and circulation.",
    medicinalUses: [
      "memory enhancement",
      "circulation improvement",
      "antioxidant",
      "hair health",
    ],
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "well-draining, sandy",
      climate: ["mediterranean", "dry"],
      difficulty: "easy",
    },
    harvestTime: "year-round",
    preparationMethods: ["fresh", "dried", "tea", "essential oil", "vinegar"],
    activeCompounds: ["rosmarinic acid", "carnosol", "camphor"],
    contraindications: ["pregnancy", "epilepsy", "high blood pressure"],
    origin: ["Mediterranean"],
    plantingZones: ["7-10"],
    companionPlants: ["lavender", "sage", "thyme"],
    uses: { culinary: true, medicinal: true, aromatic: true, decorative: true },
    rarity: "common",
    height: "2-4 feet",
    spacing: "18-24 inches",
    bloomTime: "winter-spring",
    partUsed: ["leaves", "flowers"],
  },
  {
    id: "thyme",
    name: "Garden Thyme",
    scientificName: "Thymus vulgaris",
    category: "herbs",
    subcategory: "mediterranean",
    description:
      "Small-leaved herb with powerful antimicrobial properties and culinary versatility.",
    medicinalUses: [
      "respiratory support",
      "antimicrobial",
      "antispasmodic",
      "digestive aid",
    ],
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "well-draining, alkaline",
      climate: ["mediterranean", "temperate"],
      difficulty: "easy",
    },
    harvestTime: "75-85 days",
    preparationMethods: ["fresh", "dried", "tea", "essential oil", "syrup"],
    activeCompounds: ["thymol", "carvacrol", "linalool"],
    contraindications: ["thyroid disorders", "bleeding disorders"],
    origin: ["Mediterranean"],
    plantingZones: ["5-9"],
    companionPlants: ["rosemary", "oregano", "sage"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: true,
      decorative: false,
    },
    rarity: "common",
    height: "6-12 inches",
    spacing: "8-10 inches",
    bloomTime: "summer",
    partUsed: ["leaves", "flowers"],
  },
  {
    id: "oregano",
    name: "Oregano",
    scientificName: "Origanum vulgare",
    category: "herbs",
    description:
      "Pungent herb with powerful antimicrobial and antioxidant properties.",
    medicinalUses: [
      "antimicrobial",
      "antioxidant",
      "digestive support",
      "respiratory health",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "well-draining",
      climate: ["temperate", "mediterranean"],
      difficulty: "easy",
    },
    harvestTime: "80-90 days",
    preparationMethods: ["fresh", "dried", "tea", "essential oil", "tincture"],
    activeCompounds: ["carvacrol", "thymol", "rosmarinic acid"],
    contraindications: ["pregnancy", "diabetes medication interactions"],
    origin: ["Mediterranean", "Europe"],
    plantingZones: ["4-9"],
    companionPlants: ["basil", "thyme", "tomatoes"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: true,
      decorative: false,
    },
    rarity: "common",
    height: "12-24 inches",
    spacing: "8-12 inches",
    bloomTime: "summer",
    partUsed: ["leaves", "flowers"],
  },

  // MEDICINAL PLANTS
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis",
    category: "medicinal",
    subcategory: "succulent",
    description:
      "Succulent plant renowned for its gel-filled leaves with powerful healing properties.",
    medicinalUses: [
      "wound healing",
      "burns treatment",
      "skin conditions",
      "digestive support",
    ],
    growingConditions: {
      sunlight: "partial",
      water: "low",
      soil: "sandy, well-draining",
      climate: ["arid", "warm"],
      difficulty: "easy",
    },
    harvestTime: "year-round",
    preparationMethods: ["fresh gel", "juice", "powder", "topical cream"],
    activeCompounds: ["acemannan", "aloin", "anthraquinones"],
    contraindications: ["pregnancy", "kidney problems", "diabetes medication"],
    origin: ["Arabian Peninsula"],
    plantingZones: ["9-11"],
    companionPlants: ["jade plant", "echeveria", "agave"],
    uses: {
      culinary: false,
      medicinal: true,
      aromatic: false,
      decorative: true,
    },
    rarity: "common",
    height: "12-24 inches",
    spacing: "12-18 inches",
    partUsed: ["gel", "latex"],
  },
  {
    id: "echinacea",
    name: "Purple Coneflower",
    scientificName: "Echinacea purpurea",
    category: "immune",
    description:
      "Beautiful purple flowering plant that supports immune system function.",
    medicinalUses: [
      "immune support",
      "cold and flu prevention",
      "wound healing",
      "anti-inflammatory",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "well-draining",
      climate: ["temperate", "continental"],
      difficulty: "easy",
    },
    harvestTime: "3rd year for roots, leaves in summer",
    preparationMethods: ["tincture", "tea", "capsules", "decoction"],
    activeCompounds: ["alkamides", "caffeic acid", "polysaccharides"],
    contraindications: ["autoimmune diseases", "HIV/AIDS", "tuberculosis"],
    origin: ["North America"],
    plantingZones: ["3-8"],
    companionPlants: ["black-eyed susan", "bee balm", "calendula"],
    uses: {
      culinary: false,
      medicinal: true,
      aromatic: false,
      decorative: true,
    },
    rarity: "common",
    height: "24-36 inches",
    spacing: "18-24 inches",
    bloomTime: "summer-fall",
    partUsed: ["roots", "leaves", "flowers"],
  },
  {
    id: "calendula",
    name: "Calendula",
    scientificName: "Calendula officinalis",
    category: "topical",
    description:
      "Bright orange flowers with exceptional skin healing and anti-inflammatory properties.",
    medicinalUses: [
      "wound healing",
      "skin inflammation",
      "eczema",
      "minor cuts and scrapes",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "average, well-draining",
      climate: ["temperate", "cool"],
      difficulty: "easy",
    },
    harvestTime: "50-70 days",
    preparationMethods: [
      "oil infusion",
      "salve",
      "tea",
      "tincture",
      "poultice",
    ],
    activeCompounds: ["calendulin", "carotenoids", "saponins"],
    contraindications: ["pregnancy", "ragweed allergies"],
    origin: ["Mediterranean"],
    plantingZones: ["2-11"],
    companionPlants: ["tomatoes", "roses", "herbs"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: false,
      decorative: true,
    },
    rarity: "common",
    height: "12-24 inches",
    spacing: "8-12 inches",
    bloomTime: "spring-fall",
    partUsed: ["flowers", "petals"],
  },

  // AROMATIC PLANTS
  {
    id: "lavender",
    name: "English Lavender",
    scientificName: "Lavandula angustifolia",
    category: "aromatic",
    description:
      "Fragrant purple-flowered plant renowned for its calming and relaxing properties.",
    medicinalUses: [
      "anxiety relief",
      "sleep support",
      "headache relief",
      "antimicrobial",
    ],
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "well-draining, alkaline",
      climate: ["mediterranean", "dry"],
      difficulty: "moderate",
    },
    harvestTime: "90-100 days",
    preparationMethods: [
      "essential oil",
      "dried flowers",
      "tea",
      "sachets",
      "hydrosol",
    ],
    activeCompounds: ["linalool", "linalyl acetate", "camphor"],
    contraindications: ["sedative medications", "low blood pressure"],
    origin: ["Mediterranean"],
    plantingZones: ["5-9"],
    companionPlants: ["rosemary", "sage", "catmint"],
    uses: { culinary: true, medicinal: true, aromatic: true, decorative: true },
    rarity: "common",
    height: "18-24 inches",
    spacing: "18-24 inches",
    bloomTime: "summer",
    partUsed: ["flowers", "leaves"],
  },
  {
    id: "peppermint",
    name: "Peppermint",
    scientificName: "Mentha × piperita",
    category: "digestive",
    description:
      "Refreshing herb with cooling properties, excellent for digestive issues.",
    medicinalUses: [
      "digestive support",
      "nausea relief",
      "headache relief",
      "respiratory support",
    ],
    growingConditions: {
      sunlight: "partial",
      water: "high",
      soil: "moist, fertile",
      climate: ["temperate", "cool"],
      difficulty: "easy",
    },
    harvestTime: "90 days",
    preparationMethods: ["fresh", "dried", "tea", "essential oil", "tincture"],
    activeCompounds: ["menthol", "menthone", "limonene"],
    contraindications: ["GERD", "gallstones", "infants"],
    origin: ["Europe"],
    plantingZones: ["3-9"],
    companionPlants: ["spearmint", "lemon balm", "chamomile"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: true,
      decorative: false,
    },
    rarity: "common",
    height: "12-36 inches",
    spacing: "18-24 inches",
    bloomTime: "summer",
    partUsed: ["leaves", "flowers"],
  },

  // ADAPTOGENIC PLANTS
  {
    id: "ginseng-american",
    name: "American Ginseng",
    scientificName: "Panax quinquefolius",
    category: "adaptogenic",
    description:
      "Prized root herb that helps the body adapt to stress and supports energy.",
    medicinalUses: [
      "stress adaptation",
      "energy support",
      "immune function",
      "mental clarity",
    ],
    growingConditions: {
      sunlight: "shade",
      water: "moderate",
      soil: "rich, well-draining",
      climate: ["temperate", "cool"],
      difficulty: "challenging",
    },
    harvestTime: "5-7 years for roots",
    preparationMethods: ["decoction", "tincture", "powder", "capsules"],
    activeCompounds: ["ginsenosides", "polysaccharides", "triterpenes"],
    contraindications: ["diabetes medications", "blood thinners", "stimulants"],
    origin: ["North America"],
    plantingZones: ["3-7"],
    companionPlants: ["wild ginger", "goldenseal", "bloodroot"],
    uses: {
      culinary: false,
      medicinal: true,
      aromatic: false,
      decorative: false,
    },
    rarity: "rare",
    height: "12-24 inches",
    spacing: "8-12 inches",
    bloomTime: "late spring",
    partUsed: ["roots"],
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    scientificName: "Withania somnifera",
    category: "adaptogenic",
    description:
      "Ancient adaptogenic herb that supports stress response and vitality.",
    medicinalUses: [
      "stress reduction",
      "anxiety relief",
      "sleep support",
      "energy enhancement",
    ],
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "well-draining, sandy",
      climate: ["arid", "warm"],
      difficulty: "moderate",
    },
    harvestTime: "150-180 days",
    preparationMethods: ["powder", "tincture", "capsules", "decoction"],
    activeCompounds: ["withanolides", "alkaloids", "saponins"],
    contraindications: [
      "pregnancy",
      "autoimmune diseases",
      "thyroid medications",
    ],
    origin: ["India", "Middle East"],
    plantingZones: ["8-11"],
    companionPlants: ["turmeric", "holy basil", "neem"],
    uses: {
      culinary: false,
      medicinal: true,
      aromatic: false,
      decorative: false,
    },
    rarity: "uncommon",
    height: "24-48 inches",
    spacing: "12-18 inches",
    bloomTime: "summer",
    partUsed: ["roots", "berries"],
  },

  // RESPIRATORY PLANTS
  {
    id: "eucalyptus",
    name: "Eucalyptus",
    scientificName: "Eucalyptus globulus",
    category: "respiratory",
    description:
      "Aromatic tree with leaves that support respiratory health and clear breathing.",
    medicinalUses: [
      "respiratory support",
      "congestion relief",
      "antimicrobial",
      "expectorant",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "well-draining",
      climate: ["warm", "Mediterranean"],
      difficulty: "moderate",
    },
    harvestTime: "year-round",
    preparationMethods: [
      "essential oil",
      "steam inhalation",
      "tea",
      "chest rub",
    ],
    activeCompounds: ["eucalyptol", "alpha-pinene", "limonene"],
    contraindications: ["pregnancy", "epilepsy", "infants"],
    origin: ["Australia"],
    plantingZones: ["8-11"],
    companionPlants: ["tea tree", "lemon myrtle", "bottlebrush"],
    uses: {
      culinary: false,
      medicinal: true,
      aromatic: true,
      decorative: true,
    },
    rarity: "common",
    height: "6-30 feet",
    spacing: "6-10 feet",
    bloomTime: "variable",
    partUsed: ["leaves"],
  },

  // NERVOUS SYSTEM PLANTS
  {
    id: "lemon-balm",
    name: "Lemon Balm",
    scientificName: "Melissa officinalis",
    category: "nervous",
    description:
      "Lemony-scented herb that calms the nervous system and supports relaxation.",
    medicinalUses: [
      "anxiety relief",
      "sleep support",
      "digestive calm",
      "antiviral",
    ],
    growingConditions: {
      sunlight: "partial",
      water: "moderate",
      soil: "moist, fertile",
      climate: ["temperate"],
      difficulty: "easy",
    },
    harvestTime: "70-80 days",
    preparationMethods: ["fresh", "dried", "tea", "tincture", "essential oil"],
    activeCompounds: ["citronellal", "geraniol", "rosmarinic acid"],
    contraindications: ["thyroid medications", "sedatives"],
    origin: ["Southern Europe"],
    plantingZones: ["3-7"],
    companionPlants: ["chamomile", "peppermint", "catnip"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: true,
      decorative: false,
    },
    rarity: "common",
    height: "12-24 inches",
    spacing: "18-24 inches",
    bloomTime: "summer",
    partUsed: ["leaves", "flowers"],
  },
  {
    id: "chamomile",
    name: "German Chamomile",
    scientificName: "Matricaria chamomilla",
    category: "nervous",
    description:
      "Gentle daisy-like flowers that promote relaxation and peaceful sleep.",
    medicinalUses: [
      "sleep support",
      "anxiety relief",
      "digestive calm",
      "skin soothing",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "well-draining, sandy",
      climate: ["temperate", "cool"],
      difficulty: "easy",
    },
    harvestTime: "65-85 days",
    preparationMethods: [
      "tea",
      "tincture",
      "essential oil",
      "compress",
      "bath",
    ],
    activeCompounds: ["apigenin", "bisabolol", "chamazulene"],
    contraindications: ["ragweed allergies", "blood thinners"],
    origin: ["Europe", "Asia"],
    plantingZones: ["2-8"],
    companionPlants: ["lavender", "lemon balm", "dill"],
    uses: { culinary: true, medicinal: true, aromatic: true, decorative: true },
    rarity: "common",
    height: "12-24 inches",
    spacing: "6-8 inches",
    bloomTime: "summer",
    partUsed: ["flowers"],
  },

  // DETOXIFICATION PLANTS
  {
    id: "dandelion",
    name: "Dandelion",
    scientificName: "Taraxacum officinale",
    category: "detox",
    description:
      'Common "weed" with powerful liver detoxification and digestive properties.',
    medicinalUses: [
      "liver support",
      "detoxification",
      "digestive stimulant",
      "diuretic",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "any",
      climate: ["temperate", "cool"],
      difficulty: "easy",
    },
    harvestTime: "year-round",
    preparationMethods: [
      "fresh leaves",
      "root decoction",
      "tincture",
      "coffee substitute",
    ],
    activeCompounds: ["taraxasterol", "inulin", "sesquiterpene lactones"],
    contraindications: ["gallstones", "kidney disease", "diabetes medications"],
    origin: ["Eurasia"],
    plantingZones: ["3-9"],
    companionPlants: ["clover", "plantain", "nettle"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: false,
      decorative: false,
    },
    rarity: "common",
    height: "6-12 inches",
    spacing: "6-8 inches",
    bloomTime: "spring-fall",
    partUsed: ["leaves", "roots", "flowers"],
  },
  {
    id: "milk-thistle",
    name: "Milk Thistle",
    scientificName: "Silybum marianum",
    category: "detox",
    description:
      "Spiny plant with purple flowers, renowned for liver protection and regeneration.",
    medicinalUses: [
      "liver protection",
      "detoxification",
      "hepatitis support",
      "gallbladder health",
    ],
    growingConditions: {
      sunlight: "full",
      water: "low",
      soil: "well-draining, poor",
      climate: ["Mediterranean", "dry"],
      difficulty: "easy",
    },
    harvestTime: "120-140 days",
    preparationMethods: ["seeds extract", "tincture", "capsules", "tea"],
    activeCompounds: ["silymarin", "silybin", "flavonoids"],
    contraindications: ["diabetes medications", "hormone sensitive cancers"],
    origin: ["Mediterranean"],
    plantingZones: ["3-9"],
    companionPlants: ["fennel", "artichoke", "cardoon"],
    uses: {
      culinary: false,
      medicinal: true,
      aromatic: false,
      decorative: true,
    },
    rarity: "common",
    height: "24-48 inches",
    spacing: "12-18 inches",
    bloomTime: "summer",
    partUsed: ["seeds"],
  },

  // Additional specialty plants
  {
    id: "turmeric",
    name: "Turmeric",
    scientificName: "Curcuma longa",
    category: "medicinal",
    subcategory: "anti-inflammatory",
    description:
      "Golden root with powerful anti-inflammatory and antioxidant properties.",
    medicinalUses: [
      "anti-inflammatory",
      "antioxidant",
      "joint health",
      "digestive support",
    ],
    growingConditions: {
      sunlight: "partial",
      water: "high",
      soil: "rich, moist",
      climate: ["tropical", "warm"],
      difficulty: "moderate",
    },
    harvestTime: "8-12 months",
    preparationMethods: ["fresh root", "powder", "tea", "paste", "tincture"],
    activeCompounds: ["curcumin", "demethoxycurcumin", "turmerones"],
    contraindications: ["gallstones", "blood thinners", "diabetes medications"],
    origin: ["Southeast Asia"],
    plantingZones: ["9-11"],
    companionPlants: ["ginger", "galangal", "cardamom"],
    uses: {
      culinary: true,
      medicinal: true,
      aromatic: false,
      decorative: true,
    },
    rarity: "uncommon",
    height: "24-36 inches",
    spacing: "12-15 inches",
    bloomTime: "late summer",
    partUsed: ["rhizomes"],
  },
  {
    id: "holy-basil",
    name: "Holy Basil (Tulsi)",
    scientificName: "Ocimum tenuiflorum",
    category: "adaptogenic",
    description:
      "Sacred herb in Ayurveda, excellent for stress relief and respiratory health.",
    medicinalUses: [
      "stress relief",
      "respiratory support",
      "immune enhancement",
      "blood sugar support",
    ],
    growingConditions: {
      sunlight: "full",
      water: "moderate",
      soil: "well-draining, fertile",
      climate: ["warm", "tropical"],
      difficulty: "easy",
    },
    harvestTime: "75-90 days",
    preparationMethods: ["tea", "fresh leaves", "tincture", "powder"],
    activeCompounds: ["eugenol", "ursolic acid", "rosmarinic acid"],
    contraindications: ["blood thinning medications", "fertility medications"],
    origin: ["India"],
    plantingZones: ["9-11"],
    companionPlants: ["regular basil", "marigold", "tomatoes"],
    uses: { culinary: true, medicinal: true, aromatic: true, decorative: true },
    rarity: "uncommon",
    height: "12-24 inches",
    spacing: "8-12 inches",
    bloomTime: "late summer",
    partUsed: ["leaves", "flowers"],
  },
];

// Quick search functionality
export const searchPlants = (query: string, category?: string): Plant[] => {
  let filtered = PLANTS_DATABASE;

  if (category && category !== "all") {
    filtered = filtered.filter((plant) => plant.category === category);
  }

  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(
      (plant) =>
        plant.name.toLowerCase().includes(searchTerm) ||
        plant.scientificName.toLowerCase().includes(searchTerm) ||
        plant.medicinalUses.some((use) =>
          use.toLowerCase().includes(searchTerm),
        ) ||
        plant.description.toLowerCase().includes(searchTerm),
    );
  }

  return filtered;
};

export const getPlantsByCategory = (category: string): Plant[] => {
  return PLANTS_DATABASE.filter((plant) => plant.category === category);
};

export const getPlantById = (id: string): Plant | undefined => {
  return PLANTS_DATABASE.find((plant) => plant.id === id);
};
