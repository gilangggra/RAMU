const { PrismaClient, AssetCategory, AssetRole, SourceType, ConfidenceLevel, AssetStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Menambahkan karya visual portofolio autentik ke /showcase...");

  const portfolios = [
    {
      actorName: "Atelier Test Studio",
      name: "Lookbook Wastra Nusantara — Parang Kontemporer",
      subtype: "Fotografi",
      description: "Sesi pemotretan lookbook editorial busana wastra dengan pencahayaan dramatis dan tekstur kain yang tajam.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Atelier Test Studio",
      name: "Editorial Campaign 'Monochrome Drapery'",
      subtype: "Fotografi",
      description: "Kampanye fashion editorial high-fashion yang menonjolkan siluet dan drapery kain sutra.",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Atelier Test Studio",
      name: "Catalog Komersial Busana Siap Pakai Urban",
      subtype: "Fotografi",
      description: "Foto katalog komersial dengan akurasi warna tinggi untuk materi promosi e-commerce dan billboard.",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Nadia Larasati",
      name: "Editorial Tearsheet — High Fashion Lookbook",
      subtype: "Fashion Styling",
      description: "Pose editorial dan ekspresi karakter model untuk publikasi majalah fashion edisi musim gugur.",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Nadia Larasati",
      name: "Heritage Jewelry & Metallic Accents Campaign",
      subtype: "Fotografi",
      description: "Macro beauty shot perhiasan perak tradisional Kotagede dengan aksen pencahayaan lembut.",
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Lensa Kreatif Studio",
      name: "Commercial Visual 'Kopi Senja Artisan'",
      subtype: "Video Komersial",
      description: "Key visual komersial minuman artisan dengan teknik splash photography dan high-speed sync.",
      imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Nala The Label",
      name: "Koleksi Runaway 'Gaya Tropis Kontemporer'",
      subtype: "Fashion Styling",
      description: "Rancangan busana siap pakai berpadu dengan motif etnik modern karya desainer lokal.",
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
    },
    {
      actorName: "Kreatif Jiwa Studio",
      name: "Brand Identity & Packaging Tropis Botani",
      subtype: "Desain Grafis",
      description: "Identitas visual merek, tipografi eksperimental, dan rancangan kemasan produk ramah lingkungan.",
      imageUrl: "https://images.unsplash.com/photo-1559564106-9b578c772058?auto=format&fit=crop&w=1000&q=80",
    }
  ];

  for (const item of portfolios) {
    const actor = await prisma.actor.findFirst({
      where: {
        OR: [
          { name: { contains: item.actorName, mode: "insensitive" } },
          { sector: { contains: item.actorName, mode: "insensitive" } }
        ]
      }
    });

    if (!actor) {
      console.log(`Aktor ${item.actorName} tidak ditemukan, skip.`);
      continue;
    }

    const existing = await prisma.asset.findFirst({
      where: {
        actorId: actor.id,
        category: AssetCategory.PORTFOLIO_WORK,
        name: item.name
      }
    });

    if (!existing) {
      await prisma.asset.create({
        data: {
          actorId: actor.id,
          category: AssetCategory.PORTFOLIO_WORK,
          subtype: item.subtype,
          name: item.name,
          description: item.description,
          roles: [AssetRole.OUTPUT, AssetRole.CREATIVE_ELEMENT],
          attributes: {
            image_url: item.imageUrl,
            portfolio_type: item.subtype,
          },
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE,
        }
      });
      console.log(`✓ Karya dibuat: "${item.name}" oleh ${actor.name}`);
    }
  }

  console.log("🎉 Selesai menambahkan karya visual murni ke /showcase!");
}

main()
  .catch((e) => {
    console.error("Error seeding authentic showcase:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
