/**
 * Notifications API - placeholder until notifications feature is implemented
 */

import { apiFetch } from './client';

export interface Notification {
  id: string;
  type: 'chirp' | 'like' | 'retweet' | 'comment' | 'follow';
  user: {
    username: string;
    profile_picture_url: string;
    level: number;
  };
  content?: string;
  timestamp: string;
  tweet_id?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await apiFetch<NotificationsResponse>('/notifications');
  return res.notifications || [];
}
