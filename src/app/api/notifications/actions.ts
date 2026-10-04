"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  getNotificationsForActor,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationItem,
} from "@/application/notificationService";

async function getPrimaryActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) throw new Error("Actor not found");
  return actor;
}

export async function fetchMyNotificationsAction(): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  try {
    const actor = await getPrimaryActor();
    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForActor(actor.id, 20),
      getUnreadNotificationCount(actor.id),
    ]);
    return { notifications, unreadCount };
  } catch (error) {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<{ success: boolean }> {
  try {
    const actor = await getPrimaryActor();
    return await markNotificationAsRead(notificationId, actor.id);
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  try {
    const actor = await getPrimaryActor();
    return await markAllNotificationsAsRead(actor.id);
  } catch {
    return { success: false };
  }
}
