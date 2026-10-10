const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const actors = await prisma.actor.findMany({
    select: {
      id: true,
      name: true,
      sector: true,
      actorType: true,
      location: true,
      assets: {
        select: {
          id: true,
          name: true,
          category: true,
          subtype: true,
        }
      }
    }
  });

  for (const a of actors) {
    console.log('--------------------------------------------------');
    console.log(`ACTOR: ${a.name} | Sector: ${a.sector} | Type: ${a.actorType}`);
    console.log(`Total Assets: ${a.assets.length}`);
    const ports = a.assets.filter(x => x.category === 'PORTFOLIO_WORK');
    const others = a.assets.filter(x => x.category !== 'PORTFOLIO_WORK');
    console.log(`- Portfolios (${ports.length}):`);
    ports.forEach(p => console.log(`   [PORTFOLIO] ${p.name}`));
    console.log(`- Core Specs / Packages / Assets (${others.length}):`);
    others.forEach(o => {
      console.log(`   [${o.category}] ID:${o.id} (${o.subtype}) ${o.name}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());


