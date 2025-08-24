import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { gardenAPI } from '../../services/api';

export interface PlantInstance {
  id: string;
  speciesId: string;
  species: {
    id: string;
    name: string;
    scientificName?: string;
    category: string;
    imageUrl?: string;
    careLevel: string;
    growthTime?: number;
  };
  x: number;
  y: number;
  z?: number;
  rotation?: number;
  scale?: number;
  growthStage: number;
  health: number;
  waterLevel: number;
  lastWatered?: string;
  lastHarvested?: string;
  plantedAt: string;
  isAIDetected: boolean;
  detectionData?: any;
}

export interface Garden {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  layoutData?: any;
  imageUrl?: string;
  width?: number;
  height?: number;
  plantsCount: number;
  level: number;
  experience: number;
  createdAt: string;
  updatedAt: string;
  plants: PlantInstance[];
}

interface GardenState {
  currentGarden: Garden | null;
  gardens: Garden[];
  isLoading: boolean;
  error: string | null;
  analysisInProgress: boolean;
  analysisId: string | null;
}

const initialState: GardenState = {
  currentGarden: null,
  gardens: [],
  isLoading: false,
  error: null,
  analysisInProgress: false,
  analysisId: null,
};

// Async thunks
export const createGarden = createAsyncThunk(
  'garden/create',
  async (gardenData: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.createGarden(gardenData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create garden');
    }
  }
);

export const fetchUserGardens = createAsyncThunk(
  'garden/fetchUserGardens',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.getUserGardens();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch gardens');
    }
  }
);

export const analyzeGardenImage = createAsyncThunk(
  'garden/analyzeImage',
  async (imageFile: File, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.analyzeGardenImage(imageFile);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to analyze image');
    }
  }
);

export const getAnalysisStatus = createAsyncThunk(
  'garden/getAnalysisStatus',
  async (analysisId: string, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.getAnalysisStatus(analysisId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get analysis status');
    }
  }
);

export const addPlantToGarden = createAsyncThunk(
  'garden/addPlant',
  async (plantData: {
    gardenId: string;
    speciesId: string;
    x: number;
    y: number;
    z?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.addPlantToGarden(plantData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add plant');
    }
  }
);

export const waterPlant = createAsyncThunk(
  'garden/waterPlant',
  async (plantId: string, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.waterPlant(plantId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to water plant');
    }
  }
);

export const harvestPlant = createAsyncThunk(
  'garden/harvestPlant',
  async (plantId: string, { rejectWithValue }) => {
    try {
      const response = await gardenAPI.harvestPlant(plantId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to harvest plant');
    }
  }
);

const gardenSlice = createSlice({
  name: 'garden',
  initialState,
  reducers: {
    setCurrentGarden: (state, action: PayloadAction<Garden | null>) => {
      state.currentGarden = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePlantPosition: (state, action: PayloadAction<{
      plantId: string;
      x: number;
      y: number;
      z?: number;
    }>) => {
      if (state.currentGarden) {
        const plant = state.currentGarden.plants.find(p => p.id === action.payload.plantId);
        if (plant) {
          plant.x = action.payload.x;
          plant.y = action.payload.y;
          if (action.payload.z !== undefined) {
            plant.z = action.payload.z;
          }
        }
      }
    },
    updatePlantGrowth: (state, action: PayloadAction<{
      plantId: string;
      growthStage: number;
      health: number;
      waterLevel: number;
    }>) => {
      if (state.currentGarden) {
        const plant = state.currentGarden.plants.find(p => p.id === action.payload.plantId);
        if (plant) {
          plant.growthStage = action.payload.growthStage;
          plant.health = action.payload.health;
          plant.waterLevel = action.payload.waterLevel;
        }
      }
    },
    removePlantFromGarden: (state, action: PayloadAction<string>) => {
      if (state.currentGarden) {
        state.currentGarden.plants = state.currentGarden.plants.filter(
          p => p.id !== action.payload
        );
        state.currentGarden.plantsCount = state.currentGarden.plants.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Garden
      .addCase(createGarden.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGarden.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gardens.push(action.payload);
        state.currentGarden = action.payload;
      })
      .addCase(createGarden.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Gardens
      .addCase(fetchUserGardens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGardens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gardens = action.payload;
      })
      .addCase(fetchUserGardens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Analyze Garden Image
      .addCase(analyzeGardenImage.pending, (state) => {
        state.analysisInProgress = true;
        state.error = null;
      })
      .addCase(analyzeGardenImage.fulfilled, (state, action) => {
        state.analysisInProgress = true; // Keep true until analysis completes
        state.analysisId = action.payload.analysisId;
      })
      .addCase(analyzeGardenImage.rejected, (state, action) => {
        state.analysisInProgress = false;
        state.error = action.payload as string;
      })
      // Get Analysis Status
      .addCase(getAnalysisStatus.fulfilled, (state, action) => {
        if (action.payload.status === 'completed') {
          state.analysisInProgress = false;
          state.analysisId = null;
          
          // Update current garden with analysis results
          if (state.currentGarden && action.payload.gardenLayout) {
            state.currentGarden.layoutData = action.payload.gardenLayout;
          }
        }
      })
      // Add Plant to Garden
      .addCase(addPlantToGarden.fulfilled, (state, action) => {
        if (state.currentGarden) {
          state.currentGarden.plants.push(action.payload);
          state.currentGarden.plantsCount = state.currentGarden.plants.length;
        }
      })
      // Water Plant
      .addCase(waterPlant.fulfilled, (state, action) => {
        if (state.currentGarden) {
          const plant = state.currentGarden.plants.find(p => p.id === action.payload.id);
          if (plant) {
            plant.waterLevel = action.payload.waterLevel;
            plant.health = action.payload.health;
            plant.lastWatered = action.payload.lastWatered;
          }
        }
      })
      // Harvest Plant
      .addCase(harvestPlant.fulfilled, (state, action) => {
        if (state.currentGarden) {
          const plant = state.currentGarden.plants.find(p => p.id === action.payload.id);
          if (plant) {
            plant.growthStage = action.payload.growthStage;
            plant.lastHarvested = action.payload.lastHarvested;
          }
        }
      });
  },
});

export const {
  setCurrentGarden,
  clearError,
  updatePlantPosition,
  updatePlantGrowth,
  removePlantFromGarden,
} = gardenSlice.actions;

export default gardenSlice.reducer;
