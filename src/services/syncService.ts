import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { operationsApi } from '../api/operations';

const QUEUE_KEY = '@dms_offline_queue';
const WORKSPACE_CACHE_KEY = '@dms_workspace_cache';

export type QueueActionType =
  | 'RECEIVE_STOCK'
  | 'RECORD_SALE'
  | 'STOCK_TRANSFER'
  | 'RECORD_EXPENSE';

export interface QueuedAction {
  id: string;
  type: QueueActionType;
  payload: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export const syncService = {
  async isOnline(): Promise<boolean> {
    try {
      const net = await Network.getNetworkStateAsync();
      return !!(net.isConnected && net.isInternetReachable !== false);
    } catch {
      return false;
    }
  },

  async getQueue(): Promise<QueuedAction[]> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async enqueue(type: QueueActionType, payload: any): Promise<QueuedAction> {
    const queue = await this.getQueue();
    const action: QueuedAction = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    queue.push(action);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return action;
  },

  async remove(actionId: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((item) => item.id !== actionId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  },

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  // Save full workspace data to persistent offline storage
  async saveWorkspaceCache(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(data));
    } catch {
      // ignore cache save error
    }
  },

  async getWorkspaceCache(): Promise<any | null> {
    try {
      const stored = await AsyncStorage.getItem(WORKSPACE_CACHE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Synchronizes all queued actions with the server.
   * Returns count of successfully synced items.
   */
  async processQueue(
    onProgress?: (current: number, total: number) => void,
  ): Promise<{ syncedCount: number; failedCount: number }> {
    const queue = await this.getQueue();
    if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

    const online = await this.isOnline();
    if (!online) {
      throw new Error('Mtandao bado haujapatikana. Hakikisha simu imeunganishwa na Wi-Fi au data.');
    }

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: QueuedAction[] = [];

    for (let i = 0; i < queue.length; i++) {
      const action = queue[i];
      if (onProgress) onProgress(i + 1, queue.length);

      try {
        switch (action.type) {
          case 'RECEIVE_STOCK':
            await operationsApi.receiveStock(action.payload.units, action.payload.supplier);
            break;

          case 'RECORD_SALE':
            await operationsApi.recordSale(action.payload);
            break;

          case 'STOCK_TRANSFER':
            await operationsApi.createTransfer(action.payload);
            break;

          case 'RECORD_EXPENSE':
            await operationsApi.recordExpense(action.payload);
            break;
        }

        syncedCount++;
      } catch (err: any) {
        // If it's a conflict or server error, retain for next sync or report
        action.retryCount += 1;
        action.lastError = err.message || 'Hitilafu ya seva';
        remainingQueue.push(action);
        failedCount++;
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    return { syncedCount, failedCount };
  },
};
