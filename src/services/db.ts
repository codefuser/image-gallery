import { Board, Comment, ImageItem, Like, Notification, SavedImage, User } from '../types';
import { CATEGORIES, INITIAL_BOARDS, INITIAL_IMAGES, INITIAL_NOTIFICATIONS, INITIAL_USER } from './sampleData';

const DB_NAME = 'pinscape_db';
const DB_VERSION = 1;

export class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'id' });
          imageStore.createIndex('userId', 'userId', { unique: false });
          imageStore.createIndex('category', 'category', { unique: false });
          imageStore.createIndex('status', 'status', { unique: false });
          imageStore.createIndex('privacy', 'privacy', { unique: false });
        }
        if (!db.objectStoreNames.contains('boards')) {
          const boardStore = db.createObjectStore('boards', { keyPath: 'id' });
          boardStore.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('likes')) {
          const likeStore = db.createObjectStore('likes', { keyPath: 'id' });
          likeStore.createIndex('userId', 'userId', { unique: false });
          likeStore.createIndex('imageId', 'imageId', { unique: false });
        }
        if (!db.objectStoreNames.contains('saved_images')) {
          const saveStore = db.createObjectStore('saved_images', { keyPath: 'id' });
          saveStore.createIndex('userId', 'userId', { unique: false });
          saveStore.createIndex('imageId', 'imageId', { unique: false });
          saveStore.createIndex('boardId', 'boardId', { unique: false });
        }
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentStore.createIndex('imageId', 'imageId', { unique: false });
        }
        if (!db.objectStoreNames.contains('notifications')) {
          const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notifStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        await this.seedInitialDataIfEmpty(db);
        await this.ensureNewImagesSeeded(db);
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async seedInitialDataIfEmpty(db: IDBDatabase): Promise<void> {
    const tx = db.transaction(['users', 'images', 'boards', 'notifications'], 'readwrite');
    const userStore = tx.objectStore('users');
    const imageStore = tx.objectStore('images');
    const boardStore = tx.objectStore('boards');
    const notifStore = tx.objectStore('notifications');

    const userCount = await this.countStore(userStore);
    if (userCount === 0) {
      userStore.put(INITIAL_USER);
      for (const img of INITIAL_IMAGES) {
        imageStore.put(img);
      }
      for (const board of INITIAL_BOARDS) {
        boardStore.put(board);
      }
      for (const notif of INITIAL_NOTIFICATIONS) {
        notifStore.put(notif);
      }
    }
  }

  private async ensureNewImagesSeeded(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('images', 'readwrite');
        const store = tx.objectStore('images');
        for (const img of INITIAL_IMAGES) {
          const getReq = store.get(img.id);
          getReq.onsuccess = () => {
            if (!getReq.result) {
              store.put(img);
            }
          };
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  private countStore(store: IDBObjectStore): Promise<number> {
    return new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }

  // Generic helpers
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, item: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    const storeNames = Array.from(db.objectStoreNames);
    const tx = db.transaction(storeNames, 'readwrite');
    for (const name of storeNames) {
      tx.objectStore(name).clear();
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async resetToSeedData(): Promise<void> {
    await this.clearAllData();
    const db = await this.getDB();
    await this.seedInitialDataIfEmpty(db);
  }
}

export const dbService = new LocalDatabase();
