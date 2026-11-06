export interface QueuedOperation {
  operation_id: string;
  entity_type: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  client_timestamp: string;
}

const OFFLINE_QUEUE_KEY = 'travel_manager_offline_queue';

export const offlineStorage = {
  getQueue(): QueuedOperation[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  enqueue(op: Omit<QueuedOperation, 'operation_id' | 'client_timestamp'>) {
    const queue = this.getQueue();
    const newOp: QueuedOperation = {
      ...op,
      operation_id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      client_timestamp: new Date().toISOString()
    };
    queue.push(newOp);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('offline-queue-updated'));
    return newOp;
  },

  clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    window.dispatchEvent(new Event('offline-queue-updated'));
  },

  cacheData(key: string, data: any) {
    try {
      localStorage.setItem(`tm_cache_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Falha ao salvar cache offline', e);
    }
  },

  getCachedData<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`tm_cache_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};

