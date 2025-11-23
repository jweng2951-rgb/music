import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View } from './types';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Library } from './pages/Library';
import { Channels } from './pages/Channels';
import { UserManagement } from './pages/UserManagement';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard />;
      case View.LIBRARY: return <Library />;
      case View.CHANNELS: return <Channels />;
      case View.USERS: return user.role === 'MASTER' ? <UserManagement /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
