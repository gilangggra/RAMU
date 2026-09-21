const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌟 Menambahkan data ulasan & reputasi kolaborasi...");

  const batik = await prisma.actor.findFirst({ where: { name: "Sanggar Batik Sekar Wangi" } });
  const lensa = await prisma.actor.findFirst({ where: { name: "Lensa Kreatif Studio" } });
  const nadia = await prisma.actor.findFirst({ where: { name: "Nadia Larasati" } });
  const aruna = await prisma.actor.findFirst({ where: { name: "Aruna Visual & Styling Studio" } });

  // Add reviews to Nadia Larasati
  if (nadia && lensa) {
    await prisma.feedback.create({
      data: {
        actorId: nadia.id,
        relevanceScore: 5,
        feasibilityScore: 5,
        noveltyScore: 5,
        usefulnessScore: 5,
        comments: "Nadia sangat profesional, memahami konsep lookbook kontemporer dengan cepat, dan transisi pose sangat luwes. Menghabiskan 4 jam sesi pemotretan tanpa kendala. Sangat direkomendasikan untuk lookbook brand premium!",
      }
    });
  }

  // Add review from Batik to Lensa Kreatif Studio
  if (lensa && batik) {
    await prisma.feedback.create({
      data: {
        actorId: lensa.id,
        relevanceScore: 5,
        feasibilityScore: 5,
        noveltyScore: 4,
        usefulnessScore: 5,
        comments: "Pencahayaan cyclorama dan kalibrasi warna kain batik Parang kami sangat akurat! Studio luas, kru nyaman di lounge ber-AC, dan hasil retouching selesai tepat waktu 5 hari.",
      }
    });
  }

  // Add review from Nadia to Aruna Styling
  if (aruna && nadia) {
    await prisma.feedback.create({
      data: {
        actorId: aruna.id,
        relevanceScore: 5,
        feasibilityScore: 4,
        noveltyScore: 5,
        usefulnessScore: 5,
        comments: "Arahan gaya dari Aruna Visual sangat inspiratif. Padu padan kain wastra dengan siluet modern terasa sangat natural saat dipakai di set studio.",
      }
    });
  }

  console.log("✓ Sukses menambahkan data ulasan ekosistem!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
