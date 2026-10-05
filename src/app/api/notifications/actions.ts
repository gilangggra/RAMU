"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  getNotificationsForActor,
  getNotificationsWithUnreadCount,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
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
    select: { id: true },
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
    return await getNotificationsWithUnreadCount(actor.id, 20);
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

export async function simulateNewInterestNotificationAction(customCandidateName?: string): Promise<{
  success: boolean;
  notification?: NotificationItem;
}> {
  try {
    const actor = await getPrimaryActor();
    const candidate = customCandidateName || "Glow & Form Artistry";
    const roleLabel = "Fashion Stylist & Wardrobe";

    const res = await createNotification({
      actorId: actor.id,
      title: "Peminat Kolaborasi Baru",
      message: `${candidate} baru saja mengajukan minat untuk peran "${roleLabel}" pada brief proyek Anda. Klik untuk meninjau lamaran & portofolio.`,
      type: "INTEREST_RECEIVED",
      link: "/projects",
      metadata: { candidateName: candidate, roleLabel, simulated: true },
    });

    if (res.success && res.id) {
      const items = await getNotificationsForActor(actor.id, 1);
      return { success: true, notification: items[0] };
    }
    return { success: false };
  } catch (err) {
    return { success: false };
  }
}
