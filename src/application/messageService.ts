import { prisma } from "@/infrastructure/database/prisma";
import { createNotification } from "@/application/notificationService";
import {
  MessengerFlowError,
  OfferMetadata,
  DeliveryMetadata,
  createCollaborationFromAcceptedOffer,
  completeCollaborationFromDelivery,
  recordDeliveryRevision,
  findActiveCollaborationBetween,
} from "@/application/messageCollaborationBridge";

const TX_OPTIONS = { maxWait: 10000, timeout: 30000 };

type LockedMessageRow = {
  id: string;
  recipient_actor_id: string;
  sender_actor_id: string;
  message_type: string;
  metadata: any;
};

function parseMeta<T>(raw: unknown): T {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }
  return ((raw as T) || {}) as T;
}

export type MessageType = "TEXT" | "OFFER" | "BRIEF_SHARE" | "DELIVERY" | "SYSTEM";

export interface DirectMessageItem {
  id: string;
  sender_actor_id: string;
  recipient_actor_id: string;
  content: string;
  message_type: MessageType;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: Date;
}

export interface ConversationSummary {
  partnerId: string;
  partnerName: string;
  partnerSector: string;
  partnerType: string;
  partnerLocation: string | null;
  partnerAvatar: string | null;
  partnerPhone: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageType: MessageType;
  unreadCount: number;
}

/**
 * Mendapatkan daftar percakapan aktif untuk aktor saat ini
 */
