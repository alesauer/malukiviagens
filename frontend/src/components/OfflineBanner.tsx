import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { offlineStorage } from '../services/offline';
import { api } from '../services/api';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(offlineStorage.getQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueUpdate = () => setPendingCount(offlineStorage.getQueue().length);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-queue-updated', handleQueueUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-queue-updated', handleQueueUpdate);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    try {
      setIsSyncing(true);
      await api.syncBatch();
      setPendingCount(0);
    } catch (e) {
      console.error('Falha ao sincronizar lote', e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between transition-all ${
      !isOnline ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Modo Offline: consultas e alterações salvas localmente no dispositivo.</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 shrink-0" />
            <span>Conexão restabelecida! {pendingCount} alterações pendentes de sincronização.</span>
          </>
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}</span>
        </button>
      )}
    </div>
  );
};

