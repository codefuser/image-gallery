import { AppSettings } from '../types';
import { dbService } from './db';

const RECENT_SEARCHES_KEY = 'pinscape_recent_searches';
const APP_SETTINGS_KEY = 'pinscape_settings';
const AUTH_TOKEN_KEY = 'pinscape_auth_token';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notificationsEnabled: true,
  downloadPermission: true,
  profileVisibility: 'public',
  language: 'English (US)',
};

export const storageService = {
  // Recent Searches
  getRecentSearches(): string[] {
    try {
      const data = localStorage.getItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : ['minimalist', 'tokyo neon', 'nature', 'cyberpunk', 'glassmorphism'];
    } catch {
      return [];
    }
  },

  addRecentSearch(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getRecentSearches();
    const current = this.getRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  },

  clearRecentSearches(): void {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  },

  // App Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(APP_SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Auth Session Token
  getActiveUserId(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY) || 'user_demo_123'; // Default to demo user
  },

  setActiveUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(AUTH_TOKEN_KEY, userId);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  // Export / Import Backup JSON Data
  async exportDataJSON(): Promise<string> {
    const users = await dbService.getAll('users');
    const images = await dbService.getAll('images');
    const boards = await dbService.getAll('boards');
    const likes = await dbService.getAll('likes');
    const savedImages = await dbService.getAll('saved_images');
    const comments = await dbService.getAll('comments');
    const notifications = await dbService.getAll('notifications');
    const settings = this.getSettings();

    const exportBundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        users,
        images,
        boards,
        likes,
        savedImages,
        comments,
        notifications,
        settings,
      },
    };

    return JSON.stringify(exportBundle, null, 2);
  },

  async importDataJSON(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;

      const { users, images, boards, likes, savedImages, comments, notifications, settings } = parsed.data;

      if (settings) {
        this.saveSettings(settings);
      }

      await dbService.clearAllData();

      if (Array.isArray(users)) {
        for (const user of users) await dbService.put('users', user);
      }
      if (Array.isArray(images)) {
        for (const img of images) await dbService.put('images', img);
      }
      if (Array.isArray(boards)) {
        for (const board of boards) await dbService.put('boards', board);
      }
      if (Array.isArray(likes)) {
        for (const like of likes) await dbService.put('likes', like);
      }
      if (Array.isArray(savedImages)) {
        for (const s of savedImages) await dbService.put('saved_images', s);
      }
      if (Array.isArray(comments)) {
        for (const c of comments) await dbService.put('comments', c);
      }
      if (Array.isArray(notifications)) {
        for (const n of notifications) await dbService.put('notifications', n);
      }

      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },
};
