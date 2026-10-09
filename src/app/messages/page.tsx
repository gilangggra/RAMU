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

  // Cari rekan kolaborasi & pesanan aktif yang belum ada di daftar percakapan
  const existingPartnerIds = new Set(conversations.map((c) => c.partnerId));

  const [collabParticipants, bookingPartners] = await Promise.all([
    prisma.collaborationParticipant.findMany({
      where: {
        collaboration: {
          participants: { some: { actorId: actor.id } },
        },
        actorId: { not: actor.id },
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            sector: true,
            actorType: true,
            location: true,
            owner: { select: { avatarUrl: true } },
          },
        },
        collaboration: { select: { title: true } },
      },
      take: 6,
    }),
    prisma.bookingRequest.findMany({
      where: {
        OR: [{ requesterId: actor.id }, { targetId: actor.id }],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            sector: true,
            actorType: true,
            location: true,
            owner: { select: { avatarUrl: true } },
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            sector: true,
            actorType: true,
            location: true,
            owner: { select: { avatarUrl: true } },
          },
        },
      },
      take: 6,
    }),
  ]);

  const suggestedPartnersMap = new Map<
    string,
    { id: string; name: string; sector: string; avatarUrl: string | null; contextLabel: string }
  >();

  collabParticipants.forEach((cp) => {
    if (!existingPartnerIds.has(cp.actor.id) && !suggestedPartnersMap.has(cp.actor.id)) {
      suggestedPartnersMap.set(cp.actor.id, {
        id: cp.actor.id,
        name: cp.actor.name,
        sector: cp.actor.sector,
        avatarUrl: cp.actor.owner?.avatarUrl || null,
        contextLabel: `Workspace: ${cp.collaboration.title}`,
      });
    }
  });

  bookingPartners.forEach((bp) => {
    const partner = bp.requesterId === actor.id ? bp.target : bp.requester;
    if (
      partner &&
      partner.id !== actor.id &&
      !existingPartnerIds.has(partner.id) &&
      !suggestedPartnersMap.has(partner.id)
    ) {
      suggestedPartnersMap.set(partner.id, {
        id: partner.id,
        name: partner.name,
        sector: partner.sector,
        avatarUrl: partner.owner?.avatarUrl || null,
        contextLabel: "Mitra Pesanan Sewa",
      });
    }
  });

  const suggestedPartners = Array.from(suggestedPartnersMap.values());

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Pesan &amp; Tawaran Proyek
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
              Ruang negosiasi langsung, penawaran proyek resmi, dan serah terima hasil kolaborasi terverifikasi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 border border-white/80 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
          suggestedPartners={suggestedPartners}
        />
      </div>
    </AppShell>
  );
}
