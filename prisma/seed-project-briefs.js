const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Menjalankan seed untuk Open Calls (Project Briefs)...");

  // 1. Cari atau Buat Akun Profil Utama (Admin/Inisiator)
  let adminProfile = await prisma.profile.findFirst({
    where: { email: "initiator@ramu.id" },
  });

  if (!adminProfile) {
    adminProfile = await prisma.profile.create({
      data: {
        email: "initiator@ramu.id",
        displayName: "Inisiator Proyek",
      },
    });
  }

  // 2. Buat Aktor Brand "Gaya Nusantara"
  let brandActor = await prisma.actor.findFirst({
    where: { name: "Gaya Nusantara" },
  });

  if (!brandActor) {
    brandActor = await prisma.actor.create({
      data: {
        name: "Gaya Nusantara",
        actorType: "MSME",
        sector: "Fashion & Pakaian",
        description: "Merek fesyen lokal yang mengangkat kearifan tenun nusantara ke dalam balutan desain kontemporer.",
        location: "Jakarta, Indonesia",
        contactEmail: "collab@gayanusantara.id",
        websiteUrl: "https://gayanusantara.id",
        status: "ACTIVE",
        ownerUserId: adminProfile.id,
      },
    });
  }

  // 3. Buat Aktor UMKM "Kopi Senja Roastery"
  let kopiActor = await prisma.actor.findFirst({
    where: { name: "Kopi Senja Roastery" },
  });

  if (!kopiActor) {
    kopiActor = await prisma.actor.create({
      data: {
        name: "Kopi Senja Roastery",
        actorType: "MSME",
        sector: "F&B / Kopi",
        description: "Roastery spesialis biji kopi single origin lokal dengan proses sangrai tradisional.",
        location: "Bandung, Indonesia",
        contactEmail: "hello@kopisenja.id",
        status: "ACTIVE",
        ownerUserId: adminProfile.id,
      },
    });
  }

  // 4. Buat Project Brief 1: "Katalog Ramadhan 2026"
  const ramadhanBrief = await prisma.projectBrief.create({
    data: {
      creatorActorId: brandActor.id,
      title: "Katalog Ramadhan 2026 - Gaya Nusantara",
      description: "Kami membutuhkan kolaborator kreatif untuk memproduksi visual kampanye Lebaran terbaru kami. Proyek ini akan menyoroti koleksi tenun eksklusif Ramadhan dengan nuansa elegan, hangat, dan kontemporer.",
      projectType: "Commercial Photoshoot",
      targetOutput: "Katalog E-commerce (30 SKU) & Video Reels (5 Video)",
      location: "Jakarta (On Location / Studio)",
      timeline: { start: "Minggu Ke-2 Bulan Depan", duration: "3 Hari Pengerjaan" },
      budget: { range: "Rp 15.000.000 - Rp 25.000.000", type: "PAID" },
      status: "OPEN",
      neededRoles: {
        create: [
          {
            roleLabel: "Fotografer Produk/Fesyen",
            assetCategory: "SKILL_TALENT",
            description: "Berpengalaman menangani photoshoot pakaian. Menguasai strobe lighting (flash).",
            maxCollaborators: 1,
            isFilled: false,
          },
          {
            roleLabel: "Studio Foto (Cyclorama)",
            assetCategory: "EQUIPMENT",
            description: "Studio dengan latar putih bersih (cyclorama) berukuran minimal 5x5 meter. Tersedia ruang ganti yang nyaman.",
            maxCollaborators: 1,
            isFilled: false,
          },
          {
            roleLabel: "Model Pria Utama",
            assetCategory: "EQUIPMENT",
            description: "Memiliki karakteristik wajah lokal/pan-asian. Tinggi minimal 175cm. Luwes bergerak di depan kamera.",
            maxCollaborators: 1,
            isFilled: false,
          },
        ]
      }
    },
  });

  console.log(`Berhasil membuat Open Call: ${ramadhanBrief.title}`);

  // 5. Buat Project Brief 2: "Rebranding Kemasan Kopi"
  const kopiBrief = await prisma.projectBrief.create({
    data: {
      creatorActorId: kopiActor.id,
      title: "Rebranding Identitas Visual & Kemasan Kopi Senja",
      description: "Sebagai roastery lokal yang sedang berkembang, kami ingin menyegarkan identitas visual kami. Kami butuh logo yang lebih modern namun tetap mempertahankan nilai tradisional, serta desain kemasan untuk 3 lini produk biji kopi kami.",
      projectType: "Branding & Packaging Design",
      targetOutput: "Brand Guideline & 3 Desain Pouch Kemasan Kopi",
      location: "Remote / Bebas",
      timeline: { start: "Fleksibel", duration: "1 Bulan Pengerjaan" },
      budget: { range: "Rp 8.000.000 - Rp 12.000.000", type: "PAID" },
      status: "OPEN",
      neededRoles: {
        create: [
          {
            roleLabel: "Brand Designer",
            assetCategory: "SKILL_TALENT",
            description: "Mampu merancang identitas visual yang solid. Memiliki portofolio desain kemasan F&B. Penguasaan ilustrasi adalah nilai plus.",
            maxCollaborators: 1,
            isFilled: false,
          }
        ]
      }
    },
  });

  console.log(`Berhasil membuat Open Call: ${kopiBrief.title}`);
  console.log("Seeding Open Calls Selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
