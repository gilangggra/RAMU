import { prisma } from "@/infrastructure/database/prisma";
import { createNotification } from "@/application/notificationService";

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
}: {
  senderId: string;
  recipientId: string;
  content: string;
  messageType?: MessageType;
  metadata?: Record<string, any>;
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

    // Dapatkan nama pengirim untuk notifikasi
    const sender = await prisma.actor.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    const notifTitle =
      messageType === "OFFER"
        ? `Tawaran Proyek Baru dari ${sender?.name || "Kreator"}`
        : `Pesan Baru dari ${sender?.name || "Kreator"}`;

    await createNotification({
      actorId: recipientId,
      title: notifTitle,
      message: content.length > 80 ? content.slice(0, 80) + "..." : content,
      type: "BOOKING_RECEIVED",
      link: `/messages?with=${senderId}`,
    });

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
 * Menanggapi penawaran proyek (Terima / Tolak tawaran deal)
 */
export async function respondToProjectOffer({
  messageId,
  actorId,
  responseStatus,
}: {
  messageId: string;
  actorId: string;
  responseStatus: "ACCEPTED" | "DECLINED";
}): Promise<{ success: boolean; error?: string }> {
  try {
    const messages = await prisma.$queryRawUnsafe<Array<{ id: string; recipient_actor_id: string; sender_actor_id: string; metadata: any }>>(
      `SELECT id, recipient_actor_id, sender_actor_id, metadata FROM direct_messages WHERE id = $1::uuid`,
      messageId
    );

    const msg = messages[0];
    if (!msg) return { success: false, error: "Pesan penawaran tidak ditemukan." };
    if (msg.recipient_actor_id !== actorId) {
      return { success: false, error: "Hanya penerima tawaran yang dapat merespons penawaran ini." };
    }

    const currentMeta = typeof msg.metadata === "string" ? JSON.parse(msg.metadata) : msg.metadata || {};
    currentMeta.offerStatus = responseStatus;
    currentMeta.respondedAt = new Date().toISOString();

    await prisma.$executeRawUnsafe(
      `UPDATE direct_messages SET metadata = $1::jsonb WHERE id = $2::uuid`,
      JSON.stringify(currentMeta),
      messageId
    );

    // Kirim pesan sistem otomatis di chat
    const respondent = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { name: true },
    });

    const statusText = responseStatus === "ACCEPTED" ? "menyetujui tawaran proyek resmi" : "menolak tawaran proyek";
    const systemNotice = `${respondent?.name || "Mitra"} telah ${statusText}.`;

    await sendMessage({
      senderId: actorId,
      recipientId: msg.sender_actor_id,
      content: systemNotice,
      messageType: "SYSTEM",
      metadata: { relatedOfferId: messageId, status: responseStatus },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error responding to offer:", error);
    return { success: false, error: error.message };
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
 * Merespons serah terima hasil proyek (Terima & Selesaikan atau Minta Revisi)
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
}): Promise<{ success: boolean; error?: string }> {
  try {
    const messages = await prisma.$queryRawUnsafe<
      Array<{ id: string; recipient_actor_id: string; sender_actor_id: string; metadata: any }>
    >(
      `SELECT id, recipient_actor_id, sender_actor_id, metadata FROM direct_messages WHERE id = $1::uuid`,
      messageId
    );

    const msg = messages[0];
    if (!msg) return { success: false, error: "Pesan serah terima tidak ditemukan." };
    if (msg.recipient_actor_id !== actorId) {
      return { success: false, error: "Hanya penerima hasil kerja yang dapat menyetujui serah terima ini." };
    }

    const currentMeta = typeof msg.metadata === "string" ? JSON.parse(msg.metadata) : msg.metadata || {};
    currentMeta.deliveryStatus = responseStatus;
    currentMeta.approvedAt = new Date().toISOString();
    if (feedbackNotes) currentMeta.clientFeedback = feedbackNotes;

    await prisma.$executeRawUnsafe(
      `UPDATE direct_messages SET metadata = $1::jsonb WHERE id = $2::uuid`,
      JSON.stringify(currentMeta),
      messageId
    );

    const respondent = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { name: true },
    });

    const statusText =
      responseStatus === "ACCEPTED"
        ? "menyetujui seluruh hasil proyek. Proyek dinyatakan SELESAI dan dana Escrow resmi dicairkan ke kreator."
        : `meminta revisi terhadap hasil kerja: "${feedbackNotes || "Perlu penyesuaian detail"}".`;

    const systemNotice = `${respondent?.name || "Klien"} telah ${statusText}`;

    await sendMessage({
      senderId: actorId,
      recipientId: msg.sender_actor_id,
      content: systemNotice,
      messageType: "SYSTEM",
      metadata: { relatedDeliveryId: messageId, status: responseStatus },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error responding to delivery:", error);
    return { success: false, error: error.message };
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
