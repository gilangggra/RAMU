const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const portfolios = await prisma.asset.findMany({
    where: { category: "PORTFOLIO_WORK" },
    select: { id: true, name: true, category: true, subtype: true, actor: { select: { name: true } } }
  });
  console.log("Daftar PORTFOLIO_WORK saat ini:", JSON.stringify(portfolios, null, 2));

  // Check if any portfolio has camera/gear name
  for (const p of portfolios) {
    if (p.name.toLowerCase().includes("kamera") || p.name.toLowerCase().includes("sony alpha") || p.name.toLowerCase().includes("lensa")) {
      console.log(`Mengubah kategori ${p.name} menjadi EQUIPMENT...`);
      await prisma.asset.update({
        where: { id: p.id },
        data: { category: "EQUIPMENT" }
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