export async function getConversations(actorId: string): Promise<ConversationSummary[]> {
  try {
    const rawConversations = await prisma.$queryRawUnsafe<
      Array<{
        partner_id: string;
        partner_name: string;
        partner_sector: string;
        partner_type: string;
        partner_location: string | null;
        partner_avatar: string | null;
        partner_phone: string | null;
        last_content: string;
        last_created_at: Date;
        last_type: string;
        unread_count: string | number;
      }>
    >(
      `
      WITH user_messages AS (
        SELECT 
          CASE 
            WHEN sender_actor_id = $1::uuid THEN recipient_actor_id 
            ELSE sender_actor_id 
          END AS partner_id,
          content,
          created_at,
          message_type,
          CASE 
            WHEN recipient_actor_id = $1::uuid AND is_read = false THEN 1 
            ELSE 0 
          END AS is_unread
        FROM direct_messages
        WHERE sender_actor_id = $1::uuid OR recipient_actor_id = $1::uuid
      ),
      ranked_messages AS (
        SELECT 
          partner_id,
          content,
          created_at,
          message_type,
          ROW_NUMBER() OVER(PARTITION BY partner_id ORDER BY created_at DESC) as rn
        FROM user_messages
      ),
      unread_counts AS (
        SELECT partner_id, SUM(is_unread) as unread_sum
        FROM user_messages
        GROUP BY partner_id
      )
      SELECT 
        r.partner_id,
        a.name as partner_name,
        a.sector as partner_sector,
        a.actor_type as partner_type,
        a.location as partner_location,
        COALESCE(p.avatar_url, NULL) as partner_avatar,
        a.contact_phone as partner_phone,
        r.content as last_content,
        r.created_at as last_created_at,
        r.message_type as last_type,
        COALESCE(u.unread_sum, 0) as unread_count
      FROM ranked_messages r
      JOIN actors a ON a.id = r.partner_id
      LEFT JOIN profiles p ON p.id = a.owner_user_id
      LEFT JOIN unread_counts u ON u.partner_id = r.partner_id
      WHERE r.rn = 1
      ORDER BY r.created_at DESC
      `,
      actorId
    );

    return rawConversations.map((c) => ({
      partnerId: c.partner_id,
      partnerName: c.partner_name,
      partnerSector: c.partner_sector,
      partnerType: c.partner_type,
      partnerLocation: c.partner_location,
      partnerAvatar: c.partner_avatar,
      partnerPhone: c.partner_phone,
      lastMessage: c.last_content,
      lastMessageAt: new Date(c.last_created_at),
      lastMessageType: (c.last_type as MessageType) || "TEXT",
      unreadCount: Number(c.unread_count) || 0,
    }));
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
}

/**
 * Mendapatkan riwayat pesan antara 2 aktor dan otomatis menandai telah dibaca
 */
export async function getMessages(
  actorId: string,
  partnerId: string
): Promise<DirectMessageItem[]> {
  try {
    // Mark as read
    await prisma.$executeRawUnsafe(
      `
      UPDATE direct_messages 
      SET is_read = true 
      WHERE sender_actor_id = $1::uuid AND recipient_actor_id = $2::uuid AND is_read = false
      `,
      partnerId,
      actorId
    );

    // Fetch messages
    const messages = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        sender_actor_id: string;
        recipient_actor_id: string;
        content: string;
        message_type: string;
        metadata: any;
        is_read: boolean;
        created_at: Date;
      }>
    >(
      `
      SELECT id, sender_actor_id, recipient_actor_id, content, message_type, metadata, is_read, created_at
      FROM direct_messages
      WHERE (sender_actor_id = $1::uuid AND recipient_actor_id = $2::uuid)
         OR (sender_actor_id = $2::uuid AND recipient_actor_id = $1::uuid)
      ORDER BY created_at ASC
      `,
      actorId,
      partnerId
    );

    return messages.map((m) => ({
      id: m.id,
      sender_actor_id: m.sender_actor_id,
      recipient_actor_id: m.recipient_actor_id,
      content: m.content,
      message_type: (m.message_type as MessageType) || "TEXT",
      metadata: typeof m.metadata === "string" ? JSON.parse(m.metadata) : m.metadata || {},
      is_read: m.is_read,
      created_at: new Date(m.created_at),
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Mengirim pesan teks atau penawaran resmi di dalam platform RAMU
 */
export async function sendMessage({
  senderId,
  recipientId,
  content,
  messageType = "TEXT",
  metadata = {},
  skipNotification = false,
}: {
  senderId: string;
  recipientId: string;
  content: string;
  messageType?: MessageType;
  metadata?: Record<string, any>;
  skipNotification?: boolean;
}): Promise<{ success: boolean; message?: DirectMessageItem; error?: string }> {
  try {
    const metaJson = JSON.stringify(metadata);

    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        sender_actor_id: string;
        recipient_actor_id: string;
        content: string;
        message_type: string;
        metadata: any;
        is_read: boolean;
        created_at: Date;
      }>
    >(
      `
      INSERT INTO direct_messages (sender_actor_id, recipient_actor_id, content, message_type, metadata, is_read, created_at)
      VALUES ($1::uuid, $2::uuid, $3, $4, $5::jsonb, false, NOW())
      RETURNING id, sender_actor_id, recipient_actor_id, content, message_type, metadata, is_read, created_at
      `,
      senderId,
      recipientId,
      content,
      messageType,
      metaJson
    );

    const created = rows[0];
    if (!created) {
      return { success: false, error: "Gagal menyimpan pesan ke database." };
    }

    if (!skipNotification) {
      // Dapatkan nama pengirim untuk notifikasi
      const sender = await prisma.actor.findUnique({
        where: { id: senderId },
        select: { name: true },
      });

      const senderName = sender?.name || "Kreator";
      const notifTitle =
        messageType === "OFFER"
          ? `Tawaran Proyek Baru dari ${senderName}`
          : messageType === "DELIVERY"
          ? `Serah Terima Hasil Proyek dari ${senderName}`
          : `Pesan Baru dari ${senderName}`;

      await createNotification({
        actorId: recipientId,
        title: notifTitle,
        message: content.length > 80 ? content.slice(0, 80) + "..." : content,
        type: "BOOKING_RECEIVED",
        link: `/messages?with=${senderId}`,
      });
    }

    return {
      success: true,
      message: {
        id: created.id,
        sender_actor_id: created.sender_actor_id,
        recipient_actor_id: created.recipient_actor_id,
        content: created.content,
        message_type: (created.message_type as MessageType) || "TEXT",
        metadata: typeof created.metadata === "string" ? JSON.parse(created.metadata) : created.metadata || {},
        is_read: created.is_read,
        created_at: new Date(created.created_at),
      },
    };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message || "Gagal mengirim pesan." };
  }
}

/**
 * Menanggapi penawaran proyek (Terima / Tolak tawaran deal).
 * Jika diterima, secara atomik membentuk:
 * - Rencana & ruang kolaborasi aktif (CollaborationPlan + Collaboration + peserta + tugas + milestone)
 * - SPK resmi (BookingRequest berstatus ACCEPTED) yang tampil di /dashboard/bookings
 */
export async function respondToProjectOffer({
  messageId,
  actorId,
  responseStatus,
}: {
  messageId: string;
  actorId: string;
  responseStatus: "ACCEPTED" | "DECLINED";
}): Promise<{ success: boolean; error?: string; collaborationId?: string; bookingId?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Kunci baris pesan agar klik ganda / respons bersamaan tidak membuat kolaborasi ganda
      const rows = await tx.$queryRawUnsafe<LockedMessageRow[]>(
        `SELECT id, recipient_actor_id, sender_actor_id, message_type, metadata
         FROM direct_messages WHERE id = $1::uuid FOR UPDATE`,
        messageId
      );

      const msg = rows[0];
      if (!msg) throw new MessengerFlowError("Pesan penawaran tidak ditemukan.");
      if (msg.message_type !== "OFFER") throw new MessengerFlowError("Pesan ini bukan tawaran proyek resmi.");
      if (msg.recipient_actor_id !== actorId) {
        throw new MessengerFlowError("Hanya penerima tawaran yang dapat merespons penawaran ini.");
      }

      const meta = parseMeta<OfferMetadata & { collaborationId?: string; bookingId?: string; respondedAt?: string }>(
        msg.metadata
      );
      if (meta.offerStatus && meta.offerStatus !== "PENDING") {
        throw new MessengerFlowError("Tawaran ini sudah direspons sebelumnya.");
      }

      meta.offerStatus = responseStatus;
      meta.respondedAt = new Date().toISOString();

      let collaborationId: string | undefined;
      let bookingId: string | undefined;

      if (responseStatus === "ACCEPTED") {
        const created = await createCollaborationFromAcceptedOffer(tx, {
          offerMessageId: msg.id,
          senderId: msg.sender_actor_id,
          recipientId: msg.recipient_actor_id,
          meta,
        });
        collaborationId = created.collaborationId;
        bookingId = created.bookingId;
        meta.collaborationId = collaborationId;
        meta.bookingId = bookingId;
      }

      await tx.$executeRawUnsafe(
        `UPDATE direct_messages SET metadata = $1::jsonb WHERE id = $2::uuid`,
        JSON.stringify(meta),
        messageId
      );

      return { senderId: msg.sender_actor_id, title: meta.title, collaborationId, bookingId };
    }, TX_OPTIONS);

    // Efek samping non-kritis (pesan sistem & notifikasi) dijalankan setelah transaksi berhasil
    const respondent = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { name: true },
    });
    const respondentName = respondent?.name || "Mitra";

    const systemNotice =
      responseStatus === "ACCEPTED"
        ? `${respondentName} telah menyetujui tawaran proyek resmi. Ruang kolaborasi dan SPK telah dibuat otomatis.`
        : `${respondentName} telah menolak tawaran proyek.`;

    await sendMessage({
      senderId: actorId,
      recipientId: result.senderId,
      content: systemNotice,
      messageType: "SYSTEM",
      metadata: {
        relatedOfferId: messageId,
        status: responseStatus,
        collaborationId: result.collaborationId || null,
        bookingId: result.bookingId || null,
      },
      skipNotification: true,
    });

    if (responseStatus === "ACCEPTED" && result.collaborationId) {
      await createNotification({
        actorId: result.senderId,
        title: "Tawaran Proyek Disetujui",
        message: `${respondentName} menyetujui tawaran "${result.title || "Proyek Kolaborasi"}". Ruang kolaborasi sudah aktif.`,
        type: "COLLABORATION_STARTED",
        link: `/collaborations/${result.collaborationId}`,
        metadata: { collaborationId: result.collaborationId, bookingId: result.bookingId, offerMessageId: messageId },
      });
    } else {
      await createNotification({
        actorId: result.senderId,
        title: "Tawaran Proyek Ditolak",
        message: `${respondentName} menolak tawaran "${result.title || "Proyek Kolaborasi"}".`,
        type: "BOOKING_UPDATE",
        link: `/messages?with=${actorId}`,
        metadata: { offerMessageId: messageId },
      });
    }

    return { success: true, collaborationId: result.collaborationId, bookingId: result.bookingId };
  } catch (error: any) {
    if (!(error instanceof MessengerFlowError)) {
      console.error("Error responding to offer:", error);
    }
    return {
      success: false,
      error: error instanceof MessengerFlowError ? error.message : "Gagal memproses tawaran. Silakan coba lagi.",
    };
  }
}

