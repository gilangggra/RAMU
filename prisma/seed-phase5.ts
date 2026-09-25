import {
  PrismaClient,
  OutcomeType,
  CollaborationStatus,
} from "@prisma/client";
import { generateAndSaveOpportunities } from "../src/application/opportunityService";
import { initiateCollaborationFromOpportunity } from "../src/application/collaborationService";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan Seeding Data Luaran & Evaluasi (Phase 5)...");

  const actors = await prisma.actor.findMany({
    where: { status: "ACTIVE" },
    include: { assets: true, goals: true },
  });

  if (actors.length < 2) {
    console.log("⚠️ Kurang dari 2 aktor aktif di database. Jalankan 'npm run db:seed' terlebih dahulu.");
    return;
  }

  let opps = await prisma.opportunity.findMany({
    include: { participants: true, pattern: true },
  });

  if (opps.length === 0) {
    console.log("⚙️ Menjalankan 12-tahap engine untuk meramu kandidat peluang dari aktor...");
    const engineResult = await generateAndSaveOpportunities();
    console.log(`✓ Berhasil meramu ${engineResult.count} peluang dari engine.`);
    opps = await prisma.opportunity.findMany({
      include: { participants: true, pattern: true },
    });
  }

  if (opps.length === 0) {
    console.log("❌ Tidak ada peluang yang dapat dihasilkan.");
    return;
  }

  // 3. Cari atau inisiasi kolaborasi pertama
  let collabs = await prisma.collaboration.findMany({
    include: {
      participants: { include: { actor: true } },
      outcomes: true,
      feedbacks: true,
      plan: { include: { opportunity: true } },
    },
  });

  let targetCollab = collabs[0];

  if (!targetCollab) {
    const chosenOpp = opps[0];
    const initiatorId = chosenOpp.participants[0]?.actorId || actors[0].id;
    console.log(`🤝 Menginisiasi ruang kolaborasi dari peluang: "${chosenOpp.title}"`);
    const initRes = await initiateCollaborationFromOpportunity(chosenOpp.id, initiatorId);

    targetCollab = (await prisma.collaboration.findUnique({
      where: { id: initRes.collaborationId },
      include: {
        participants: { include: { actor: true } },
        outcomes: true,
        feedbacks: true,
        plan: { include: { opportunity: true } },
      },
    }))!;
  }

  console.log(`✓ Menggunakan kolaborasi: "${targetCollab.title}" (${targetCollab.id})`);

  // 4. Tambah Outcome Nyata
  if (targetCollab.outcomes.length === 0) {
    const outcome1 = await prisma.outcome.create({
      data: {
        collaborationId: targetCollab.id,
        title: "Peluncuran Koleksi Kapsul Editorial Ready-to-Wear",
        description:
          "Selesai diproduksi dan dirilis pada showcase kolaboratif di Jakarta. Perpaduan rancangan busana desainer dengan styling aksesori modern dan tata visual studio berstandar internasional.",
        outcomeType: OutcomeType.PRODUCT,
        metrics: {
          unitsProduced: 50,
          revenueAmount: "Rp 18.500.000",
          audienceReached: "1.400 pengunjung pameran & peminat daring",
          evidenceUrl: "https://instagram.com/p/demo-koleksi-kapsul",
          notes: "Tingkat penyerapan pasar mencapai 100% dalam 2 pekan peluncuran perdana.",
        },
      },
    });

    const outcome2 = await prisma.outcome.create({
      data: {
        collaborationId: targetCollab.id,
        title: "Katalog Visual Komersial & Kampanye Narasi Budaya Bersama",
        description:
          "Dokumentasi fotografi produk di studio profesional untuk materi promosi bersama, e-commerce, dan siaran pers media gaya hidup.",
        outcomeType: OutcomeType.CAMPAIGN,
        metrics: {
          unitsProduced: 24,
          revenueAmount: "Rp 3.500.000",
          audienceReached: "4.800 impresi media sosial gabungan",
          evidenceUrl: "https://katalog.ramu.id/heritage-capsule-2026",
          notes: "Meningkatkan eksposur merek bersama ke segmen pembeli muda perkotaan.",
        },
      },
    });

    console.log(`✓ Berhasil mencatat 2 luaran nyata: "${outcome1.title}" & "${outcome2.title}"`);
  }

  // 5. Tambah Feedbacks dari Partisipan
  if (targetCollab.feedbacks.length === 0 && targetCollab.participants.length > 0) {
    for (let i = 0; i < targetCollab.participants.length; i++) {
      const p = targetCollab.participants[i];
      await prisma.feedback.create({
        data: {
          collaborationId: targetCollab.id,
          opportunityId: targetCollab.plan?.opportunityId || null,
          actorId: p.actorId,
          relevanceScore: 5,
          feasibilityScore: i === 0 ? 5 : 4,
          noveltyScore: 5,
          usefulnessScore: 5,
          comments:
            i === 0
              ? "Peluang yang diramu oleh engine sangat membuka cakrawala baru. Sinergi antara rancangan busana kami dengan tim visual dan fotografi studio terbukti melipatgandakan nilai jual dan prestise koleksi."
              : "Kerja sama berjalan sangat teratur berkat kejelasan pembagian kontribusi dan batasan kapasitas sejak awal di ruang kerja kolaborasi.",
        },
      });
      console.log(`✓ Feedback dicatat dari aktor: ${p.actor.name}`);
    }
  }

  // 6. Update Status Kolaborasi menjadi COMPLETED
  await prisma.collaboration.update({
    where: { id: targetCollab.id },
    data: {
      status: CollaborationStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
  console.log(`✓ Kolaborasi resmi berstatus COMPLETED.`);

  console.log("\n✅ Seeding Phase 5 selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
