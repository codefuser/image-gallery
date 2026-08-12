import { Comment, ImageItem, Like, SavedImage } from '../types';
import { dbService } from './db';
import { storageService } from './storageService';

export const imageService = {
  async getFeedImages(category?: string, sortBy: 'latest' | 'popular' | 'trending' = 'latest'): Promise<ImageItem[]> {
    const all = await dbService.getAll<ImageItem>('images');
    let filtered = all.filter((img) => img.status === 'published' && img.privacy === 'public');

    if (category && category !== 'All' && category.toLowerCase() !== 'all') {
      filtered = filtered.filter(
        (img) => img.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.likesCount + b.savesCount - (a.likesCount + a.savesCount));
    } else if (sortBy === 'trending') {
      filtered.sort((a, b) => b.viewsCount - a.viewsCount);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  },

  async getImageById(id: string): Promise<ImageItem | null> {
    return await dbService.getById<ImageItem>('images', id);
  },

  async createImage(data: {
    title: string;
    description: string;
    url: string;
    thumbnail?: string;
    aspectRatio: number;
    width: number;
    height: number;
    category: string;
    tags: string[];
    privacy: 'public' | 'private';
    status: 'published' | 'draft';
  }): Promise<ImageItem> {
    const currentUserId = storageService.getActiveUserId() || 'user_demo_123';
    const user = await dbService.getById<{ id: string; username: string; displayName: string; avatar: string }>('users', currentUserId);

    const newImage: ImageItem = {
      id: 'img_' + Date.now(),
      userId: currentUserId,
      title: data.title.trim(),
      description: data.description.trim(),
      url: data.url,
      thumbnail: data.thumbnail || data.url,
      aspectRatio: data.aspectRatio || 1,
      width: data.width || 800,
      height: data.height || 800,
      category: data.category || 'Photography',
      tags: data.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      savesCount: 0,
      viewsCount: 1,
      downloadsCount: 0,
      privacy: data.privacy,
      status: data.status,
      creator: {
        id: currentUserId,
        username: user?.username || 'alex_designer',
        displayName: user?.displayName || 'Alex Morgan',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    };

    await dbService.put('images', newImage);
    return newImage;
  },

  async updateImage(id: string, updates: Partial<ImageItem>): Promise<ImageItem | null> {
    const existing = await dbService.getById<ImageItem>('images', id);
    if (!existing) return null;

    const updated: ImageItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await dbService.put('images', updated);
    return updated;
  },

  async softDeleteImage(id: string): Promise<void> {
    const existing = await dbService.getById<ImageItem>('images', id);
    if (existing) {
      existing.status = 'deleted';
      existing.deletedAt = new Date().toISOString();
      await dbService.put('images', existing);
    }
  },

  async restoreImage(id: string): Promise<void> {
    const existing = await dbService.getById<ImageItem>('images', id);
    if (existing) {
      existing.status = 'published';
      existing.deletedAt = undefined;
      await dbService.put('images', existing);
    }
  },

  async permanentDeleteImage(id: string): Promise<void> {
    await dbService.delete('images', id);
  },

  // User Management lists
  async getMyUploadedImages(userId: string): Promise<ImageItem[]> {
    const all = await dbService.getAll<ImageItem>('images');
    return all.filter((img) => img.userId === userId && img.status === 'published');
  },

  async getMyDrafts(userId: string): Promise<ImageItem[]> {
    const all = await dbService.getAll<ImageItem>('images');
    return all.filter((img) => img.userId === userId && img.status === 'draft');
  },

  async getMyTrash(userId: string): Promise<ImageItem[]> {
    const all = await dbService.getAll<ImageItem>('images');
    return all.filter((img) => img.userId === userId && img.status === 'deleted');
  },

  // Likes System
  async isLiked(imageId: string, userId: string): Promise<boolean> {
    const likes = await dbService.getAll<Like>('likes');
    return likes.some((l) => l.imageId === imageId && l.userId === userId);
  },

  async toggleLike(imageId: string, userId: string): Promise<boolean> {
    const likes = await dbService.getAll<Like>('likes');
    const existingIndex = likes.findIndex((l) => l.imageId === imageId && l.userId === userId);
    const img = await dbService.getById<ImageItem>('images', imageId);

    if (existingIndex >= 0) {
      // Unlike
      await dbService.delete('likes', likes[existingIndex].id);
      if (img) {
        img.likesCount = Math.max(0, img.likesCount - 1);
        await dbService.put('images', img);
      }
      return false;
    } else {
      // Like
      const newLike: Like = {
        id: 'like_' + Date.now(),
        userId,
        imageId,
        createdAt: new Date().toISOString(),
      };
      await dbService.put('likes', newLike);
      if (img) {
        img.likesCount += 1;
        await dbService.put('images', img);
      }
      return true;
    }
  },

  async getLikedImages(userId: string): Promise<ImageItem[]> {
    const likes = await dbService.getAll<Like>('likes');
    const userLikes = likes.filter((l) => l.userId === userId);
    const likedImageIds = new Set(userLikes.map((l) => l.imageId));
    const allImages = await dbService.getAll<ImageItem>('images');
    return allImages.filter((img) => likedImageIds.has(img.id) && img.status === 'published');
  },

  // Related Images logic
  async getRelatedImages(targetImage: ImageItem, limit = 8): Promise<ImageItem[]> {
    const all = await dbService.getAll<ImageItem>('images');
    const candidates = all.filter(
      (img) => img.id !== targetImage.id && img.status === 'published' && img.privacy === 'public'
    );

    // Score based on category match & tag overlaps
    const scored = candidates.map((img) => {
      let score = 0;
      if (img.category.toLowerCase() === targetImage.category.toLowerCase()) {
        score += 5;
      }
      const sharedTags = img.tags.filter((tag) =>
        targetImage.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
      );
      score += sharedTags.length * 2;
      return { img, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.img);
  },

  // Stats Counters
  async incrementView(imageId: string): Promise<void> {
    const img = await dbService.getById<ImageItem>('images', imageId);
    if (img) {
      img.viewsCount += 1;
      await dbService.put('images', img);
    }
  },

  async incrementDownload(imageId: string): Promise<void> {
    const img = await dbService.getById<ImageItem>('images', imageId);
    if (img) {
      img.downloadsCount += 1;
      await dbService.put('images', img);
    }
  },

  // Comments
  async getComments(imageId: string): Promise<Comment[]> {
    const comments = await dbService.getAll<Comment>('comments');
    return comments
      .filter((c) => c.imageId === imageId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addComment(imageId: string, userId: string, text: string): Promise<Comment> {
    const user = await dbService.getById<{ displayName: string; avatar: string }>('users', userId);
    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      imageId,
      userId,
      userName: user?.displayName || 'Curator',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    await dbService.put('comments', newComment);
    return newComment;
  },
};