/**
 * Menyerahkan hasil kerja proyek resmi (Deliverables handover)
 */
export async function sendProjectDelivery({
  senderId,
  recipientId,
  title,
  storageUrl,
  deliverableNotes,
}: {
  senderId: string;
  recipientId: string;
  title: string;
  storageUrl: string;
  deliverableNotes?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Tautkan serah terima ke ruang kolaborasi aktif milik kedua pihak (jika ada)
    const activeCollaboration = await findActiveCollaborationBetween(senderId, recipientId);

    const res = await sendMessage({
      senderId,
      recipientId,
      content: `[SERAH TERIMA HASIL PROYEK] ${title}`,
      messageType: "DELIVERY",
      metadata: {
        title,
        storageUrl,
        deliverableNotes: deliverableNotes || "Seluruh berkas hasil kerja telah diunggah untuk ditinjau.",
        deliveryStatus: "PENDING_APPROVAL",
        submittedAt: new Date().toISOString(),
        collaborationId: activeCollaboration?.id || null,
        collaborationTitle: activeCollaboration?.title || null,
      },
    });

    if (!res.success) return { success: false, error: res.error };
    return { success: true, messageId: res.message?.id };
  } catch (error: any) {
    console.error("Error sending project delivery:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Merespons serah terima hasil proyek (Terima & Selesaikan atau Minta Revisi).
 * - Diterima: ruang kolaborasi terkait ditutup (COMPLETED), tugas & milestone dituntaskan,
 *   luaran dicatat sebagai Outcome, dan status SPK ikut diperbarui.
 * - Revisi: tugas revisi baru dibuat untuk pelaksana di ruang kolaborasi.
 */
export async function respondToProjectDelivery({
  messageId,
  actorId,
  responseStatus,
  feedbackNotes,
}: {
  messageId: string;
  actorId: string;
  responseStatus: "ACCEPTED" | "REVISION_REQUESTED";
  feedbackNotes?: string;
}): Promise<{ success: boolean; error?: string; collaborationId?: string | null }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRawUnsafe<LockedMessageRow[]>(
        `SELECT id, recipient_actor_id, sender_actor_id, message_type, metadata
         FROM direct_messages WHERE id = $1::uuid FOR UPDATE`,
        messageId
      );

      const msg = rows[0];
      if (!msg) throw new MessengerFlowError("Pesan serah terima tidak ditemukan.");
      if (msg.message_type !== "DELIVERY") throw new MessengerFlowError("Pesan ini bukan serah terima hasil proyek.");
      if (msg.recipient_actor_id !== actorId) {
        throw new MessengerFlowError("Hanya penerima hasil kerja yang dapat menyetujui serah terima ini.");
      }

      const meta = parseMeta<DeliveryMetadata & Record<string, unknown>>(msg.metadata);
      if (meta.deliveryStatus && meta.deliveryStatus !== "PENDING_APPROVAL") {
        throw new MessengerFlowError("Serah terima ini sudah direspons sebelumnya.");
      }

      // Serah terima lama (sebelum sinkronisasi) mungkin belum tertaut; cari ruang kolaborasi aktif keduanya
      let collaborationId = (meta.collaborationId as string | null | undefined) || null;
      if (!collaborationId) {
        const active = await findActiveCollaborationBetween(msg.sender_actor_id, msg.recipient_actor_id, tx);
        collaborationId = active?.id || null;
      }

      const now = new Date().toISOString();
      meta.deliveryStatus = responseStatus;
      meta.collaborationId = collaborationId;
      if (responseStatus === "ACCEPTED") {
        meta.approvedAt = now;
      } else {
        meta.revisionRequestedAt = now;
      }
      if (feedbackNotes) meta.clientFeedback = feedbackNotes;

      let collaborationCompleted = false;
      if (collaborationId) {
        if (responseStatus === "ACCEPTED") {
          const done = await completeCollaborationFromDelivery(tx, {
            collaborationId,
            deliveryMessageId: msg.id,
            approverId: actorId,
            providerId: msg.sender_actor_id,
            meta,
          });
          collaborationCompleted = done.completed;
        } else {
          await recordDeliveryRevision(tx, {
            collaborationId,
            approverId: actorId,
            providerId: msg.sender_actor_id,
            feedbackNotes,
            meta,
          });
        }
      }

      await tx.$executeRawUnsafe(
        `UPDATE direct_messages SET metadata = $1::jsonb WHERE id = $2::uuid`,
        JSON.stringify(meta),
        messageId
      );

      return {
        providerId: msg.sender_actor_id,
        title: meta.title,
        collaborationId,
        collaborationCompleted,
      };
    }, TX_OPTIONS);

    const respondent = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { name: true },
    });
    const respondentName = respondent?.name || "Klien";

    const statusText =
      responseStatus === "ACCEPTED"
        ? result.collaborationCompleted
          ? "menyetujui seluruh hasil kerja proyek. Proyek dinyatakan SELESAI dan ruang kolaborasi telah ditutup."
          : "menyetujui seluruh hasil kerja proyek. Proyek dinyatakan SELESAI."
        : `meminta revisi terhadap hasil kerja: "${feedbackNotes || "Perlu penyesuaian detail"}".`;

    await sendMessage({
      senderId: actorId,
      recipientId: result.providerId,
      content: `${respondentName} telah ${statusText}`,
      messageType: "SYSTEM",
      metadata: {
        relatedDeliveryId: messageId,
        status: responseStatus,
        collaborationId: result.collaborationId,
      },
      skipNotification: true,
    });

    await createNotification({
      actorId: result.providerId,
      title: responseStatus === "ACCEPTED" ? "Hasil Proyek Disetujui" : "Permintaan Revisi Hasil Proyek",
      message:
        responseStatus === "ACCEPTED"
          ? `${respondentName} menyetujui serah terima "${result.title || "Hasil Proyek"}". Proyek selesai.`
          : `${respondentName} meminta revisi untuk "${result.title || "Hasil Proyek"}".`,
      type: "BOOKING_UPDATE",
      link: result.collaborationId ? `/collaborations/${result.collaborationId}` : `/messages?with=${actorId}`,
      metadata: { deliveryMessageId: messageId, collaborationId: result.collaborationId },
    });

    return { success: true, collaborationId: result.collaborationId };
  } catch (error: any) {
    if (!(error instanceof MessengerFlowError)) {
      console.error("Error responding to delivery:", error);
    }
    return {
      success: false,
      error: error instanceof MessengerFlowError ? error.message : "Gagal memproses serah terima. Silakan coba lagi.",
    };
  }
}

