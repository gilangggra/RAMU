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
          category: AssetCategory.CAPABILITY,
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
    where: { title: { contains: "Iklan & Kampanye Visual Minuman" } },
  });

  if (!existingBrief) {
    const brief = await prisma.projectBrief.create({
      data: {
        creatorActorId: creator.id,
        title: "Iklan & Kampanye Visual Minuman Botanical Herbal Nusantara",
        description:
          "Kami sedang mengembangkan lini produk minuman ready-to-drink (RTD) botanical cold-pressed berbahan dasar rempah dan buah tropis lokal. Membutuhkan kolaborator kreatif profesional lintas disiplin untuk memproduksi seluruh materi peluncuran produk: video commercial cinematic, foto produk still-life dan lifestyle, serta desain label kemasan premium bernuansa kontemporer.",
        projectType: "Campaign & Branding Komersial",
        targetOutput: "1 Video Iklan 60s, Katalog 15 Foto Editorial Produk, dan Desain Identitas Kemasan Botol",
        location: "Bandung / Hybrid",
        timeline: {
          estimatedDuration: "4 Minggu",
          targetLaunch: "Bulan Depan",
        },
        budget: {
          estimatedTotal: "Rp 15.000.000 - Gotong Royong / Bagi Hasil",
          notes: "Model kolaborasi setara dengan skema pembagian hasil dari penjualan awal serta hak guna portfolio bersama.",
        },
        status: ProjectBriefStatus.OPEN,
        neededRoles: {
          create: [
            {
              roleLabel: "Videographer & Motion Director",
              assetCategory: AssetCategory.CAPABILITY,
              description: "Menggarap video komersial 60 detik bergaya cinematic dan motion storytelling.",
              maxCollaborators: 1,
            },
            {
              roleLabel: "Fotografer Produk & Editorial",
              assetCategory: AssetCategory.CAPABILITY,
              description: "Foto katalog botol still-life dengan teknik lighting studio dan staging gaya hidup.",
              maxCollaborators: 1,
            },
            {
              roleLabel: "Graphic Designer & Kemasan",
              assetCategory: AssetCategory.CAPABILITY,
              description: "Pengembangan label kemasan botol kaca dan digital branding assets untuk social media.",
              maxCollaborators: 1,
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
        where: { actorId: photographer.id, category: AssetCategory.CAPABILITY },
      });

      if (photoRole && photoAsset) {
        await prisma.collaborationInterest.create({
          data: {
            briefId: brief.id,
            roleId: photoRole.id,
            actorId: photographer.id,
            message:
              "Halo! Kami dari Lensa Kreatif Studio sangat antusias dengan konsep botanical drink ini. Kami memiliki studio lighting profesional khusus beverage splash photography dan kamera medium format untuk detail tetesan air dingin yang tajam.",
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
