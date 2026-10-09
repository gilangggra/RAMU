import { prisma } from "@/infrastructure/database/prisma";

export type NotificationType =
  | "INFO"
  | "INTEREST_RECEIVED"
  | "INTEREST_ACCEPTED"
  | "INTEREST_DECLINED"
  | "COLLABORATION_STARTED"
  | "BOOKING_RECEIVED"
  | "BOOKING_UPDATE";

export interface NotificationItem {
  id: string;
  actor_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: Date;
}

export async function createNotification({
  actorId,
  title,
  message,
  type = "INFO",
  link = null,
  metadata = {},
}: {
  actorId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string | null;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; id?: string }> {
  try {
    const metaJson = JSON.stringify(metadata);
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `
      INSERT INTO notifications (id, actor_id, title, message, type, link, metadata, is_read, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6::jsonb, false, NOW())
      RETURNING id
      `,
      actorId,
      title,
      message,
      type,
      link,
      metaJson
    );

    return { success: true, id: rows[0]?.id };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { success: false };
  }
}

export async function getNotificationsForActor(
  actorId: string,
  limit: number = 20
): Promise<NotificationItem[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<NotificationItem[]>(
      `
      SELECT id, actor_id, title, message, type, link, is_read, metadata, created_at
      FROM notifications
      WHERE actor_id = $1::uuid
      ORDER BY created_at DESC
      LIMIT $2
      `,
      actorId,
      limit
    );

    return rows;
  } catch (error) {
    console.error("Failed to get notifications for actor:", error);
    return [];
  }
}

export async function getNotificationsWithUnreadCount(
  actorId: string,
  limit: number = 20
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<NotificationItem & { unread_count: bigint | number }>>(
      `
      WITH unread AS (
        SELECT COUNT(*) as unread_count
        FROM notifications
        WHERE actor_id = $1::uuid AND is_read = false
      ),
      notifs AS (
        SELECT id, actor_id, title, message, type, link, is_read, metadata, created_at
        FROM notifications
        WHERE actor_id = $1::uuid
        ORDER BY created_at DESC
        LIMIT $2
      )
      SELECT 
        n.id, n.actor_id, n.title, n.message, n.type, n.link, n.is_read, n.metadata, n.created_at,
        u.unread_count
      FROM unread u
      LEFT JOIN notifs n ON true;
      `,
      actorId,
      limit
    );

    if (!rows || rows.length === 0) {
      return { notifications: [], unreadCount: 0 };
    }

    const unreadCount = Number(rows[0].unread_count || 0);
    const notifications = rows[0].id
      ? rows.map((r) => ({
          id: r.id,
          actor_id: r.actor_id,
          title: r.title,
          message: r.message,
          type: r.type,
          link: r.link,
          is_read: r.is_read,
          metadata: r.metadata,
          created_at: r.created_at,
        }))
      : [];

    return { notifications, unreadCount };
  } catch (error) {
    console.error("Failed to get notifications with unread count:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function getUnreadNotificationCount(actorId: string): Promise<number> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE actor_id = $1::uuid AND is_read = false
      `,
      actorId
    );

    return Number(rows[0]?.count || 0);
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
}

export async function markNotificationAsRead(
  notificationId: string,
  actorId: string
): Promise<{ success: boolean }> {
  try {
    await prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1::uuid AND actor_id = $2::uuid
      `,
      notificationId,
      actorId
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(
  actorId: string
): Promise<{ success: boolean }> {
  try {
    await prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET is_read = true
      WHERE actor_id = $1::uuid AND is_read = false
      `,
      actorId
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false };
  }
}
