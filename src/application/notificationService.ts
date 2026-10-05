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
