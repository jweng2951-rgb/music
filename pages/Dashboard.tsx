import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (user) {
      setStats(dataService.getStats(user));
    }
  }, [user]);

  if (!stats) return <div>Loading...</div>;

  const StatCard = ({ label, value, sub, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
      <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">{label}</h3>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-slate-600 text-xs mt-2">{sub}</div>
    </div>
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your performance and earnings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            label="Estimated Revenue" 
            value={`$${stats.totalRevenue.toFixed(2)}`} 
            sub="+12.5% from last month"
            color="text-emerald-400"
        />
        <StatCard 
            label="Total Views" 
            value={stats.totalViews.toLocaleString()} 
            sub="Across all linked channels"
            color="text-indigo-400"
        />
        <StatCard 
            label="RPM (Avg)" 
            value={`$${stats.rpm.toFixed(2)}`} 
            sub="Revenue per 1k views"
            color="text-cyan-400"
        />
        <StatCard 
            label="Active Assets" 
            value={stats.activeAssets} 
            sub="Distributed tracks"
            color="text-white"
        />
      </div>

      {/* Mock Chart Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold mb-6">Revenue History (Last 30 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[...Array(30)].map((_, i) => {
                const height = Math.random() * 80 + 20; // Mock height
                return (
                    <div key={i} className="w-full bg-indigo-500/20 hover:bg-indigo-500 rounded-t transition relative group">
                        <div 
                            style={{ height: `${height}%` }} 
                            className="absolute bottom-0 w-full bg-indigo-500 rounded-t"
                        ></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-xs p-1 rounded border border-slate-700 pointer-events-none">
                            ${(Math.random() * 100 * (user?.revenueRatio || 1)).toFixed(2)}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">System Notices</h3>
          <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-950 rounded border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                  <div>
                      <h4 className="font-bold text-sm">Monthly Payout Processed</h4>
                      <p className="text-slate-400 text-sm mt-1">Your earnings for January have been finalized. Check your reports.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
