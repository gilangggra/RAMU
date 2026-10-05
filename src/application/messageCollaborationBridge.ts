import { prisma } from "@/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

/**
 * Jembatan antara Messenger RAMU (direct_messages) dan ekosistem kolaborasi
 * (BookingRequest/SPK, CollaborationPlan, Collaboration, Task, Milestone, Outcome).
 *
 * Seluruh fungsi yang menerima `tx` wajib dipanggil di dalam prisma.$transaction
 * agar pembuatan data bersifat atomik (semua tersimpan atau tidak sama sekali).
 */

type Tx = Prisma.TransactionClient;

export class MessengerFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessengerFlowError";
  }
}

export interface OfferMetadata {
  title?: string;
  budget?: string;
  sessionDate?: string;
  outputDetails?: string;
  notes?: string;
  offerStatus?: string;
  sentAt?: string;
  [key: string]: unknown;
}

export interface DeliveryMetadata {
  title?: string;
  storageUrl?: string;
  deliverableNotes?: string;
  deliveryStatus?: string;
  collaborationId?: string | null;
  [key: string]: unknown;
}

interface ActorLite {
  id: string;
  name: string;
  sector: string;
  actorType: string;
}

function isClientLikeActor(actor: ActorLite): boolean {
  const type = String(actor.actorType || "").toUpperCase();
  const sector = (actor.sector || "").toLowerCase();
  return (
    type === "BRAND" ||
    type === "MSME" ||
    type === "COLLECTIVE" ||
    sector.includes("brand") ||
    sector.includes("label") ||
    sector.includes("umkm")
  );
}

/**
 * Menentukan siapa Pemberi Kerja (klien) dan Pelaksana Jasa (penyedia)
 * secara deterministik agar SPK mencantumkan para pihak dengan benar.
 * - Brand/UMKM selalu diposisikan sebagai pemberi kerja.
 * - Jika keduanya setara, pengirim tawaran diposisikan sebagai pemberi kerja.
 */
function resolveContractParties(sender: ActorLite, recipient: ActorLite) {
  const senderIsClient = isClientLikeActor(sender);
  const recipientIsClient = isClientLikeActor(recipient);

  if (recipientIsClient && !senderIsClient) {
    return { client: recipient, provider: sender };
  }
  return { client: sender, provider: recipient };
}

