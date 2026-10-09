import { prisma } from "../src/infrastructure/database/prisma";

async function seedAdminData() {
  console.log("Seeding baseline Admin Taxonomy and Role Blueprints...");

  // 1. Taxonomy Sectors
  const sectorsCount = await prisma.taxonomySector.count();
  if (sectorsCount === 0) {
    const defaultSectors = [
      "Sinematografi", "Fotografi Editorial", "Fotografi Komersial",
      "Desain Identitas Visual", "Animasi 3D", "Motion Graphic",
      "Sound Design", "Videografi Pernikahan", "Content Creator",
      "Ilustrasi Digital", "Fashion Styling", "Produksi Musik"
    ];
    for (const name of defaultSectors) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.taxonomySector.upsert({
        where: { slug },
        update: {},
        create: { name, slug, isActive: true }
      });
    }
    console.log("Seeded default taxonomy sectors.");
  }

  // 2. Aesthetic Tags
  const aestheticsCount = await prisma.aestheticTag.count();
  if (aestheticsCount === 0) {
    const defaultAesthetics = [
      "Minimalist", "Brutalist", "Retro 90s", "Cyberpunk", "Y2K",
      "Industrial", "Surrealism", "Filmic", "Dark Academia", "Cottagecore",
      "Solarpunk", "Bauhaus", "Art Deco", "Maximalist"
    ];
    for (const name of defaultAesthetics) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.aestheticTag.upsert({
        where: { slug },
        update: {},
        create: { name, slug, isActive: true }
      });
    }
    console.log("Seeded default aesthetic tags.");
  }

  // 3. Role Blueprints
  const blueprintsCount = await prisma.roleBlueprint.count();
  if (blueprintsCount === 0) {
    const defaultBlueprints = [
      {
        roleName: "Director of Photography",
        skillsArray: ["Pencahayaan sinematik", "Komposisi gambar", "Color grading", "Manajemen kru kamera"],
        recommendedTools: ["Kamera Sony FX9 / ARRI / RED", "Lens set prime", "Lighting kit LED"],
        rateJunior: "Rp 1,5–3 jt/hari",
        rateMid: "Rp 3–6 jt/hari",
        rateSenior: "Rp 7–15 jt/hari",
      },
      {
        roleName: "Art Director",
        skillsArray: ["Visual storytelling", "Manajemen set", "Mood board", "Brand identity"],
        recommendedTools: ["Adobe Suite", "Figma", "Pantone swatch kit"],
        rateJunior: "Rp 1–2,5 jt/hari",
        rateMid: "Rp 2,5–5 jt/hari",
        rateSenior: "Rp 5–12 jt/hari",
      },
      {
        roleName: "Motion Graphic Designer",
        skillsArray: ["After Effects", "Cinema 4D", "Type animation", "Sound sync"],
        recommendedTools: ["Workstation RTX GPU", "Wacom tablet"],
        rateJunior: "Rp 800rb–1,5 jt/hari",
        rateMid: "Rp 1,5–3,5 jt/hari",
        rateSenior: "Rp 4–8 jt/hari",
      },
      {
        roleName: "Sound Designer",
        skillsArray: ["Foley recording", "Mix & mastering", "Score composition", "Field recording"],
        recommendedTools: ["DAW (Pro Tools / Logic)", "Boom mic", "Interface audio"],
        rateJunior: "Rp 800rb–1,5 jt/hari",
        rateMid: "Rp 1,5–3 jt/hari",
        rateSenior: "Rp 3–7 jt/hari",
      },
    ];

    for (const bp of defaultBlueprints) {
      await prisma.roleBlueprint.upsert({
        where: { roleName: bp.roleName },
        update: {},
        create: bp,
      });
    }
    console.log("Seeded default role blueprints.");
  }

  // 4. Sample Verification Requests if empty (for demo / testing)
  const verifCount = await prisma.verificationRequest.count();
  if (verifCount === 0) {
    const sampleActors = await prisma.actor.findMany({ take: 2 });
    if (sampleActors.length > 0) {
      await prisma.verificationRequest.create({
        data: {
          actorId: sampleActors[0].id,
          status: "PENDING",
          gearProofUrls: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800"
          ],
          portfolioUrl: "https://instagram.com/creativestudio",
          notes: "Mengajukan lencana verifikasi profesional untuk gear kamera Sony FX3 & prime lenses.",
        }
      });
      console.log("Seeded sample verification request.");
    }
  }

  console.log("Admin baseline data check completed.");
}

seedAdminData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
