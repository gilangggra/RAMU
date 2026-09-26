import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActorById } from "@/application/directoryService";
import { AppShell } from "@/components/layout/AppShell";
import {
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
  Lightbulb,
  PlusCircle,
} from "lucide-react";
import { ActorDetailTabs } from "@/components/directory/ActorDetailTabs";
import { BookingButton } from "@/components/directory/BookingButton";

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

  const isCurrentActor = currentActor.id === actor.id;

  // Extract a preview image from assets for the cover/hero (Prioritize portfolio/comp-card, strictly exclude equipment)
  let previewImage = null;
  for (const asset of actor.assets) {
    if (asset.category === "EQUIPMENT") continue; // Never use camera/equipment for hero
    if (actor.actorType !== "STUDIO" && asset.category === "STUDIO_SPACE") continue;

    if (asset.attributes) {
      const attrs = asset.attributes as any;
      if (asset.category === "PORTFOLIO_WORK" && attrs.image_url) {
        previewImage = attrs.image_url;
        break;
      }
      if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) {
        previewImage = attrs.comp_card.images[0];
        break;
      }
      if (attrs.brand_gallery && attrs.brand_gallery.length > 0) {
        previewImage = attrs.brand_gallery[0];
        break;
      }
      if (attrs.styling_gallery && attrs.styling_gallery.length > 0) {
        previewImage = attrs.styling_gallery[0];
        break;
      }
      if (actor.actorType === "STUDIO" && attrs.image_url) {
        previewImage = attrs.image_url;
        break;
      }
    }
  }
  
  // Fallback images tailored to sector/type
  if (!previewImage) {
    if (actor.actorType === "STUDIO") previewImage = "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd08?q=80&w=2000&auto=format&fit=crop";
    else if (actor.actorType === "MSME") previewImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop";
    else previewImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"; // Model/Portrait fallback
  }

  return (
    <AppShell actor={currentActor} activeRoute="/directory">
      <div className="max-w-6xl mx-auto pb-24">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-[#1E1B2E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Direktori</span>
          </Link>
        </div>

        {/* =========================================================================
            DYNAMIC HEADER BASED ON ACTOR TYPE
           ========================================================================= */}

        {/* --- 1. INDIVIDUAL (Comp Card / Magazine Style) --- */}
        {actor.actorType === "INDIVIDUAL" && (
          <section className="flex flex-col md:flex-row gap-8 lg:gap-16 mb-16">
            {/* Left: Giant Portrait Image */}
            <div className="w-full md:w-[45%] shrink-0">
              <div className="aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                <img 
                  src={previewImage}
                  alt={actor.name}
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>

            {/* Right: Typography & Details */}
            <div className="flex flex-col justify-end pb-8">
              <div className="mb-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                  {actor.sector}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light text-[#1E1B2E] tracking-tighter leading-[0.9]">
                  {actor.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-stone-500 mb-8">
                {actor.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{actor.location}</span>
                  </div>
                )}
                {actor.websiteUrl && (
                  <a href={actor.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#1E1B2E] transition-colors">
                    <Globe className="w-3.5 h-3.5 text-stone-400" />
                    <span>Website</span>
                  </a>
                )}
                {actor.contactEmail && (
                  <a href={`mailto:${actor.contactEmail}`} className="flex items-center gap-1.5 hover:text-[#1E1B2E] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              {actor.description && (
                <p className="text-sm font-light text-stone-500 leading-relaxed max-w-lg mb-10">
                  {actor.description}
                </p>
              )}

              {/* Action Buttons */}
              {!isCurrentActor ? (
                <div className="flex flex-wrap items-center gap-3">
                  <BookingButton 
                    targetId={actor.id} 
                    targetName={actor.name} 
                    targetSector={actor.sector} 
                    targetType={actor.actorType} 
                    label="Sewa Jasa (Direct Hire)" 
                  />
                  <Link
                    href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white text-xs font-bold uppercase tracking-widest shadow-xs transition-all cursor-pointer"
                    title="Ajak ke Project Brief"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Ajak Kolaborasi Proyek</span>
                  </Link>
                  <Link
                    href={`/opportunities?actorId=${actor.id}`}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                    title="Cek Sinergi AI"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Cek Sinergi AI</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/settings/profile"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                  >
                    <span>Edit Profil Publik</span>
                  </Link>
                  <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                  >
                    <span>Kelola Portofolio</span>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- 2. STUDIO (Real-Estate / Architectural Style) --- */}
        {actor.actorType === "STUDIO" && (
          <section className="mb-16">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-[#1E1B2E] tracking-tight mb-2">
                  {actor.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                  <span>{actor.sector}</span>
                  {actor.location && (
                    <>
                      <span>&mdash;</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{actor.location}</span>
                    </>
                  )}
                  {actor.websiteUrl && (
                    <>
                      <span>&mdash;</span>
                      <a href={actor.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#1E1B2E] transition-colors">
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                      </a>
                    </>
                  )}
                  {actor.contactEmail && (
                    <>
                      <span>&mdash;</span>
                      <a href={`mailto:${actor.contactEmail}`} className="flex items-center gap-1 hover:text-[#1E1B2E] transition-colors">
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isCurrentActor ? (
                <div className="flex flex-wrap items-center gap-3">
                  <BookingButton 
                    targetId={actor.id} 
                    targetName={actor.name} 
                    targetSector={actor.sector} 
                    targetType={actor.actorType} 
                    label="Sewa Studio (Direct)" 
                  />
                  <Link
                    href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white text-xs font-bold uppercase tracking-widest shadow-xs transition-all cursor-pointer"
                    title="Ajak ke Project Brief"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Ajak Kolaborasi Proyek</span>
                  </Link>
                  <Link
                    href={`/opportunities?actorId=${actor.id}`}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                    title="Cek Sinergi AI"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Cek Sinergi AI</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/settings/profile"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                  >
                    <span>Edit Fasilitas Studio</span>
                  </Link>
                  <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                  >
                    <span>Kelola Portofolio</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Wide Panoramic Image */}
            <div className="w-full h-[40vh] sm:h-[60vh] bg-stone-100 overflow-hidden">
               <img 
                  src={previewImage}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                />
            </div>
          </section>
        )}

        {/* --- 3. MSME & COLLECTIVE (Brand Deck / Agency Style) --- */}
        {(actor.actorType === "MSME" || actor.actorType === "COLLECTIVE") && (
          <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 pt-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">
              {actor.actorType === "MSME" ? "Brand Identity" : "Creative Collective"}
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic text-[#1E1B2E] leading-tight mb-6">
              {actor.name}
            </h1>
            
            <p className="text-base md:text-lg font-light text-stone-500 leading-relaxed max-w-2xl mb-10">
              {actor.description || "Kami adalah entitas yang fokus pada penciptaan nilai visual tinggi melalui sinergi kolaboratif."}
            </p>

            {/* Minimalist Contact & Location */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#1E1B2E] mb-12 border-y border-stone-200 py-4 w-full">
               {actor.location && (
                 <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-stone-400" />{actor.location}</span>
               )}
               {actor.websiteUrl && (
                 <a href={actor.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-stone-500 transition-colors">
                   <Globe className="w-3.5 h-3.5 text-stone-400" /> Website
                 </a>
               )}
               {actor.contactEmail && (
                 <a href={`mailto:${actor.contactEmail}`} className="flex items-center gap-2 hover:text-stone-500 transition-colors">
                   <Mail className="w-3.5 h-3.5 text-stone-400" /> Email
                 </a>
               )}
            </div>

            {/* Action Buttons */}
            {!isCurrentActor ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <BookingButton 
                  targetId={actor.id} 
                  targetName={actor.name} 
                  targetSector={actor.sector} 
                  targetType={actor.actorType} 
                  label="Pengadaan / Sewa (Direct)" 
                />
                <Link
                  href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white text-xs font-bold uppercase tracking-widest shadow-xs transition-all cursor-pointer"
                  title="Ajak ke Project Brief"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ajak Kolaborasi Proyek</span>
                </Link>
                <Link
                  href={`/opportunities?actorId=${actor.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                  title="Cek Sinergi AI"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Cek Sinergi AI</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/settings/profile"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                >
                  <span>Edit Brand & Profil</span>
                </Link>
                <Link
                  href="/dashboard/showcase"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                >
                  <span>Kelola Portofolio</span>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            TABS SECTION (Re-designed internally in ActorDetailTabs)
           ========================================================================= */}
        <div className="border-t border-stone-200 pt-12">
          <ActorDetailTabs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actor={actor as any}
            isCurrentActor={isCurrentActor}
          />
        </div>
      </div>
    </AppShell>
  );
}
