import { User, Asset, Channel, DashboardStats } from '../types';
import { SEED_ADMIN, MOCK_ASSETS, MOCK_CHANNELS } from '../constants';

// Simulating a backend database in localStorage
const KEYS = {
  USERS: 'nexus_cms_users',
  ASSETS: 'nexus_cms_assets',
  CHANNELS: 'nexus_cms_channels',
  SESSION: 'nexus_cms_session'
};

const initializeDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([SEED_ADMIN]));
  }
  if (!localStorage.getItem(KEYS.ASSETS)) {
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(MOCK_ASSETS));
  }
  if (!localStorage.getItem(KEYS.CHANNELS)) {
    localStorage.setItem(KEYS.CHANNELS, JSON.stringify(MOCK_CHANNELS));
  }
};

initializeDB();

export const dataService = {
  // Auth
  login: (username: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  },

  // User Management (Master Only)
  getUsers: (): User[] => {
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return users.filter(u => u.role !== 'MASTER'); // Only return sub-accounts
  },

  createUser: (user: Omit<User, 'id' | 'role' | 'createdAt'>): User => {
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
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
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  },

  deleteUser: (id: string) => {
    let users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    users = users.filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Asset Management
  getAssets: (currentUser: User): Asset[] => {
    let assets: Asset[] = JSON.parse(localStorage.getItem(KEYS.ASSETS) || '[]');
    
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
    const assets: Asset[] = JSON.parse(localStorage.getItem(KEYS.ASSETS) || '[]');
    const newAsset: Asset = {
        ...asset,
        id: Math.random().toString(36).substr(2, 9),
        status: 'PROCESSING',
        isrc: 'PENDING...',
        uploadDate: new Date().toISOString().split('T')[0],
        earnings: 0
    };
    assets.unshift(newAsset);
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
  },

  assignAsset: (assetId: string, newOwnerId: string) => {
    const assets: Asset[] = JSON.parse(localStorage.getItem(KEYS.ASSETS) || '[]');
    const idx = assets.findIndex(a => a.id === assetId);
    if (idx !== -1) {
        assets[idx].ownerId = newOwnerId;
        localStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
    }
  },

  // Channel Management
  getChannels: (): Channel[] => {
    return JSON.parse(localStorage.getItem(KEYS.CHANNELS) || '[]');
  },

  bindChannel: () => {
    const channels: Channel[] = JSON.parse(localStorage.getItem(KEYS.CHANNELS) || '[]');
    const newChannel: Channel = {
        id: Math.random().toString(36).substr(2, 9),
        name: `New Channel ${channels.length + 1}`,
        thumbnail: `https://picsum.photos/id/${70 + channels.length}/100/100`,
        subscribers: '100',
        linkedAt: new Date().toISOString().split('T')[0]
    };
    channels.push(newChannel);
    localStorage.setItem(KEYS.CHANNELS, JSON.stringify(channels));
  },

  // Stats
  getStats: (currentUser: User): DashboardStats => {
    let assets = JSON.parse(localStorage.getItem(KEYS.ASSETS) || '[]') as Asset[];
    
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