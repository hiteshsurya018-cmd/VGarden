import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storeAPI } from '../../services/api';

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  itemType: 'seed' | 'decoration' | 'boost' | 'tool';
  properties?: any;
  isAvailable: boolean;
  isLimited: boolean;
  stock?: number;
  category: {
    id: string;
    name: string;
    iconUrl?: string;
  };
  species?: {
    id: string;
    name: string;
    scientificName?: string;
  };
}

export interface StoreCategory {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  sortOrder: number;
}

export interface Purchase {
  id: string;
  item: StoreItem;
  quantity: number;
  totalPrice: number;
  paymentMethod?: string;
  status: string;
  createdAt: string;
}

interface StoreState {
  categories: StoreCategory[];
  items: StoreItem[];
  purchases: Purchase[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
  cart: { [itemId: string]: number };
}

const initialState: StoreState = {
  categories: [],
  items: [],
  purchases: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  cart: {},
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'store/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeAPI.getCategories();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
    }
  }
);

export const fetchItems = createAsyncThunk(
  'store/fetchItems',
  async (categoryId?: string, { rejectWithValue }) => {
    try {
      const response = await storeAPI.getItems(categoryId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch items');
    }
  }
);

export const purchaseItem = createAsyncThunk(
  'store/purchaseItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await storeAPI.purchaseItem(itemId, quantity);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to purchase item');
    }
  }
);

export const fetchPurchases = createAsyncThunk(
  'store/fetchPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeAPI.getUserPurchases();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch purchases');
    }
  }
);

export const processPayment = createAsyncThunk(
  'store/processPayment',
  async (paymentData: {
    itemId: string;
    quantity: number;
    paymentMethod: 'stripe' | 'razorpay';
    paymentToken: string;
  }, { rejectWithValue }) => {
    try {
      const response = await storeAPI.processPayment(paymentData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Payment failed');
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    addToCart: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      state.cart[itemId] = (state.cart[itemId] || 0) + quantity;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      delete state.cart[action.payload];
    },
    updateCartQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.cart[itemId];
      } else {
        state.cart[itemId] = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Items
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Purchase Item
      .addCase(purchaseItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(purchaseItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases.unshift(action.payload);
        // Remove purchased item from cart
        const itemId = action.payload.item.id;
        delete state.cart[itemId];
      })
      .addCase(purchaseItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Purchases
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.purchases = action.payload;
      })
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases.unshift(action.payload);
        // Clear cart after successful payment
        state.cart = {};
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedCategory,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  clearError,
} = storeSlice.actions;

export default storeSlice.reducer;
