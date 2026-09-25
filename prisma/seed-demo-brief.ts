import { PrismaClient, AssetCategory, AssetRole, AssetStatus, ProjectBriefStatus, InterestStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo project brief and creative assets...");

  const creator = await prisma.actor.findFirst({
    where: { name: { in: ["Batik bandung", "Studio Demo", "Sanggar Batik Sekar Wangi"] } },
  });

  if (!creator) {
    console.log("No creator actor found.");
    return;
  }

  const photographer = await prisma.actor.findFirst({
    where: { name: "Lensa Kreatif Studio" },
  });

  if (photographer) {
    const existingVideo = await prisma.asset.findFirst({
      where: { actorId: photographer.id, name: { contains: "Video" } },
    });
    if (!existingVideo) {
      await prisma.asset.create({
        data: {
          actorId: photographer.id,
          name: "Produksi Video Sinematik & Color Grading 4K",
          category: AssetCategory.SKILL_TALENT,
          subtype: "Videografi Sinematik",
          roles: [AssetRole.CAPABILITY],
          status: AssetStatus.ACTIVE,
          description: "Kamera bioskop 4K, lighting Aputure, stabilizer gimbal, & post-production suite DaVinci Resolve.",
          attributes: { unit: "paket produksi", capacity: 3 },
        },
      });
      console.log("✓ Added video production capability to Lensa Kreatif Studio");
    }
  }

  const existingBrief = await prisma.projectBrief.findFirst({
    where: { title: { contains: "Kampanye Editorial & Lookbook" } },
  });

  if (!existingBrief) {
    const brief = await prisma.projectBrief.create({
      data: {
        creatorActorId: creator.id,
        title: "Kampanye Editorial & Lookbook Koleksi Resor 2026",
        description:
          "Kami sedang mempersiapkan peluncuran koleksi kapsul busana Resor 2026 yang terinspirasi siluet modern dan material wastra kontemporer. Membutuhkan kolaborator profesional di bidang fotografi fashion editorial, penataan gaya (stylist), dan talenta model untuk memproduksi kampanye visual berkualitas majalah mode internasional.",
        projectType: "Fashion Editorial & Campaign Launch",
        targetOutput: "1 Video Fashion Film 60s, Katalog 20 Foto Editorial On-Model, dan Lookbook Digital High-Res",
        location: "Jakarta Selatan / Daylight Studio",
        timeline: {
          estimatedDuration: "3 Minggu",
          targetLaunch: "Musim Depan",
        },
        budget: {
          estimatedTotal: "Rp 20.000.000 - Model Kolaboratif / Bagi Hasil",
          notes: "Model kolaborasi setara dengan skema pembagian hasil dari penjualan awal serta hak guna portfolio bersama.",
        },
        status: ProjectBriefStatus.OPEN,
        neededRoles: {
          create: [
            {
              roleLabel: "Fotografer Editorial & Lighting Specialist",
              assetCategory: AssetCategory.SKILL_TALENT,
              description: "Sesi pemotretan lookbook on-model menggunakan teknik pencahayaan daylight dan strobe studio.",
              maxCollaborators: 1,
            },
            {
              roleLabel: "Fashion Stylist & Wardrobe Curator",
              assetCategory: AssetCategory.SKILL_TALENT,
              description: "Kurasi padu padan aksesori, styling busana di set, dan arahan visual tema kampanye.",
              maxCollaborators: 1,
            },
            {
              roleLabel: "Talenta Model On-Camera & Catwalk",
              assetCategory: AssetCategory.SKILL_TALENT,
              description: "Model profesional dengan karakter visual editorial untuk katalog busana dan fashion film.",
              maxCollaborators: 2,
            },
          ],
        },
      },
      include: {
        neededRoles: true,
      },
    });

    console.log("✓ Created demo Project Brief:", brief.id);

    if (photographer) {
      const photoRole = brief.neededRoles.find((r) => r.roleLabel.includes("Fotografer"));
      const photoAsset = await prisma.asset.findFirst({
        where: { actorId: photographer.id, category: AssetCategory.SKILL_TALENT },
      });

      if (photoRole && photoAsset) {
        await prisma.collaborationInterest.create({
          data: {
            briefId: brief.id,
            roleId: photoRole.id,
            actorId: photographer.id,
            message:
              "Halo! Kami dari Lensa Kreatif Studio sangat tertarik dengan konsep kampanye editorial koleksi resor ini. Kami memiliki akses ke daylight loft studio 120m² di Jakarta serta lensa prime portrait dan lighting Profoto yang siap dipakai untuk lookbook on-model.",
            proposedAssets: [photoAsset.id],
            status: InterestStatus.PENDING,
          },
        });
        console.log("✓ Created sample collaboration interest from Lensa Kreatif Studio");
      }
    }
  } else {
    console.log("Demo project brief already exists:", existingBrief.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
