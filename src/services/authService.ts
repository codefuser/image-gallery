import { User } from '../types';
import { dbService } from './db';
import { INITIAL_USER } from './sampleData';
import { storageService } from './storageService';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const userId = storageService.getActiveUserId();
    if (!userId) return null;

    let user = await dbService.getById<User>('users', userId);
    if (!user && userId === INITIAL_USER.id) {
      user = INITIAL_USER;
      await dbService.put('users', INITIAL_USER);
    }
    return user;
  },

  async login(emailOrUsername: string): Promise<User> {
    const users = await dbService.getAll<User>('users');
    const inputLower = emailOrUsername.toLowerCase().trim();

    let found = users.find(
      (u) => u.email.toLowerCase() === inputLower || u.username.toLowerCase() === inputLower
    );

    if (!found) {
      // Create account dynamically if not existing for smooth demo experience
      const newUsername = inputLower.includes('@') ? inputLower.split('@')[0] : inputLower;
      found = {
        id: 'user_' + Date.now(),
        username: newUsername,
        displayName: newUsername.charAt(0).toUpperCase() + newUsername.slice(1),
        email: inputLower.includes('@') ? inputLower : `${newUsername}@pinscape.local`,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
        bio: 'Pinscape enthusiast & image curator.',
        followersCount: 0,
        followingCount: 0,
        totalImages: 0,
        createdAt: new Date().toISOString(),
      };
      await dbService.put('users', found);
    }

    storageService.setActiveUserId(found.id);
    return found;
  },

  async register(username: string, email: string, displayName: string): Promise<User> {
    const newUser: User = {
      id: 'user_' + Date.now(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      bio: 'New Pinscape creator.',
      followersCount: 0,
      followingCount: 0,
      totalImages: 0,
      createdAt: new Date().toISOString(),
    };

    await dbService.put('users', newUser);
    storageService.setActiveUserId(newUser.id);
    return newUser;
  },

  async logout(): Promise<void> {
    storageService.setActiveUserId(null);
  },
};
