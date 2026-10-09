"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationsForActor,
  getUnreadNotificationCount,
  createNotification,
  type NotificationItem,
} from "@/application/notificationService";

async function getAuthenticatedActorId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    select: { id: true },
  });

  return actor?.id || null;
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const actorId = await getAuthenticatedActorId();
    if (!actorId) return { success: false, error: "Unauthorized" };

    const res = await markNotificationAsRead(notificationId, actorId);
    revalidatePath("/dashboard");
    return res;
  } catch (error: any) {
    console.error("Error marking notification read:", error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const actorId = await getAuthenticatedActorId();
    if (!actorId) return { success: false, error: "Unauthorized" };

    const res = await markAllNotificationsAsRead(actorId);
    revalidatePath("/dashboard");
    return res;
  } catch (error: any) {
    console.error("Error marking all notifications read:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchMyNotificationsAction(): Promise<{
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const actorId = await getAuthenticatedActorId();
    if (!actorId) {
      return { success: false, notifications: [], unreadCount: 0, error: "Unauthorized" };
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForActor(actorId, 30),
      getUnreadNotificationCount(actorId),
    ]);

    return { success: true, notifications, unreadCount };
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [], unreadCount: 0, error: error.message };
  }
}

export async function simulateNewInterestNotificationAction(
  applicantName: string = "Elena Rostova (Fashion Stylist)"
) {
  try {
    const actorId = await getAuthenticatedActorId();
    if (!actorId) return { success: false, error: "Unauthorized" };

    const title = "Minat Kolaborasi Baru (Simulasi)";
    const message = `${applicantName} baru saja mengajukan ketertarikan untuk bergabung dalam proyek kolaborasi Anda.`;

    const res = await createNotification({
      actorId,
      title,
      message,
      type: "INTEREST_RECEIVED",
      link: "/collaborations",
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      notification: {
        id: res.id || "simulated-id",
        title,
        message,
        link: "/collaborations",
      },
    };
  } catch (error: any) {
    console.error("Error creating simulated notification:", error);
    return { success: false, error: error.message };
  }
}

