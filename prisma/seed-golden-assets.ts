import {
  PrismaClient,
  AssetCategory,
  AssetRole,
  AssetStatus,
  GoalCategory,
  GoalStatus,
  NeedCategory,
  NeedStatus,
  SourceType,
  ConfidenceLevel,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menyemai Aset & Sasaran Golden Demo untuk 4 Aktor...");

  const actors = await prisma.actor.findMany({
    where: {
      name: {
        in: [
          "Sanggar Batik Sekar Wangi",
          "Atelier Kulit Mandiri",
          "Nusantara Silver & Gem",
          "Lensa Kreatif Studio",
        ],
      },
    },
  });

  const batik = actors.find((a) => a.name.includes("Batik"));
  const kulit = actors.find((a) => a.name.includes("Kulit"));
  const perak = actors.find((a) => a.name.includes("Silver"));
  const lensa = actors.find((a) => a.name.includes("Lensa"));

  if (!batik || !kulit) {
    console.log("Aktor belum lengkap, melewati seeding aset.");
    return;
  }

  const existingBatikAsset = await prisma.asset.findFirst({ where: { actorId: batik.id } });
  if (!existingBatikAsset) {
    await prisma.asset.create({
      data: {
        actorId: batik.id,
        category: AssetCategory.WARDROBE_PROP,
        subtype: "Batik Tulis",
        name: "Kain Batik Tulis Motif Parang & Kawung",
        description: "Batik tulis premium motif klasik Yogyakarta dengan pewarna alam",
        roles: [AssetRole.INPUT, AssetRole.COMPONENT, AssetRole.CREATIVE_ELEMENT],
        attributes: { capacity: 300, unit: "lembar/bulan" },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });

    await prisma.goal.create({
      data: {
        actorId: batik.id,
        category: GoalCategory.BRAND_AWARENESS,
        title: "Menjangkau pasar konsumen muda (Gen-Z & Millennial) via fashion kontemporer",
        priority: 5,
        status: GoalStatus.ACTIVE,
      },
    });

    console.log("✓ Aset & Goal Batik ditambahkan.");
  }

  const existingKulitAsset = await prisma.asset.findFirst({ where: { actorId: kulit.id } });
  if (!existingKulitAsset) {
    await prisma.asset.create({
      data: {
        actorId: kulit.id,
        category: AssetCategory.WARDROBE_PROP,
        subtype: "Kulit Sapi Nabati",
        name: "Kulit Nabati Premium (Vegetable Tanned Leather)",
        description: "Kulit sapi berkualitas grade A untuk tas dan aksesoris",
        roles: [AssetRole.COMPONENT, AssetRole.CREATIVE_ELEMENT],
        attributes: { capacity: 150, unit: "sqft/bulan" },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });

    await prisma.asset.create({
      data: {
        actorId: kulit.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Aksesoris & Leather Goods",
        name: "Keahlian Konstruksi Tas & Dompet Kulit Handmade",
        description: "Pengerjaan jahitan tangan (hand-stitched) presisi tinggi",
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { capacity: 50, unit: "unit/bulan" },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });

    await prisma.goal.create({
      data: {
        actorId: kulit.id,
        category: GoalCategory.COMMERCIAL_CAMPAIGN,
        title: "Mengembangkan lini tas etnik modern bernilai tambah tinggi",
        priority: 5,
        status: GoalStatus.ACTIVE,
      },
    });

    console.log("✓ Aset & Goal Kulit ditambahkan.");
  }

  if (perak) {
    const existingPerak = await prisma.asset.findFirst({ where: { actorId: perak.id } });
    if (!existingPerak) {
      await prisma.asset.create({
        data: {
          actorId: perak.id,
          category: AssetCategory.PORTFOLIO_WORK,
          subtype: "Aksesoris Perak",
          name: "Ornamen & Buckle Perak Bakar Tradisional Kotagede",
          description: "Detail gesper dan gantungan perak ukir untuk produk fashion",
          roles: [AssetRole.COMPONENT, AssetRole.CREATIVE_ELEMENT],
          attributes: { material: "Silver 925" },
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE,
        },
      });
      console.log("✓ Aset Perak ditambahkan.");
    }
  }

  if (lensa) {
    const existingLensa = await prisma.asset.findFirst({ where: { actorId: lensa.id } });
    if (!existingLensa) {
      await prisma.asset.create({
        data: {
          actorId: lensa.id,
          category: AssetCategory.SKILL_TALENT,
          subtype: "Fotografi Fashion",
          name: "Layanan Fotografi Komersial & Editorial Lookbook",
          description: "Tim fotografer dan pengarah gaya berpengalaman untuk brand fashion & editorial",
          roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
          attributes: { camera: "Medium Format", lighting: "Profoto" },
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE,
        },
      });
      console.log("✓ Aset Lensa ditambahkan.");
    }
  }

  console.log("✅ Golden demo assets & goals berhasil disemai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
