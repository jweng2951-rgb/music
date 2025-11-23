import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Channel } from '../types';

export const Channels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChannels(dataService.getChannels());
  }, []);

  const handleOAuth = () => {
    setLoading(true);
    // Simulate OAuth delay
    setTimeout(() => {
        dataService.bindChannel();
        setChannels(dataService.getChannels());
        setLoading(false);
    }, 1500);
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Linked Channels</h1>
            <p className="text-slate-400">Bind YouTube channels to track usage and claims.</p>
        </div>
        <button 
            onClick={handleOAuth}
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
            {loading ? 'Connecting...' : (
                <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    <span>Link YouTube Channel</span>
                </>
            )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map(channel => (
              <div key={channel.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-indigo-500/50 transition">
                  <img src={channel.thumbnail} alt={channel.name} className="w-20 h-20 rounded-full mb-4 border-2 border-slate-700" />
                  <h3 className="font-bold text-lg">{channel.name}</h3>
                  <div className="text-slate-400 text-sm mb-4">{channel.subscribers} Subscribers</div>
                  <div className="w-full border-t border-slate-800 pt-4 flex justify-between text-xs text-slate-500">
                      <span>Linked: {channel.linkedAt}</span>
                      <span className="text-emerald-400">● Active</span>
                  </div>
              </div>
          ))}
          {channels.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                  No channels linked yet. Connect a Google Account to start.
              </div>
          )}
      </div>
    </div>
  );
};