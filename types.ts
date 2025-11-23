export type Role = 'MASTER' | 'SUB';

export interface User {
  id: string;
  username: string;
  password?: string; // stored for mock purposes
  role: Role;
  revenueRatio: number; // 0.0 to 1.0 (e.g. 0.85 for 85%)
  createdAt: string;
}

export interface Asset {
  id: string;
  ownerId: string; // The user who owns/sees this track
  title: string;
  artist: string;
  coverUrl: string;
  fileName: string;
  status: 'PROCESSING' | 'DISTRIBUTED' | 'REJECTED';
  isrc: string;
  uploadDate: string;
  earnings: number; // Real value
}

export interface Channel {
  id: string;
  name: string;
  thumbnail: string;
  subscribers: string;
  linkedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalViews: number;
  rpm: number;
  activeAssets: number;
}

export enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  LIBRARY = 'LIBRARY',
  CHANNELS = 'CHANNELS',
  USERS = 'USERS' // Admin only
}