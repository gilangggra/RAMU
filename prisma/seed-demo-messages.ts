import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo direct messages...");

  const actors = await prisma.actor.findMany({ select: { id: true, name: true } });
  const nala = actors.find((a) => a.name.includes("Nala"));
  const model = actors.find((a) => a.name.includes("Go Young Jung") || a.name.includes("Cinta Kirana"));
  const photographer = actors.find((a) => a.name.includes("Lensa Kreatif") || a.name.includes("Studio Imaji"));

  if (!nala || !model) {
    console.log("Required actors not found for demo seed.");
    return;
  }

  // Conversation 1: Nala The Label & Model (Go Young Jung)
  await prisma.$executeRawUnsafe(`
    INSERT INTO direct_messages (sender_actor_id, recipient_actor_id, content, message_type, metadata, is_read, created_at)
    VALUES 
    ($1::uuid, $2::uuid, 'Halo Go Young Jung! Kami dari tim Nala The Label sangat menyukai portofolio editorial Anda di direktori RAMU.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '3 hours'),
    ($2::uuid, $1::uuid, 'Halo Nala The Label! Terima kasih banyak. Konsep busana linen koleksi terbaru kalian juga terlihat sangat segar dan elegan.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '2 hours 45 minutes'),
    ($1::uuid, $2::uuid, 'Kami berencana pemotretan katalog lookbook 15 look untuk rilis Musim Gugur 2026. Apakah Anda tersedia di hari Sabtu, 24 Oktober 2026?', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '2 hours 10 minutes'),
    ($2::uuid, $1::uuid, 'Tanggal 24 Oktober saya masih tersedia untuk full-day session. Untuk paket katalog 15 look, standar saya sudah termasuk fitting 1 jam sebelumnya.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '1 hour 30 minutes'),
    ($1::uuid, $2::uuid, '📑 TAWARAN PROYEK RESMI: Pemotretan Lookbook Koleksi Musim Gugur (Rp 2.000.000)', 'OFFER', $3::jsonb, false, NOW() - INTERVAL '30 minutes')
    ON CONFLICT DO NOTHING;
  `, nala.id, model.id, JSON.stringify({
    title: "Pemotretan Lookbook Koleksi Musim Gugur 2026",
    budget: "Rp 2.000.000",
    sessionDate: "2026-10-24",
    outputDetails: "15 Outfit Looks • Hak Cipta Komersial Digital 1 Tahun",
    notes: "Lokasi: Studio Imaji Jakarta Selatan. Disediakan MUA dan konsumsi kru.",
    offerStatus: "PENDING",
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }));

  // Conversation 2: Nala & Photographer if available
  if (photographer) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO direct_messages (sender_actor_id, recipient_actor_id, content, message_type, metadata, is_read, created_at)
      VALUES 
      ($1::uuid, $2::uuid, 'Halo tim ${photographer.name}, apakah studio dan lighting package tersedia untuk sesi 8 jam akhir bulan ini?', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '1 day'),
      ($2::uuid, $1::uuid, 'Halo Nala! Ya, cyclorama wall studio kami siap dengan continuous lighting Aputure 600d. Silakan kirimkan rincian brief teknisnya.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '20 hours')
      ON CONFLICT DO NOTHING;
    `, nala.id, photographer.id);
  }

  console.log("Demo direct messages successfully seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