function parseSessionDate(raw?: string): Date {
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/**
 * Mencari ruang kolaborasi aktif terbaru yang melibatkan kedua aktor.
 * Mencakup kolaborasi yang berasal dari tawaran chat, booking, maupun peluang engine.
 */
export async function findActiveCollaborationBetween(
  actorA: string,
  actorB: string,
  client: Tx | typeof prisma = prisma
): Promise<{ id: string; title: string } | null> {
  return client.collaboration.findFirst({
    where: {
      status: { in: ["ACTIVE", "NOT_STARTED", "ON_HOLD"] },
      AND: [
        { participants: { some: { actorId: actorA } } },
        { participants: { some: { actorId: actorB } } },
      ],
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Tawaran disetujui -> bentuk SPK (BookingRequest ACCEPTED) + ruang kolaborasi aktif.
 */
export async function createCollaborationFromAcceptedOffer(
  tx: Tx,
  {
    offerMessageId,
    senderId,
    recipientId,
    meta,
  }: {
    offerMessageId: string;
    senderId: string;
    recipientId: string;
    meta: OfferMetadata;
  }
): Promise<{ collaborationId: string; bookingId: string; planId: string }> {
  const actors = await tx.actor.findMany({
    where: { id: { in: [senderId, recipientId] } },
    select: { id: true, name: true, sector: true, actorType: true },
  });

  const sender = actors.find((a) => a.id === senderId);
  const recipient = actors.find((a) => a.id === recipientId);
  if (!sender || !recipient) {
    throw new MessengerFlowError("Profil para pihak dalam tawaran tidak ditemukan.");
  }

  const { client, provider } = resolveContractParties(sender, recipient);

  const now = new Date();
  const title = (meta.title || "").trim() || `Proyek ${client.name} x ${provider.name}`;
  const budget = (meta.budget || "").trim() || "Sesuai kesepakatan";
  const scope = (meta.outputDetails || "").trim() || "Lingkup luaran sesuai kesepakatan di Messenger RAMU";
  const notes = (meta.notes || "").trim();
  const sessionDate = parseSessionDate(meta.sessionDate);
  const hasExactDate = Boolean(meta.sessionDate) && !Number.isNaN(new Date(meta.sessionDate as string).getTime());
  const scheduleLabel = hasExactDate
    ? sessionDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : meta.sessionDate || "Sesuai kesepakatan";

  const objective = [
    `Lingkup: ${scope}.`,
    `Jadwal: ${scheduleLabel}.`,
    `Nilai kesepakatan: ${budget}.`,
    notes ? `Catatan: ${notes}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // 1. Rencana kolaborasi (sudah disetujui kedua pihak lewat tawaran resmi)
  const plan = await tx.collaborationPlan.create({
    data: {
      createdByActorId: senderId,
      title,
      objective,
      expectedOutputs: [scope] as unknown as Prisma.InputJsonValue,
      budget: {
        estimatedTotal: budget,
        costSharingModel: "Nilai proyek sesuai Tawaran Resmi Messenger RAMU",
      } as Prisma.InputJsonValue,
      timeline: {
        estimatedDuration: "Sesuai jadwal tawaran",
        targetLaunch: hasExactDate ? sessionDate.toISOString().split("T")[0] : scheduleLabel,
        projectLinks: {},
      } as Prisma.InputJsonValue,
      revenueModel: {
        modelType: "DIRECT_FEE",
        description: "Fee proyek disepakati melalui Tawaran Resmi di Messenger RAMU",
      } as Prisma.InputJsonValue,
      ownershipRules: {
        brandModel: "Sesuai hak cipta & lisensi standar industri kreatif",
      } as Prisma.InputJsonValue,
      ipRules: {
        originalIp: "Hak guna luaran disepakati bersama oleh pemberi kerja dan pelaksana.",
      } as Prisma.InputJsonValue,
      status: "APPROVED",
    },
  });

  await tx.collaborationRole.createMany({
    data: [
      {
        collaborationPlanId: plan.id,
        actorId: client.id,
        roleCode: "CLIENT",
        responsibility: "Pemberi Kerja / Pemilik Proyek",
        contribution: "Arahan konsep, persetujuan luaran, dan pembiayaan proyek",
        status: "ACCEPTED",
      },
      {
        collaborationPlanId: plan.id,
        actorId: provider.id,
        roleCode: "PROVIDER",
        responsibility: `Pelaksana Proyek (${provider.sector})`,
        contribution: "Eksekusi pekerjaan dan penyerahan luaran sesuai lingkup tawaran",
        status: "ACCEPTED",
      },
    ],
  });

  // 2. Ruang kerja kolaborasi aktif
  const collaboration = await tx.collaboration.create({
    data: {
      collaborationPlanId: plan.id,
      title,
      description: objective,
      status: "ACTIVE",
      startedAt: now,
      targetEndAt: hasExactDate ? sessionDate : null,
    },
  });

  await tx.collaborationParticipant.createMany({
    data: [
      {
        collaborationId: collaboration.id,
        actorId: client.id,
        roleCode: "CLIENT",
        status: "ACTIVE",
        signedAt: now,
      },
      {
        collaborationId: collaboration.id,
        actorId: provider.id,
        roleCode: "PROVIDER",
        status: "ACTIVE",
        signedAt: now,
      },
    ],
  });

  await tx.task.createMany({
    data: [
      {
        collaborationId: collaboration.id,
        title: "Penyelarasan Brief & Kebutuhan Teknis",
        description: `Kunci detail konsep, referensi visual, dan kebutuhan teknis untuk "${title}".`,
        priority: "HIGH",
        status: "TODO",
        assignedActorId: client.id,
      },
      {
        collaborationId: collaboration.id,
        title: "Eksekusi Pekerjaan Sesuai Lingkup",
        description: `Pelaksanaan pekerjaan: ${scope}. Jadwal: ${scheduleLabel}.`,
        priority: "HIGH",
        status: "TODO",
        assignedActorId: provider.id,
        dueDate: hasExactDate ? sessionDate : null,
      },
      {
        collaborationId: collaboration.id,
        title: "Serah Terima Luaran via Messenger",
        description: "Kirim tautan berkas master melalui fitur Serah Terima Hasil Proyek di Messenger RAMU.",
        priority: "MEDIUM",
        status: "TODO",
        assignedActorId: provider.id,
      },
      {
        collaborationId: collaboration.id,
        title: "Review & Persetujuan Hasil Akhir",
        description: "Tinjau berkas yang diserahkan lalu setujui atau minta revisi melalui Messenger RAMU.",
        priority: "MEDIUM",
        status: "TODO",
        assignedActorId: client.id,
      },
    ],
  });

  await tx.milestone.createMany({
    data: [
      {
        collaborationId: collaboration.id,
        title: "Tawaran Resmi Disetujui",
        description: "Kedua pihak menyepakati lingkup, jadwal, dan nilai proyek.",
        status: "ACHIEVED",
      },
      {
        collaborationId: collaboration.id,
        title: "Pekerjaan Dieksekusi",
        description: `Pelaksanaan sesuai jadwal: ${scheduleLabel}.`,
        status: "IN_PROGRESS",
        targetDate: hasExactDate ? sessionDate : null,
      },
      {
        collaborationId: collaboration.id,
        title: "Luaran Diserahkan & Disetujui",
        description: "Berkas master diterima dan disetujui pemberi kerja.",
        status: "PENDING",
      },
    ],
  });

  await tx.decision.create({
    data: {
      collaborationId: collaboration.id,
      title: "Persetujuan Tawaran Proyek Resmi",
      decision: `${recipient.name} menyetujui tawaran "${title}" dari ${sender.name} senilai ${budget}.`,
      reason: "Kesepakatan dibuat melalui Tawaran Resmi di Messenger RAMU.",
      agreedByActors: [sender.id, recipient.id] as unknown as Prisma.InputJsonValue,
    },
  });

  // 3. SPK resmi (BookingRequest berstatus ACCEPTED) agar tampil di /dashboard/bookings
  const booking = await tx.bookingRequest.create({
    data: {
      requesterId: client.id,
      targetId: provider.id,
      status: "ACCEPTED",
      startDate: sessionDate,
      budget,
      details: {
        source: "MESSENGER_OFFER",
        offerMessageId,
        collaborationId: collaboration.id,
        projectTitle: title,
        scope,
        notes,
        scheduleLabel,
        projectStatus: "ACTIVE",
        agreedTerms: {
          clientAgreedAt: now.toISOString(),
          providerAgreedAt: now.toISOString(),
        },
      } as Prisma.InputJsonValue,
    },
  });

  return { collaborationId: collaboration.id, bookingId: booking.id, planId: plan.id };
}

/**
 * Serah terima disetujui -> tutup ruang kolaborasi & catat luaran.
 */
export async function completeCollaborationFromDelivery(
  tx: Tx,
  {
    collaborationId,
    deliveryMessageId,
    approverId,
    providerId,
    meta,
  }: {
    collaborationId: string;
    deliveryMessageId: string;
    approverId: string;
    providerId: string;
    meta: DeliveryMetadata;
  }
): Promise<{ completed: boolean }> {
  const collaboration = await tx.collaboration.findUnique({
    where: { id: collaborationId },
    select: { id: true, status: true, title: true, participants: { select: { actorId: true } } },
  });

  if (!collaboration) return { completed: false };

  const isMember = collaboration.participants.some((p) => p.actorId === approverId);
  if (!isMember) {
    throw new MessengerFlowError("Anda bukan anggota ruang kolaborasi yang terkait dengan serah terima ini.");
  }

  if (collaboration.status === "COMPLETED" || collaboration.status === "CANCELLED") {
    return { completed: false };
  }

  const now = new Date();

  await tx.collaboration.update({
    where: { id: collaborationId },
    data: { status: "COMPLETED", completedAt: now },
  });

  await tx.task.updateMany({
    where: { collaborationId, status: { notIn: ["DONE", "CANCELLED"] } },
    data: { status: "DONE", completedAt: now },
  });

  await tx.milestone.updateMany({
    where: { collaborationId, status: { notIn: ["ACHIEVED", "MISSED"] } },
    data: { status: "ACHIEVED" },
  });

  await tx.outcome.create({
    data: {
      collaborationId,
      title: meta.title || `Luaran ${collaboration.title}`,
      description: meta.deliverableNotes || "Berkas master diserahkan dan disetujui melalui Messenger RAMU.",
      outcomeType: "CREATIVE_ASSET",
      metrics: {
        storageUrl: meta.storageUrl || null,
        deliveryMessageId,
        deliveredBy: providerId,
        approvedBy: approverId,
        approvedAt: now.toISOString(),
      } as Prisma.InputJsonValue,
    },
  });

  await tx.decision.create({
    data: {
      collaborationId,
      title: "Serah Terima Hasil Proyek Disetujui",
      decision: `Luaran "${meta.title || collaboration.title}" diterima. Proyek dinyatakan selesai.`,
      reason: "Pemberi kerja menyetujui berkas master melalui Messenger RAMU.",
      agreedByActors: [approverId, providerId] as unknown as Prisma.InputJsonValue,
    },
  });

  await syncLinkedBookingDetails(tx, collaborationId, {
    projectStatus: "COMPLETED",
    completedAt: now.toISOString(),
    deliveryMessageId,
  });

  return { completed: true };
}

/**
 * Revisi diminta -> catat keputusan & buat tugas revisi untuk pelaksana.
 */
export async function recordDeliveryRevision(
  tx: Tx,
  {
    collaborationId,
    approverId,
    providerId,
    feedbackNotes,
    meta,
  }: {
    collaborationId: string;
    approverId: string;
    providerId: string;
    feedbackNotes?: string;
    meta: DeliveryMetadata;
  }
): Promise<void> {
  const collaboration = await tx.collaboration.findUnique({
    where: { id: collaborationId },
    select: { id: true, status: true },
  });
  if (!collaboration || collaboration.status === "COMPLETED" || collaboration.status === "CANCELLED") return;

  const feedback = (feedbackNotes || "").trim() || "Perlu penyesuaian detail";

  await tx.task.create({
    data: {
      collaborationId,
      title: `Revisi: ${meta.title || "Hasil Proyek"}`,
      description: `Catatan revisi dari pemberi kerja: ${feedback}`,
      priority: "HIGH",
      status: "TODO",
      assignedActorId: providerId,
    },
  });

  await tx.decision.create({
    data: {
      collaborationId,
      title: "Permintaan Revisi Hasil Proyek",
      decision: `Revisi diminta untuk "${meta.title || "Hasil Proyek"}".`,
      reason: feedback,
      agreedByActors: [approverId] as unknown as Prisma.InputJsonValue,
    },
  });
}

async function syncLinkedBookingDetails(
  tx: Tx,
  collaborationId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const booking = await tx.bookingRequest.findFirst({
    where: { details: { path: ["collaborationId"], equals: collaborationId } },
    select: { id: true, details: true },
  });
  if (!booking) return;

  const current =
    booking.details && typeof booking.details === "object" && !Array.isArray(booking.details)
      ? (booking.details as Record<string, unknown>)
      : {};

  await tx.bookingRequest.update({
    where: { id: booking.id },
    data: { details: { ...current, ...patch } as Prisma.InputJsonValue },
  });
}