/**
 * Melaporkan kendala proyek untuk bantuan mediasi resmi RAMU
 */
export async function reportProjectMediationIssue({
  reporterId,
  partnerId,
  category,
  chronology,
}: {
  reporterId: string;
  partnerId: string;
  category: string;
  chronology: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const reporter = await prisma.actor.findUnique({
      where: { id: reporterId },
      select: { name: true },
    });

    const systemNotice = `[LAPORAN BANTUAN & MEDIASI] ${reporter?.name || "Mitra"} telah mengajukan tiket mediasi resmi untuk kendala: "${category}". Tim Kepatuhan RAMU sedang meninjau kasus ini (SLA tanggapan < 24 jam). Status transaksi diamankan.`;

    await sendMessage({
      senderId: reporterId,
      recipientId: partnerId,
      content: systemNotice,
      messageType: "SYSTEM",
      metadata: {
        isMediationTicket: true,
        category,
        chronology,
        reportedAt: new Date().toISOString(),
        ticketStatus: "UNDER_REVIEW",
      },
    });

    await createNotification({
      actorId: partnerId,
      title: "Pemberitahuan Mediasi Resmi RAMU",
      message: `${reporter?.name || "Mitra"} melaporkan kendala "${category}". Tim RAMU siap menengahi penyelesaian secara adil.`,
      type: "BOOKING_UPDATE",
      link: `/messages?with=${reporterId}`,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error reporting mediation issue:", error);
    return { success: false, error: error.message };
  }
}
