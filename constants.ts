import { User, Asset, Channel } from './types';

export const SEED_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123', // In a real app, never store plain text
  role: 'MASTER',
  revenueRatio: 1.0,
  createdAt: new Date().toISOString()
};

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'a1',
    ownerId: 'admin-001',
    title: 'Neon Horizon',
    artist: 'Cyberwalker',
    coverUrl: 'https://picsum.photos/id/10/200/200',
    fileName: 'neon_horizon.wav',
    status: 'DISTRIBUTED',
    isrc: 'US-NEX-24-00001',
    uploadDate: '2024-02-15',
    earnings: 1250.50
  },
  {
    id: 'a2',
    ownerId: 'admin-001',
    title: 'Digital Rain',
    artist: 'Null Pointer',
    coverUrl: 'https://picsum.photos/id/16/200/200',
    fileName: 'digital_rain.mp3',
    status: 'DISTRIBUTED',
    isrc: 'US-NEX-24-00002',
    uploadDate: '2024-02-18',
    earnings: 840.20
  },
  {
    id: 'a3',
    ownerId: 'admin-001',
    title: 'System Failure',
    artist: 'Glitch Mob',
    coverUrl: 'https://picsum.photos/id/54/200/200',
    fileName: 'sys_fail.wav',
    status: 'PROCESSING',
    isrc: 'Pending',
    uploadDate: '2024-02-20',
    earnings: 0
  }
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'c1',
    name: 'LoFi Beats Daily',
    thumbnail: 'https://picsum.photos/id/65/100/100',
    subscribers: '1.2M',
    linkedAt: '2023-11-01'
  }
];