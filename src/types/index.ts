export type PrivacySetting = 'public' | 'private';
export type ImageStatus = 'published' | 'draft' | 'deleted';
export type NotificationType = 'like' | 'save' | 'follow' | 'comment';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  totalImages: number;
  createdAt: string;
}

export interface CreatorSummary {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface ImageItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  aspectRatio: number; // width / height, e.g. 0.75, 1.2, 1.5, 0.8
  width: number;
  height: number;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  downloadsCount: number;
  privacy: PrivacySetting;
  status: ImageStatus;
  deletedAt?: string;
  creator: CreatorSummary;
}

export interface Board {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  isPrivate: boolean;
  imageIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  imageId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  actorName: string;
  actorAvatar: string;
  imageId?: string;
  imageThumbnail?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverUrl: string;
}

export interface Like {
  id: string;
  userId: string;
  imageId: string;
  createdAt: string;
}

export interface SavedImage {
  id: string;
  userId: string;
  imageId: string;
  boardId?: string;
  createdAt: string;
}

export interface SearchFilter {
  query: string;
  category: string;
  tag: string;
  sortBy: 'latest' | 'popular' | 'trending';
}

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  downloadPermission: boolean;
  profileVisibility: 'public' | 'private';
  language: string;
}

export type ActiveTab = 'home' | 'explore' | 'search' | 'upload' | 'notifications' | 'profile' | 'my-images' | 'settings' | 'board-detail';
