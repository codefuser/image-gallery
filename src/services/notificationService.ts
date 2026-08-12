import { Notification, NotificationType } from '../types';
import { dbService } from './db';
import { storageService } from './storageService';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const userId = storageService.getActiveUserId() || 'user_demo_123';
    const all = await dbService.getAll<Notification>('notifications');
    const userNotifs = all.filter((n) => n.userId === userId);
    return userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getUnreadCount(): Promise<number> {
    const notifs = await this.getNotifications();
    return notifs.filter((n) => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<void> {
    const notif = await dbService.getById<Notification>('notifications', id);
    if (notif) {
      notif.isRead = true;
      await dbService.put('notifications', notif);
    }
  },

  async markAllAsRead(): Promise<void> {
    const notifs = await this.getNotifications();
    for (const n of notifs) {
      if (!n.isRead) {
        n.isRead = true;
        await dbService.put('notifications', n);
      }
    }
  },

  async addNotification(data: {
    type: NotificationType;
    actorName: string;
    actorAvatar: string;
    imageId?: string;
    imageThumbnail?: string;
    text: string;
  }): Promise<Notification> {
    const userId = storageService.getActiveUserId() || 'user_demo_123';
    const newNotif: Notification = {
      id: 'notif_' + Date.now(),
      userId,
      type: data.type,
      actorName: data.actorName,
      actorAvatar: data.actorAvatar,
      imageId: data.imageId,
      imageThumbnail: data.imageThumbnail,
      text: data.text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await dbService.put('notifications', newNotif);
    return newNotif;
  },
};
