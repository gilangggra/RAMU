import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { MessengerClient } from "@/components/messages/MessengerClient";
import { getConversations, getMessages } from "@/application/messageService";
import { ShieldCheck } from "lucide-react";

interface MessagesPageProps {
  searchParams: Promise<{ with?: string }>;
}

export const metadata = {
  title: "Pesan & Negosiasi Proyek | RAMU",
  description: "Ruang perpesanan in-app resmi RAMU untuk negosiasi brief, tawaran proyek, dan dokumentasi kesepakatan kolaborasi resmi.",
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
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-stone-200/70">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Pesan &amp; Tawaran Proyek
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Ruang negosiasi langsung, penawaran proyek resmi, dan serah terima hasil kolaborasi terverifikasi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/80 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Kolaborasi Resmi Aktif</span>
            </span>
          </div>
        </div>

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
