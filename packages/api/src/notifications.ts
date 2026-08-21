import { ApiClient } from './client';
import {
  Notification,
  NotificationListResponse,
  NotificationPreferences,
} from '@swipex/types';

export class NotificationsApi {
  constructor(private client: ApiClient) {}

  public async getNotifications(params?: {
    page?: number;
    perPage?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('perPage', params.perPage.toString());
    if (params?.isRead !== undefined) query.append('isRead', params.isRead.toString());
    if (params?.type) query.append('type', params.type);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.client.get<NotificationListResponse>(`/notifications${queryString}`);
  }

  public async getUnreadCount(): Promise<{ unreadCount: number }> {
    return this.client.get<{ unreadCount: number }>('/notifications/unread-count');
  }

  public async markAsRead(id: string): Promise<Notification> {
    return this.client.put<Notification>(`/notifications/${id}/read`);
  }

  public async markAllAsRead(): Promise<{ success: boolean; updatedCount: number }> {
    return this.client.put<{ success: boolean; updatedCount: number }>('/notifications/read-all');
  }

  public async dismissNotification(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/notifications/${id}`);
  }

  public async getPreferences(): Promise<NotificationPreferences> {
    return this.client.get<NotificationPreferences>('/notifications/preferences');
  }

  public async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return this.client.put<NotificationPreferences>('/notifications/preferences', prefs);
  }
}

import { api } from './client';
export const notificationsApi = new NotificationsApi(api);

