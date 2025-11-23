import React from 'react';
import { useAuth } from '../context/AuthContext';
import { View } from '../types';
import { HomeIcon, SearchIcon, LibraryIcon, SparklesIcon } from './Icons';

// Reusing Icons file but mapping them to CMS concepts
// Home -> Dashboard
// Library -> Library
// Search -> Channels (Visual metaphor: looking for channels)
// Sparkles -> Admin (Magic master control)

interface LayoutProps {
  currentView: View;
  setView: (v: View) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const { user, logout } = useAuth();

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view
          ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded flex items-center justify-center font-bold">N</div>
            <span className="text-xl font-bold tracking-tight">Nexus CMS</span>
          </div>
          
          <div className="mb-6 px-4 py-3 bg-slate-900 rounded-lg border border-slate-800">
             <div className="text-xs text-slate-500 uppercase font-bold mb-1">Current User</div>
             <div className="font-medium truncate">{user?.username}</div>
             <div className="text-xs text-indigo-400 mt-1">{user?.role === 'MASTER' ? 'Administrator' : 'Partner'}</div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem view={View.DASHBOARD} icon={HomeIcon} label="Dashboard" />
          <NavItem view={View.LIBRARY} icon={LibraryIcon} label="Asset Library" />
          <NavItem view={View.CHANNELS} icon={SearchIcon} label="Linked Channels" />
          
          {user?.role === 'MASTER' && (
            <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-600 uppercase">Administration</div>
                <NavItem view={View.USERS} icon={SparklesIcon} label="Sub-Accounts" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-red-900/20 text-slate-400 hover:text-red-400 text-sm transition font-medium"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
         <div className="max-w-7xl mx-auto p-8">
             {children}
         </div>
      </main>
    </div>
  );
};