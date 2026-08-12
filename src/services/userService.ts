import { User } from '../types';
import { dbService } from './db';

export const userService = {
  async getUserById(userId: string): Promise<User | null> {
    return await dbService.getById<User>('users', userId);
  },

  async updateUserProfile(userId: string, updates: {
    displayName?: string;
    username?: string;
    bio?: string;
    website?: string;
    avatar?: string;
  }): Promise<User | null> {
    const existing = await dbService.getById<User>('users', userId);
    if (!existing) return null;

    const updated: User = {
      ...existing,
      ...updates,
    };

    await dbService.put('users', updated);

    // Update creator details embedded in published images
    const allImages = await dbService.getAll<any>('images');
    for (const img of allImages) {
      if (img.userId === userId && img.creator) {
        img.creator.username = updated.username;
        img.creator.displayName = updated.displayName;
        if (updated.avatar) img.creator.avatar = updated.avatar;
        await dbService.put('images', img);
      }
    }

    return updated;
  },

  async toggleFollowUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const currentUser = await dbService.getById<User>('users', currentUserId);
    const targetUser = await dbService.getById<User>('users', targetUserId);

    if (currentUser && targetUser) {
      // Toggle count simulation
      targetUser.followersCount += 1;
      currentUser.followingCount += 1;
      await dbService.put('users', targetUser);
      await dbService.put('users', currentUser);
      return true;
    }
    return false;
  },
};
