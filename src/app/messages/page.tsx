import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { MessengerClient } from "@/components/messages/MessengerClient";
import { getConversations, getMessages } from "@/application/messageService";

interface MessagesPageProps {
  searchParams: Promise<{ with?: string }>;
}

export const metadata = {
  title: "Pesan & Negosiasi Proyek | RAMU",
  description: "Ruang perpesanan in-app resmi RAMU untuk negosiasi brief, tawaran proyek, dan proteksi transaksi berbasis escrow.",
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: { select: { avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const partnerIdFromUrl = params?.with;

  const conversations = await getConversations(actor.id);

  // Tentukan siapa partner aktif
  let activePartnerId = partnerIdFromUrl || null;

  // Jika tidak ada URL param tetapi ada percakapan sebelumnya, buka percakapan teratas secara default
  if (!activePartnerId && conversations.length > 0) {
    activePartnerId = conversations[0].partnerId;
  }

  let activePartnerData: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
    location: string | null;
    avatarUrl: string | null;
    phone: string | null;
  } | null = null;

  let initialMessages: any[] = [];

  if (activePartnerId) {
    const partner = await prisma.actor.findUnique({
      where: { id: activePartnerId },
      include: {
        owner: { select: { avatarUrl: true } },
      },
    });

    if (partner) {
      activePartnerData = {
        id: partner.id,
        name: partner.name,
        sector: partner.sector,
        actorType: partner.actorType,
        location: partner.location,
        avatarUrl: partner.owner?.avatarUrl || null,
        phone: partner.contactPhone,
      };

      initialMessages = await getMessages(actor.id, partner.id);
    }
  }

  return (
    <AppShell actor={actor} activeRoute="/messages">
      <div className="max-w-7xl mx-auto space-y-4 pb-12">
        <MessengerClient
          currentActor={{
            id: actor.id,
            name: actor.name,
            sector: actor.sector,
            actorType: actor.actorType,
          }}
          initialConversations={conversations}
          activePartner={activePartnerData}
          initialMessages={initialMessages}
        />
      </div>
    </AppShell>
  );
}
