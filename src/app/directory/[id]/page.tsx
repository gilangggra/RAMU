import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActorById } from "@/application/directoryService";
import { AppShell } from "@/components/layout/AppShell";
import {
  Building2,
  User,
  Sparkles,
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
  Package,
  Target,
  Search,
  ShieldAlert,
  Lightbulb,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { ActorDetailTabs } from "@/components/directory/ActorDetailTabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getDirectoryActorById(id);
  if (!actor) return { title: "Aktor Tidak Ditemukan | RAMU" };
  return {
    title: `${actor.name} - Direktori Ekosistem | RAMU`,
    description: actor.description || `Profil dan portofolio aset ${actor.name} di platform RAMU.`,
  };
}

export default async function DirectoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentActor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!currentActor) redirect("/onboarding");

  const { id } = await params;
  const actor = await getDirectoryActorById(id);

  if (!actor) {
    notFound();
  }

  const initials = actor.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isCurrentActor = currentActor.id === actor.id;

  return (
    <AppShell actor={currentActor} activeRoute="/directory">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#27213D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Direktori Talenta & Studio</span>
          </Link>
        </div>

        {/* Profile Header Card - NEWTH Style */}
        <section className="rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] relative overflow-hidden">
          {/* Hero Banner (Dynamic Cover Photo) */}
          <div className="h-48 sm:h-72 w-full relative bg-stone-900 overflow-hidden rounded-t-[32px]">
            <img 
              src={
                actor.sector.toLowerCase().includes("fotografi") ? "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop"
                : actor.sector.toLowerCase().includes("desain") || actor.sector.toLowerCase().includes("design") ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop"
              }
              alt="Cover Photo"
              className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
            />
            {/* Elegant overlay to ensure content contrast at the bottom edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            {/* Overlapping Avatar & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-4">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-400 to-[#E66A48] flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-xl shrink-0 border-4 border-white relative z-10">
                {initials}
              </div>

              {/* Quick Action CTA (Right aligned on desktop) */}
              {!isCurrentActor && (
                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 mb-2 sm:mb-0">
                  <Link
                    href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
                    className="px-6 py-3 rounded-2xl bg-[#27213D] hover:bg-[#1a1629] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Log in to message or book</span>
                  </Link>
                  <Link
                    href="/opportunities"
                    className="px-4 py-3 rounded-2xl bg-white hover:bg-stone-50 text-[#27213D] border border-stone-200/80 font-bold transition-all flex items-center justify-center shadow-sm"
                    title="Cek Sinergi di Engine"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  </Link>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#27213D] tracking-tight">
                {actor.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-stone-600 flex items-center gap-1.5">
                  {actor.actorType === "STUDIO" ? (
                    <Building2 className="w-4 h-4" />
                  ) : actor.actorType === "INDIVIDUAL" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {actor.sector}
                </span>
                
                {actor.location && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className="flex items-center gap-1 text-sm text-stone-500 font-medium">
                      <MapPin className="w-4 h-4" />
                      {actor.location}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
                {actor.contactEmail && (
                  <a href={`mailto:${actor.contactEmail}`} className="flex items-center gap-1.5 text-stone-500 hover:text-[#27213D] transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
                {actor.websiteUrl && (
                  <a
                    href={actor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-stone-500 hover:text-[#27213D] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-stone-500 hover:text-[#E66A48] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  <span>Instagram</span>
                </a>
                {(actor.actorType === "STUDIO" || actor.sector.toLowerCase().includes("design")) && (
                  <a
                    href="#"
                    className="flex items-center gap-1.5 text-stone-500 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.898 5.375 4.426.04.247.05.715.05.715h-8.081c.141 2.052 1.239 4.316 3.018 4.316 1.708 0 2.298-.958 2.637-2.062l2.2.2zm-5.466-4.22c-.104-1.844-1.127-3.298-2.585-3.298-1.447 0-2.428 1.492-2.551 3.298h5.136zm-8.26-6.78v14h-4.305v-5.636h-1.637c-1.391 0-2.582-.55-3.328-1.516-1.042-1.353-1.03-3.208-.073-4.523.753-1.031 2.052-1.611 3.491-1.611h1.547v-4.116h4.305zm-4.305 6.136h-1.487c-1.164 0-1.854.757-1.854 1.765 0 1.058.647 1.71 1.761 1.71h1.58v-3.475z"/></svg>
                    <span>Behance</span>
                  </a>
                )}
              </div>
              
              {actor.description && (
                <p className="text-sm text-[#716B7E] leading-relaxed max-w-3xl mt-4">
                  {actor.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 🧭 Grouped Navigation Tabs (About, Portfolio, Availability, Reviews, Needs) */}
        <ActorDetailTabs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actor={actor as any}
          isCurrentActor={isCurrentActor}
        />
      </div>
    </AppShell>
  );
}
