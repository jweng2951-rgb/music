import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { Asset, User } from '../types';

export const Library: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Upload State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [targetOwnerId, setTargetOwnerId] = useState('');

  const isMaster = user?.role === 'MASTER';

  useEffect(() => {
    if (user) {
        refreshData();
    }
  }, [user]);

  const refreshData = () => {
      if (!user) return;
      setAssets(dataService.getAssets(user));
      if (isMaster) {
          setUsers(dataService.getUsers());
          // Default to self for upload
          setTargetOwnerId(user.id);
      } else {
          setTargetOwnerId(user.id);
      }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist) return;

    dataService.addAsset({
        title,
        artist,
        coverUrl: `https://picsum.photos/seed/${Math.random()}/200/200`,
        fileName: 'upload.wav',
        ownerId: targetOwnerId // Use selected owner or self
    });

    setIsUploading(false);
    setTitle('');
    setArtist('');
    refreshData();
  };

  const handleDistribute = (assetId: string, newOwnerId: string) => {
      dataService.assignAsset(assetId, newOwnerId);
      refreshData();
  };

  const getOwnerName = (ownerId: string) => {
      if (ownerId === user?.id) return 'You';
      const owner = users.find(u => u.id === ownerId);
      return owner ? owner.username : 'Unknown';
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Music Library</h1>
            <p className="text-slate-400">Manage your catalog and metadata.</p>
        </div>
        <button 
            onClick={() => setIsUploading(!isUploading)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition"
        >
            {isUploading ? 'Cancel Upload' : 'Upload New Track'}
        </button>
      </div>

      {isUploading && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 animate-fade-in-down">
              <h3 className="font-bold mb-4">Upload Metadata (CSV/Manual)</h3>
              <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                      <input 
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" 
                        placeholder="Track Title" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      />
                      <input 
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" 
                        placeholder="Artist Name" 
                        value={artist}
                        onChange={e => setArtist(e.target.value)}
                      />
                      
                      {isMaster && (
                          <div className="flex flex-col">
                              <label className="text-xs text-slate-500 uppercase font-bold mb-1">Assign To (Distribution)</label>
                              <select 
                                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white"
                                  value={targetOwnerId}
                                  onChange={e => setTargetOwnerId(e.target.value)}
                              >
                                  <option value={user?.id}>Me (Master)</option>
                                  {users.map(u => (
                                      <option key={u.id} value={u.id}>{u.username}</option>
                                  ))}
                              </select>
                          </div>
                      )}
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500">
                      <p>Drag & Drop Audio Files Here</p>
                      <p className="text-xs mt-2">.WAV, .MP3 supported</p>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold py-3">
                        Confirm & Upload
                    </button>
                  </div>
              </form>
          </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 text-xs uppercase">
                    <th className="p-4">Cover</th>
                    <th className="p-4">Title / Artist</th>
                    {isMaster && <th className="p-4">Owner (Distribution)</th>}
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Earnings</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-4 w-16">
                            <img src={asset.coverUrl} className="w-12 h-12 rounded object-cover" alt="cover" />
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-white">{asset.title}</div>
                            <div className="text-slate-400 text-sm">{asset.artist}</div>
                            <div className="text-slate-600 text-xs font-mono mt-1">{asset.isrc}</div>
                        </td>
                        {isMaster && (
                            <td className="p-4">
                                <select 
                                    className="bg-slate-950 border border-slate-800 rounded text-sm text-slate-300 px-2 py-1 outline-none focus:border-indigo-500"
                                    value={asset.ownerId}
                                    onChange={(e) => handleDistribute(asset.id, e.target.value)}
                                >
                                    <option value={user?.id}>Me (Master)</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username}</option>
                                    ))}
                                </select>
                            </td>
                        )}
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                asset.status === 'DISTRIBUTED' ? 'bg-emerald-500/20 text-emerald-400' : 
                                asset.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                                {asset.status}
                            </span>
                        </td>
                        <td className="p-4 text-right font-mono text-emerald-400">
                            ${asset.earnings.toFixed(2)}
                        </td>
                    </tr>
                ))}
                {assets.length === 0 && (
                    <tr>
                        <td colSpan={isMaster ? 5 : 4} className="p-8 text-center text-slate-500 italic">
                            No tracks in distribution.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};