import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  googleLogin: async (googleData: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => {
    const response = await api.post('/auth/google', googleData);
    return response.data;
  },
  
  appleLogin: async (appleData: {
    appleId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await api.post('/auth/apple', appleData);
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Garden API
export const gardenAPI = {
  getUserGardens: async () => {
    const response = await api.get('/garden');
    return response.data;
  },
  
  createGarden: async (gardenData: { name: string; description?: string }) => {
    const response = await api.post('/garden', gardenData);
    return response.data;
  },
  
  updateGarden: async (gardenId: string, gardenData: any) => {
    const response = await api.put(`/garden/${gardenId}`, gardenData);
    return response.data;
  },
  
  deleteGarden: async (gardenId: string) => {
    const response = await api.delete(`/garden/${gardenId}`);
    return response.data;
  },
  
  analyzeGardenImage: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/ai/analyze-garden', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAnalysisStatus: async (analysisId: string) => {
    const response = await api.get(`/ai/analysis/${analysisId}`);
    return response.data;
  },
  
  addPlantToGarden: async (plantData: {
    gardenId: string;
    speciesId: string;
    x: number;
    y: number;
    z?: number;
  }) => {
    const response = await api.post('/garden/plants', plantData);
    return response.data;
  },
  
  waterPlant: async (plantId: string) => {
    const response = await api.post(`/garden/plants/${plantId}/water`);
    return response.data;
  },
  
  harvestPlant: async (plantId: string) => {
    const response = await api.post(`/garden/plants/${plantId}/harvest`);
    return response.data;
  },
  
  removePlant: async (plantId: string) => {
    const response = await api.delete(`/garden/plants/${plantId}`);
    return response.data;
  },
};

// Plants API
export const plantsAPI = {
  getAllSpecies: async () => {
    const response = await api.get('/plants/species');
    return response.data;
  },
  
  getSpeciesById: async (speciesId: string) => {
    const response = await api.get(`/plants/species/${speciesId}`);
    return response.data;
  },
  
  identifyPlant: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/ai/identify-plant', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  searchSpecies: async (query: string) => {
    const response = await api.get(`/plants/species/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

// Store API
export const storeAPI = {
  getCategories: async () => {
    const response = await api.get('/store/categories');
    return response.data;
  },
  
  getItems: async (categoryId?: string) => {
    const url = categoryId ? `/store/items?category=${categoryId}` : '/store/items';
    const response = await api.get(url);
    return response.data;
  },
  
  purchaseItem: async (itemId: string, quantity: number = 1) => {
    const response = await api.post('/store/purchase', { itemId, quantity });
    return response.data;
  },
  
  getUserPurchases: async () => {
    const response = await api.get('/store/purchases');
    return response.data;
  },
  
  processPayment: async (paymentData: {
    itemId: string;
    quantity: number;
    paymentMethod: 'stripe' | 'razorpay';
    paymentToken: string;
  }) => {
    const response = await api.post('/store/payment', paymentData);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },
  
  getAchievements: async () => {
    const response = await api.get('/user/achievements');
    return response.data;
  },
  
  getFriends: async () => {
    const response = await api.get('/user/friends');
    return response.data;
  },
  
  addFriend: async (friendId: string) => {
    const response = await api.post('/user/friends', { friendId });
    return response.data;
  },
  
  getLeaderboard: async () => {
    const response = await api.get('/user/leaderboard');
    return response.data;
  },
};

// AI API
export const aiAPI = {
  detectObjects: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/ai/detect-objects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  segmentLayout: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/ai/segment-layout', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
