import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = '@skones_sync_queue';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private syncQueue: SyncQueue[] = [];
  private syncing = false;

  private constructor() {}

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  async addToQueue(action: string, entity: string, data: any): Promise<void> {
    const item: SyncQueue = {
      id: `${entity}-${Date.now()}`,
      action: action as 'create' | 'update' | 'delete',
      entity,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.syncQueue.push(item);
    await this.saveQueue();
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  async sync(): Promise<void> {
    if (this.syncing || this.syncQueue.length === 0) {
      return;
    }

    this.syncing = true;

    try {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue[0];

        try {
          await this.syncItem(item);
          this.syncQueue.shift();
        } catch (error) {
          item.retries++;
          if (item.retries >= MAX_RETRIES) {
            console.warn(`Failed to sync item after ${MAX_RETRIES} retries:`, item);
            this.syncQueue.shift();
          }
          break;
        }
      }

      await this.saveQueue();
    } finally {
      this.syncing = false;
    }
  }

  private async syncItem(item: SyncQueue): Promise<void> {
    console.log(`Syncing ${item.action} for ${item.entity}:`, item.data);
    // Implement sync logic based on entity type
  }

  getQueueSize(): number {
    return this.syncQueue.length;
  }
}

export const useOfflineSync = () => {
  const syncManager = OfflineSyncManager.getInstance();

  useEffect(() => {
    syncManager.initialize();

    const interval = setInterval(() => {
      syncManager.sync();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    addToQueue: syncManager.addToQueue.bind(syncManager),
    sync: syncManager.sync.bind(syncManager),
    queueSize: syncManager.getQueueSize(),
  };
};
