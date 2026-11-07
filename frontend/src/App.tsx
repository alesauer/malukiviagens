import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { offlineStorage } from './services/offline';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Trips } from './pages/Trips';
import { Reservations } from './pages/Reservations';
import { Finances } from './pages/Finances';
import { Documents } from './pages/Documents';
import { Explore } from './pages/Explore';
import { Family } from './pages/Family';
import { AIAssistant } from './pages/AIAssistant';
import { Reports } from './pages/Reports';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(undefined);
  const [initialTripTab, setInitialTripTab] = useState<'roteiro' | 'reservas' | 'financeiro' | 'checklists' | 'bagagem' | 'destinos'>('roteiro');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch (e) {
        // If offline, check if user profile exists in offline cache
        const cachedUser = offlineStorage.getCachedData<User>('user_profile');
        if (cachedUser) {
          setUser(cachedUser);
        } else {
          api.setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const handleNavigate = (tab: string, tripId?: number, tripTab?: 'roteiro' | 'reservas' | 'financeiro' | 'checklists' | 'bagagem' | 'destinos') => {
    setActiveTab(tab);
    if (tripId) {
      setSelectedTripId(tripId);
    }
    if (tripTab) {
      setInitialTripTab(tripTab);
    }
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'trips') {
      setSelectedTripId(undefined);
      setInitialTripTab('roteiro');
    } else if (tab === 'roteiro') {
      setInitialTripTab('roteiro');
    } else if (tab === 'checklists') {
      setInitialTripTab('checklists');
    } else if (tab === 'malas') {
      setInitialTripTab('bagagem');
    } else {
      setSelectedTripId(undefined);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Carregando Travel Manager...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors">
      <Navbar
        user={user}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard user={user} onNavigate={handleNavigate} />
          )}
          {(activeTab === 'trips' || activeTab === 'roteiro' || activeTab === 'checklists' || activeTab === 'malas') && (
            <Trips
              initialTripId={selectedTripId}
              initialTab={
                activeTab === 'roteiro' ? 'roteiro' :
                activeTab === 'checklists' ? 'checklists' :
                activeTab === 'malas' ? 'bagagem' : initialTripTab
              }
              onClearInitialTripId={() => setSelectedTripId(undefined)}
            />
          )}
          {activeTab === 'reservations' && <Reservations />}
          {activeTab === 'finances' && <Finances />}
          {activeTab === 'documents' && <Documents user={user} />}
          {activeTab === 'explore' && <Explore />}
          {activeTab === 'family' && <Family user={user} />}
          {activeTab === 'ai' && <AIAssistant />}
          {activeTab === 'reports' && <Reports />}
        </main>
      </div>
    </div>
  );
};

export default App;
