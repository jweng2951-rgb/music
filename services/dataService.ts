import { User, Asset, Channel, DashboardStats } from '../types';
import { SEED_ADMIN, MOCK_ASSETS, MOCK_CHANNELS } from '../constants';

// Simulating a backend database in localStorage
const KEYS = {
  USERS: 'nexus_cms_users',
  ASSETS: 'nexus_cms_assets',
  CHANNELS: 'nexus_cms_channels',
  SESSION: 'nexus_cms_session'
};

// Helper for safe storage access (Memory fallback if localStorage is blocked)
const memoryStorage: Record<string, string> = {};

const storage = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("LocalStorage blocked, using memory fallback");
            return memoryStorage[key] || null;
        }
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            memoryStorage[key] = value;
        }
    }
};

const initializeDB = () => {
  if (typeof window === 'undefined') return;
  
  try {
      if (!storage.getItem(KEYS.USERS)) {
        storage.setItem(KEYS.USERS, JSON.stringify([SEED_ADMIN]));
      }
      if (!storage.getItem(KEYS.ASSETS)) {
        storage.setItem(KEYS.ASSETS, JSON.stringify(MOCK_ASSETS));
      }
      if (!storage.getItem(KEYS.CHANNELS)) {
        storage.setItem(KEYS.CHANNELS, JSON.stringify(MOCK_CHANNELS));
      }
  } catch (e) {
      console.error("DB Init failed", e);
  }
};

initializeDB();

export const dataService = {
  // Auth
  login: (username: string, password: string): User | null => {
    const json = storage.getItem(KEYS.USERS);
    if (!json) return null;
    const users: User[] = JSON.parse(json);
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  },

  // User Management (Master Only)
  getUsers: (): User[] => {
    const json = storage.getItem(KEYS.USERS);
    if (!json) return [];
    const users: User[] = JSON.parse(json);
    return users.filter(u => u.role !== 'MASTER'); // Only return sub-accounts
  },

  createUser: (user: Omit<User, 'id' | 'role' | 'createdAt'>): User => {
    const json = storage.getItem(KEYS.USERS);
    const users: User[] = json ? JSON.parse(json) : [];
    
    if (users.find(u => u.username === user.username)) {
      throw new Error("Username exists");
    }
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      role: 'SUB',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    storage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const json = storage.getItem(KEYS.USERS);
    if (!json) return;
    const users: User[] = JSON.parse(json);
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      storage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  },

  deleteUser: (id: string) => {
    let json = storage.getItem(KEYS.USERS);
    if (!json) return;
    let users: User[] = JSON.parse(json);
    users = users.filter(u => u.id !== id);
    storage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Asset Management
  getAssets: (currentUser: User): Asset[] => {
    const json = storage.getItem(KEYS.ASSETS);
    let assets: Asset[] = json ? JSON.parse(json) : [];
    
    // Sub accounts only see their own assets
    if (currentUser.role === 'SUB') {
        assets = assets.filter(a => a.ownerId === currentUser.id);
    }
    // Master accounts see ALL assets

    // Apply ratio to earnings
    return assets.map(a => ({
      ...a,
      earnings: a.earnings * currentUser.revenueRatio
    }));
  },

  addAsset: (asset: Omit<Asset, 'id' | 'status' | 'isrc' | 'uploadDate' | 'earnings'>) => {
    const json = storage.getItem(KEYS.ASSETS);
    const assets: Asset[] = json ? JSON.parse(json) : [];
    const newAsset: Asset = {
        ...asset,
        id: Math.random().toString(36).substr(2, 9),
        status: 'PROCESSING',
        isrc: 'PENDING...',
        uploadDate: new Date().toISOString().split('T')[0],
        earnings: 0
    };
    assets.unshift(newAsset);
    storage.setItem(KEYS.ASSETS, JSON.stringify(assets));
  },

  assignAsset: (assetId: string, newOwnerId: string) => {
    const json = storage.getItem(KEYS.ASSETS);
    if (!json) return;
    const assets: Asset[] = JSON.parse(json);
    const idx = assets.findIndex(a => a.id === assetId);
    if (idx !== -1) {
        assets[idx].ownerId = newOwnerId;
        storage.setItem(KEYS.ASSETS, JSON.stringify(assets));
    }
  },

  // Channel Management
  getChannels: (): Channel[] => {
    const json = storage.getItem(KEYS.CHANNELS);
    return json ? JSON.parse(json) : [];
  },

  bindChannel: () => {
    const json = storage.getItem(KEYS.CHANNELS);
    const channels: Channel[] = json ? JSON.parse(json) : [];
    const newChannel: Channel = {
        id: Math.random().toString(36).substr(2, 9),
        name: `New Channel ${channels.length + 1}`,
        thumbnail: `https://picsum.photos/id/${70 + channels.length}/100/100`,
        subscribers: '100',
        linkedAt: new Date().toISOString().split('T')[0]
    };
    channels.push(newChannel);
    storage.setItem(KEYS.CHANNELS, JSON.stringify(channels));
  },

  // Stats
  getStats: (currentUser: User): DashboardStats => {
    const assetsJson = storage.getItem(KEYS.ASSETS);
    let assets = (assetsJson ? JSON.parse(assetsJson) : []) as Asset[];
    
    // Filter assets for stats calculation based on role
    if (currentUser.role === 'SUB') {
        assets = assets.filter(a => a.ownerId === currentUser.id);
    }

    const totalRealRevenue = assets.reduce((sum, a) => sum + a.earnings, 0);
    
    // Fake views calculation based on revenue
    const totalViews = Math.floor(totalRealRevenue * 1500); 

    const ratio = currentUser.revenueRatio;

    return {
        totalRevenue: totalRealRevenue * ratio,
        totalViews: totalViews,
        rpm: totalViews > 0 ? (totalRealRevenue / (totalViews / 1000)) * ratio : 0,
        activeAssets: assets.length
    };
  }
};