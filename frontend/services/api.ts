import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.203.148.139:8000/api'; // Laravel Backend
const PYTHON_API_URL = 'http://10.203.148.139:8001'; // Python Vision AI

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const pythonapi = axios.create({
  baseURL: PYTHON_API_URL,
});

// Add a request interceptor to attach the token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - only clear if it's an actual auth error
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export const setToken = async (token: string | null) => {
  if (token) {
    await SecureStore.setItemAsync('auth_token', token);
  } else {
    await SecureStore.deleteItemAsync('auth_token');
  }
};

export const initializeToken = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return token;
};

export const authApi = {
  login: async (data: any) => {
    const response = await api.post('/login', data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/user');
    return response.data;
  },
  logout: async () => {
    await setToken(null);
  },
  updateProfile: async (data: any) => {
    const response = await api.post('/update-profile', data);
    return response.data;
  },
  getHistory: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch {
      return { status: 'success', data: [] };
    }
  }
};

export const palmApi = {
  analyze: async (data: any) => {
    // Hits the Python Vision AI on port 8001
    const formData = new FormData();
    // photo is base64 in data.capturedImage
    if (data.capturedImage) {
        formData.append('file', {
            uri: data.capturedImage,
            name: 'palm.jpg',
            type: 'image/jpeg'
        } as any);
    }
    if (data.user_id) formData.append('user_id', data.user_id.toString());
    
    const response = await pythonapi.post('/process-palm', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/palm-readings');
    return response.data;
  }
};

export const notificationApi = {
    getAll: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.post('/notifications/read-all');
        return response.data;
    },
    markAsRead: async (id: number) => {
        const response = await api.post(`/notifications/${id}/read`);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    }
};

export const walletApi = {
    getBalance: async () => {
        const response = await api.get('/wallet/balance');
        return response.data;
    },
    topup: async (amount: number) => {
        const response = await api.post('/wallet/topup', { amount });
        return response.data;
    },
    addReward: async () => {
        const response = await api.post('/wallet/reward');
        return response.data;
    },
    redeem: async () => {
        const response = await api.post('/wallet/redeem');
        return response.data;
    },
    createOrder: async (amount: number) => {
        const response = await api.post('/wallet/razorpay/order', { amount });
        return response.data;
    },
    verifyPayment: async (paymentData: any) => {
        const response = await api.post('/wallet/razorpay/verify', paymentData);
        return response.data;
    },
    debit: async (amount: number) => {
        const response = await api.post('/wallet/debit', { amount });
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/wallet/history');
        return response.data;
    }
};

export const horoscopeApi = {
    getAdvanced: async () => {
        const response = await api.post('/calculate-chart', {}); // Placeholder for advanced
        return response.data;
    },
    calculate: async (data: any) => {
        const response = await api.post('/calculate-chart', data);
        return response.data;
    },
    getTransit: async () => {
        const response = await api.get('/transit');
        return response.data;
    },
    getLucky: async () => {
        const response = await api.get('/lucky');
        return response.data;
    },
    getMyDailyImpacts: async () => {
        const response = await api.get('/me/daily-impacts');
        return response.data;
    },
    getDashaBhukti: async (data: any) => {
        const response = await api.post('/dasha-bhukti', data);
        return response.data;
    },
    getDetailedDaily: async (params: any) => {
        const response = await api.get('/detailed-daily', { params });
        return response.data;
    }
};

export const predictionApi = {
    getCategories: async () => {
        const response = await api.get('/predictions/categories');
        return response.data;
    },
    getQuestions: async (catCode: string) => {
        const response = await api.get(`/predictions/questions/${catCode}`);
        return response.data;
    },
    getAnswer: async (code: string) => {
        const response = await api.get(`/predictions/answer/${code}`);
        return response.data;
    },
    getMarriageStatus: async () => {
        const response = await api.get('/porutham-dashboard');
        return response.data;
    }
};

export const aiApi = {
    chat: async (message: string) => {
        const response = await api.post('/chat', { message });
        return response.data;
    },
    getHistory: async () => {
        // Fallback to empty history array if the endpoint doesn't exist
        try {
            const response = await api.get('/chat-history');
            return response.data;
        } catch {
            return { history: [] };
        }
    }
};

export const poruthamApi = {
    match: async (groom: any, bride: any) => {
        const response = await api.post('/porutham-match', { groom, bride });
        return response.data;
    },
    getDashboard: async () => {
        const response = await api.get('/porutham-dashboard');
        return response.data;
    },
    getHistory: async () => {
        try {
            const response = await api.get('/porutham-history');
            return response.data;
        } catch {
            return { history: [] };
        }
    }
};

export const apiRequest = async (url: string, options: any = {}) => {
    const { method = 'GET', body = null } = options;
    const response = await api({
        url,
        method,
        data: body ? JSON.parse(body) : null
    });
    return response.data;
};

export default api;
