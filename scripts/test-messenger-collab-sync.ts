/**
 * Verifikasi end-to-end sinkronisasi Messenger <-> Kolaborasi <-> SPK.
 * Seluruh data uji dihapus kembali di akhir (blok finally).
 *
 * Jalankan: npx tsx scripts/test-messenger-collab-sync.ts
 */
import { prisma } from "../src/infrastructure/database/prisma";
import {
  sendMessage,
  respondToProjectOffer,
  sendProjectDelivery,
  respondToProjectDelivery,
} from "../src/application/messageService";

let failures = 0;
function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}`, detail ?? "");
  }
}

async function readMeta(messageId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ metadata: any }>>(
    `SELECT metadata FROM direct_messages WHERE id = $1::uuid`,
    messageId
  );
  const raw = rows[0]?.metadata;
  return typeof raw === "string" ? JSON.parse(raw) : raw || {};
}

async function main() {
  const startedAt = new Date();
  const actors = await prisma.actor.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, name: true, sector: true, actorType: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const brand = actors.find((a) => String(a.actorType) === "BRAND" || a.sector.toLowerCase().includes("brand"));
  const creator = actors.find((a) => a.id !== brand?.id && String(a.actorType) !== "BRAND");
  if (!brand || !creator) throw new Error("Butuh minimal 1 brand dan 1 kreator untuk pengujian.");

  console.log(`Pengirim tawaran (kreator): ${creator.name}`);
  console.log(`Penerima tawaran (brand)  : ${brand.name}\n`);

  let planId: string | null = null;
  let bookingId: string | null = null;

  try {
    // 1. Kreator mengirim tawaran ke brand
    console.log("1. Kirim tawaran");
    const offer = await sendMessage({
      senderId: creator.id,
      recipientId: brand.id,
      content: "[TAWARAN PROYEK RESMI] UJI SINKRONISASI (Rp 1.500.000)",
      messageType: "OFFER",
      skipNotification: true,
      metadata: {
        title: "UJI SINKRONISASI Lookbook",
        budget: "Rp 1.500.000",
        sessionDate: "2026-11-20",
        outputDetails: "10 foto editorial high-res",
        notes: "Data uji otomatis",
        offerStatus: "PENDING",
      },
    });
    check("Tawaran tersimpan", offer.success && Boolean(offer.message?.id));
    const offerId = offer.message!.id;

    // 2. Pihak yang tidak berhak tidak boleh merespons
    console.log("2. Validasi hak akses");
    const forbidden = await respondToProjectOffer({ messageId: offerId, actorId: creator.id, responseStatus: "ACCEPTED" });
    check("Pengirim tidak bisa menerima tawarannya sendiri", !forbidden.success, forbidden);

    // 3. Brand menerima tawaran
    console.log("3. Terima tawaran");
    const accepted = await respondToProjectOffer({ messageId: offerId, actorId: brand.id, responseStatus: "ACCEPTED" });
    check("Respons sukses", accepted.success, accepted.error);
    check("collaborationId dikembalikan", Boolean(accepted.collaborationId));
    check("bookingId dikembalikan", Boolean(accepted.bookingId));
    bookingId = accepted.bookingId || null;

    const offerMeta = await readMeta(offerId);
    check("Metadata tawaran = ACCEPTED", offerMeta.offerStatus === "ACCEPTED");
    check("Metadata menyimpan collaborationId", offerMeta.collaborationId === accepted.collaborationId);

    const collab = await prisma.collaboration.findUnique({
      where: { id: accepted.collaborationId! },
      include: { participants: true, tasks: true, milestones: true, decisions: true, plan: { include: { roles: true } } },
    });
    planId = collab?.collaborationPlanId || null;
    check("Collaboration ACTIVE dibuat", collab?.status === "ACTIVE");
    check("Plan APPROVED", collab?.plan.status === "APPROVED");
    check("2 peserta aktif", collab?.participants.length === 2);
    check("2 peran plan", collab?.plan.roles.length === 2);
    check("4 tugas awal", collab?.tasks.length === 4);
    check("3 milestone", collab?.milestones.length === 3);
    check("Keputusan persetujuan tercatat", (collab?.decisions.length || 0) >= 1);

    const booking = await prisma.bookingRequest.findUnique({ where: { id: accepted.bookingId! } });
    const bookingDetails = (booking?.details || {}) as Record<string, any>;
    check("SPK (BookingRequest) ACCEPTED", booking?.status === "ACCEPTED");
    check("Brand sebagai pemberi kerja (requester)", booking?.requesterId === brand.id);
    check("Kreator sebagai pelaksana (target)", booking?.targetId === creator.id);
    check("SPK tertaut ke collaborationId", bookingDetails.collaborationId === accepted.collaborationId);

    // 4. Respons ganda harus ditolak (idempoten)
    console.log("4. Cegah respons ganda");
    const again = await respondToProjectOffer({ messageId: offerId, actorId: brand.id, responseStatus: "ACCEPTED" });
    check("Respons kedua ditolak", !again.success, again);
    const collabCount = await prisma.collaborationParticipant.count({
      where: { actorId: brand.id, collaboration: { title: "UJI SINKRONISASI Lookbook" } },
    });
    check("Tidak ada kolaborasi ganda", collabCount === 1, collabCount);

    // 5. Kreator menyerahkan hasil
    console.log("5. Serah terima hasil");
    const delivery = await sendProjectDelivery({
      senderId: creator.id,
      recipientId: brand.id,
      title: "UJI SINKRONISASI Final Files",
      storageUrl: "https://drive.example.com/uji",
    });
    check("Serah terima tersimpan", delivery.success);
    const deliveryMeta = await readMeta(delivery.messageId!);
    check("Serah terima tertaut ke kolaborasi", deliveryMeta.collaborationId === accepted.collaborationId, deliveryMeta.collaborationId);

    // 6. Minta revisi -> tugas revisi baru
    console.log("6. Minta revisi");
    const revision = await respondToProjectDelivery({
      messageId: delivery.messageId!,
      actorId: brand.id,
      responseStatus: "REVISION_REQUESTED",
      feedbackNotes: "Perbaiki color grading",
    });
    check("Revisi sukses", revision.success, revision.error);
    const revTask = await prisma.task.findFirst({
      where: { collaborationId: accepted.collaborationId!, title: { startsWith: "Revisi:" } },
    });
    check("Tugas revisi dibuat untuk pelaksana", revTask?.assignedActorId === creator.id);

    // 7. Serah terima kedua lalu disetujui -> kolaborasi COMPLETED
    console.log("7. Setujui serah terima final");
    const delivery2 = await sendProjectDelivery({
      senderId: creator.id,
      recipientId: brand.id,
      title: "UJI SINKRONISASI Final Files v2",
      storageUrl: "https://drive.example.com/uji-v2",
    });
    const approved = await respondToProjectDelivery({
      messageId: delivery2.messageId!,
      actorId: brand.id,
      responseStatus: "ACCEPTED",
    });
    check("Persetujuan sukses", approved.success, approved.error);

    const finalCollab = await prisma.collaboration.findUnique({
      where: { id: accepted.collaborationId! },
      include: { tasks: true, milestones: true, outcomes: true },
    });
    check("Collaboration COMPLETED", finalCollab?.status === "COMPLETED");
    check("completedAt terisi", Boolean(finalCollab?.completedAt));
    check("Semua tugas DONE", finalCollab?.tasks.every((t) => t.status === "DONE") === true);
    check("Semua milestone ACHIEVED", finalCollab?.milestones.every((m) => m.status === "ACHIEVED") === true);
    check("Outcome luaran tercatat", (finalCollab?.outcomes.length || 0) === 1);

    const finalBooking = await prisma.bookingRequest.findUnique({ where: { id: accepted.bookingId! } });
    check("SPK projectStatus = COMPLETED", ((finalBooking?.details || {}) as any).projectStatus === "COMPLETED");

    const notifRows = await prisma.$queryRawUnsafe<Array<{ title: string }>>(
      `SELECT title FROM notifications WHERE created_at >= $1 AND actor_id = $2::uuid`,
      startedAt,
      creator.id
    );
    const titles = notifRows.map((n) => n.title);
    check("Notifikasi 'Tawaran Proyek Disetujui' tersimpan", titles.includes("Tawaran Proyek Disetujui"), titles);
    check("Notifikasi 'Hasil Proyek Disetujui' tersimpan", titles.includes("Hasil Proyek Disetujui"), titles);
  } finally {
    console.log("\nMembersihkan data uji...");
    if (planId) await prisma.collaborationPlan.delete({ where: { id: planId } }).catch(() => null);
    if (bookingId) await prisma.bookingRequest.delete({ where: { id: bookingId } }).catch(() => null);
    await prisma.$executeRawUnsafe(
      `DELETE FROM direct_messages
       WHERE created_at >= $1
         AND ((sender_actor_id = $2::uuid AND recipient_actor_id = $3::uuid)
           OR (sender_actor_id = $3::uuid AND recipient_actor_id = $2::uuid))`,
      startedAt,
      creator.id,
      brand.id
    );
    await prisma.$executeRawUnsafe(
      `DELETE FROM notifications WHERE created_at >= $1 AND actor_id IN ($2::uuid, $3::uuid)`,
      startedAt,
      creator.id,
      brand.id
    );
    await prisma.$disconnect();
  }

  console.log(failures === 0 ? "\nSEMUA PENGUJIAN LULUS" : `\n${failures} PENGUJIAN GAGAL`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
