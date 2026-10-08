"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import {
  sendMessage,
  getMessages,
  respondToProjectOffer,
  sendProjectDelivery,
  respondToProjectDelivery,
  reportProjectMediationIssue,
  MessageType,
} from "@/application/messageService";

async function getAuthenticatedActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Anda harus login untuk menggunakan fitur perpesanan.");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    select: { id: true, name: true, sector: true, actorType: true },
  });

  if (!actor) throw new Error("Profil aktor tidak ditemukan.");

  return actor;
}

export async function sendDirectMessageAction(
  recipientId: string,
  content: string,
  messageType: MessageType = "TEXT",
  metadata: Record<string, any> = {}
) {
  try {
    const currentActor = await getAuthenticatedActor();
    if (!content.trim() && messageType === "TEXT") {
      return { success: false, error: "Pesan tidak boleh kosong." };
    }

    if (currentActor.id === recipientId) {
      return { success: false, error: "Tidak dapat mengirim pesan ke diri sendiri." };
    }

    const res = await sendMessage({
      senderId: currentActor.id,
      recipientId,
      content: content.trim(),
      messageType,
      metadata,
    });

    if (res.success) {
      revalidatePath("/messages");
      revalidatePath(`/messages?with=${recipientId}`);
    }

    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengirim pesan." };
  }
}

export async function sendProjectOfferAction({
  recipientId,
  title,
  budget,
  sessionDate,
  outputDetails,
  notes,
}: {
  recipientId: string;
  title: string;
  budget: string;
  sessionDate: string;
  outputDetails: string;
  notes?: string;
}) {
  try {
    const currentActor = await getAuthenticatedActor();

    const cleanTitle = (title || "").trim();
    const cleanBudget = (budget || "").trim();
    if (!cleanTitle || !cleanBudget) {
      return { success: false, error: "Judul proyek dan nilai tawaran wajib diisi." };
    }
    if (currentActor.id === recipientId) {
      return { success: false, error: "Tidak dapat mengirim tawaran ke diri sendiri." };
    }

    const metadata = {
      title: cleanTitle,
      budget: cleanBudget,
      sessionDate: (sessionDate || "").trim(),
      outputDetails: (outputDetails || "").trim(),
      notes: (notes || "").trim(),
      offerStatus: "PENDING", // PENDING, ACCEPTED, DECLINED
      sentAt: new Date().toISOString(),
    };

    const offerSummary = `[TAWARAN PROYEK RESMI] ${cleanTitle} (${cleanBudget})`;

    const res = await sendMessage({
      senderId: currentActor.id,
      recipientId,
      content: offerSummary,
      messageType: "OFFER",
      metadata,
    });

    if (res.success) {
      revalidatePath("/messages");
      revalidatePath(`/messages?with=${recipientId}`);
    }

    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengirim tawaran proyek." };
  }
}

export async function respondToOfferAction(
  messageId: string,
  responseStatus: "ACCEPTED" | "DECLINED"
) {
  try {
    const currentActor = await getAuthenticatedActor();

    const res = await respondToProjectOffer({
      messageId,
      actorId: currentActor.id,
      responseStatus,
    });

    if (res.success) {
      revalidatePath("/messages");
      if (responseStatus === "ACCEPTED") {
        revalidatePath("/collaborations");
        if (res.collaborationId) revalidatePath(`/collaborations/${res.collaborationId}`);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/bookings");
      }
    }

    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal merespons tawaran." };
  }
}

export async function sendProjectDeliveryAction({
  recipientId,
  title,
  storageUrl,
  deliverableNotes,
  deliveryStage = "WATERMARKED_PREVIEW",
}: {
  recipientId: string;
  title: string;
  storageUrl: string;
  deliverableNotes?: string;
  deliveryStage?: "WATERMARKED_PREVIEW" | "FINAL_MASTER";
}) {
  try {
    const currentActor = await getAuthenticatedActor();

    const res = await sendProjectDelivery({
      senderId: currentActor.id,
      recipientId,
      title,
      storageUrl,
      deliverableNotes,
      deliveryStage,
    });

    if (res.success) {
      revalidatePath("/messages");
      revalidatePath(`/messages?with=${recipientId}`);
    }

    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengirimkan hasil proyek." };
  }
}

export async function respondToDeliveryAction(
  messageId: string,
  responseStatus: "ACCEPTED" | "REVISION_REQUESTED",
  feedbackNotes?: string
) {
  try {
    const currentActor = await getAuthenticatedActor();

    const res = await respondToProjectDelivery({
      messageId,
      actorId: currentActor.id,
      responseStatus,
      feedbackNotes,
    });

    if (res.success) {
      revalidatePath("/messages");
      revalidatePath("/collaborations");
      if (res.collaborationId) revalidatePath(`/collaborations/${res.collaborationId}`);
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/bookings");
    }

    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal merespons hasil proyek." };
  }
}

export async function reportMediationIssueAction({
  partnerId,
  category,
  chronology,
}: {
  partnerId: string;
  category: string;
  chronology: string;
}) {
  try {
    const currentActor = await getAuthenticatedActor();

    const res = await reportProjectMediationIssue({
      reporterId: currentActor.id,
      partnerId,
      category,
      chronology,
    });

    if (res.success) {
      revalidatePath("/messages");
      revalidatePath(`/messages?with=${partnerId}`);
    }

    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengajukan mediasi." };
  }
}

export async function fetchMessagesAction(partnerId: string) {
  try {
    const currentActor = await getAuthenticatedActor();
    const messages = await getMessages(currentActor.id, partnerId);
    return { success: true, messages };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memuat pesan.", messages: [] };
  }
}
