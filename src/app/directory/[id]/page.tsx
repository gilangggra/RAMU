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
  MessageCircle,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { parseSocialLinks, InstagramIcon } from "@/lib/socialUtils";
import { ActorDetailTabs } from "@/components/directory/ActorDetailTabs";
import { BookingButton } from "@/components/directory/BookingButton";
import { OpenEditModalButton } from "@/components/directory/OpenEditModalButton";

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

  const potentialOtherAssets = await prisma.asset.findMany({
    where: {
      category: "PORTFOLIO_WORK",
      status: "ACTIVE",
      actorId: { not: actor.id },
    },
    include: {
      actor: {
        select: { id: true, name: true, sector: true, location: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const confirmedCoCredits: any[] = [];
  for (const oAsset of potentialOtherAssets) {
    const ts = (oAsset.attributes as any)?.tear_sheet;
    if (ts && Array.isArray(ts.credits)) {
      const match = ts.credits.find((c: any) => c.actorId === actor.id && c.verified);
      if (match) {
        confirmedCoCredits.push({
          id: oAsset.id,
          name: oAsset.name,
          category: "PORTFOLIO_WORK",
          subtype: oAsset.subtype,
          roles: oAsset.roles,
          description: oAsset.description,
          attributes: {
            ...(oAsset.attributes as any),
            is_co_credit: true,
            co_credit_role: match.role,
            uploader_name: oAsset.actor.name,
            uploader_id: oAsset.actor.id,
          },
        });
      }
    }
  }

  const actorWithCoCredits = {
    ...actor,
    assets: [...actor.assets, ...confirmedCoCredits],
  };

  let previewImage = null;
  for (const asset of actorWithCoCredits.assets) {
    if (asset.category === "EQUIPMENT") continue;
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

  if (!previewImage && actor.owner?.avatarUrl) {
    previewImage = actor.owner.avatarUrl;
  }

  if (!previewImage) {
    if (actor.actorType === "STUDIO") previewImage = "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd08?q=80&w=2000&auto=format&fit=crop";
    else if (actor.actorType === "BRAND" || (actor.actorType as string) === "MSME") previewImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop";
    else previewImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop";
  }

  const sectorLower = actor.sector.toLowerCase();
  const isVideo = sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema");
  const isModel = sectorLower.includes("model") || sectorLower.includes("talent");
  const isMua = sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair");
  const isStylist = sectorLower.includes("stylist") || sectorLower.includes("wardrobe");
  const isPhotog = sectorLower.includes("fotografi") || sectorLower.includes("photographer");
  const isDesigner = sectorLower.includes("designer") || sectorLower.includes("desain");

  const isIndividualSector = isVideo || isModel || isMua || isStylist || isPhotog || isDesigner;
  const hasStudioSpaceAsset = actor.assets.some(
    (a) => a.category === "STUDIO_SPACE" || a.subtype?.toLowerCase().includes("studio")
  );
  const isStudio = !isIndividualSector && (actor.actorType === "STUDIO" || sectorLower.includes("studio") || hasStudioSpaceAsset);
  const isBrand = !isIndividualSector && !isStudio && (actor.actorType === "BRAND" || (actor.actorType as string) === "MSME" || actor.actorType === "COLLECTIVE" || sectorLower.includes("brand") || sectorLower.includes("label") || sectorLower.includes("umkm"));
  const isIndividual = !isStudio && !isBrand;

  let startingRate = "Mulai Rp 1,5 Jt / sesi";
  let turnaroundTime = "3 – 5 Hari Kerja";

  if (isStudio) {
    startingRate = "Mulai Rp 200rb / jam (Shift Rp 750rb)";
    turnaroundTime = "Instan / Slot Booking";
  } else if (isModel) {
    startingRate = "Mulai Rp 1,0 Jt / sesi";
    turnaroundTime = "Selesai Sesi Pemotretan";
  } else if (isMua) {
    startingRate = "Mulai Rp 800rb / sesi";
    turnaroundTime = "Selesai On-Set Hari-H";
  } else if (isStylist) {
    startingRate = "Mulai Rp 1,2 Jt / sesi";
    turnaroundTime = "Selesai On-Set Hari-H";
  } else if (isVideo) {
    startingRate = "Mulai Rp 1,8 Jt / video";
    turnaroundTime = "4 – 6 Hari Kerja";
  } else if (isPhotog) {
    startingRate = "Mulai Rp 1,5 Jt / sesi";
    turnaroundTime = "3 – 5 Hari Kerja";
  } else if (isDesigner) {
    startingRate = "Mulai Rp 2,5 Jt / koleksi";
    turnaroundTime = "7 – 14 Hari Kerja";
  } else if (isBrand) {
    startingRate = "Sesuai Brief & Volume";
    turnaroundTime = "Sesuai Timeline Proyek";
  }

  const customServiceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && ("service_packages" in (a.attributes as any) || "starting_rate" in (a.attributes as any) || "terms_and_conditions" in (a.attributes as any)))
  );
  const customAttrs = (customServiceAsset?.attributes as any) || {};
  if (customAttrs.starting_rate) {
    startingRate = customAttrs.starting_rate;
  }
  if (customAttrs.turnaround_time) {
    turnaroundTime = customAttrs.turnaround_time;
  }
  const customTermsConfig = customAttrs.terms_and_conditions || null;

  const rawPhone = actor.contactPhone || "";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${actor.name}, saya melihat profil Anda di RAMU dan tertarik bekerjasama untuk proyek.`)}` : null;

  const socialLinks = parseSocialLinks(actor.websiteUrl);

  return (
    <AppShell actor={currentActor} activeRoute="/directory">
      <div className="max-w-6xl mx-auto pb-24">

        <div className="mb-8">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-[#1E1B2E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Direktori</span>
          </Link>
        </div>

        {isIndividual && (
          <section className="mb-14 pt-2">
            <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12 pb-10 border-b border-stone-200">
              <div className="w-full sm:w-64 md:w-72 shrink-0">
                <div className="aspect-[3/4] w-full bg-stone-100 border border-stone-200/90 relative overflow-hidden shadow-xs">
                  {actor.owner?.avatarUrl ? (
                    <img
                      src={actor.owner.avatarUrl}
                      alt={actor.name}
                      className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                    />
                  ) : previewImage ? (
                    <img
                      src={previewImage}
                      alt={actor.name}
                      className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1E1B2E] text-white flex items-center justify-center text-4xl font-light tracking-tight">
                      {actor.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-[#1E1B2E] shadow-2xs border border-stone-200/50">
                      Kreator Terverifikasi
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold px-0.5">
                  <span className="text-stone-400">ID: {actor.name.toUpperCase()}</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    SPK Terlindungi
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between min-h-[360px] w-full">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-2.5">
                    <span>{actor.sector}</span>
                    <span className="w-1 h-1 bg-stone-300" />
                    <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-600 animate-pulse" />
                      Tersedia untuk Booking
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1E1B2E] tracking-tighter leading-none mb-4">
                    {actor.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-5 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-5">
                    {actor.location && (
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{actor.location}</span>
                      </div>
                    )}
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#1E1B2E] transition-colors"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {socialLinks.website && (
                      <a
                        href={socialLinks.website.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#1E1B2E] transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-stone-400" />
                        <span>Website</span>
                      </a>
                    )}
                    {actor.contactEmail && (
                      <a
                        href={`mailto:${actor.contactEmail}`}
                        className="flex items-center gap-1.5 hover:text-[#1E1B2E] transition-colors lowercase tracking-normal"
                      >
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{actor.contactEmail}</span>
                      </a>
                    )}
                  </div>

                  <p className="text-sm font-light text-stone-600 leading-relaxed max-w-2xl mb-6">
                    {actor.description ||
                      `${actor.name} adalah ${actor.sector} profesional berbasis di ${actor.location || "Indonesia"}, fokus pada penciptaan narasi visual komersial, editorial lookbook, dan kampanye berestetika tinggi yang terkurasi untuk brand busana dan media kreatif kontemporer.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="px-3 py-1 bg-white border border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      Editorial &amp; Lookbook
                    </span>
                    <span className="px-3 py-1 bg-white border border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      High-Fashion Campaign
                    </span>
                    <span className="px-3 py-1 bg-white border border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      Studio &amp; On-Location
                    </span>
                    <span className="px-3 py-1 bg-white border border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      Canon EOS R5 Production Kit
                    </span>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-stone-200">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-0.5">
                        Estimasi Tarif
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#1E1B2E]">
                        {startingRate}
                      </span>
                    </div>
                    <div className="sm:border-l border-stone-200 sm:pl-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-0.5">
                        Turnaround
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#1E1B2E]">
                        {turnaroundTime}
                      </span>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-l border-stone-200 sm:pl-4 pt-2 sm:pt-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-0.5">
                        Area Kerja
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#1E1B2E] truncate block">
                        {actor.location ? actor.location.split(",")[0] : "Indonesia"}
                      </span>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-l border-stone-200 sm:pl-4 pt-2 sm:pt-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-0.5">
                        Sistem Bayar
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#1E1B2E]">
                        DP 50% + Pelunasan
                      </span>
                    </div>
                  </div>

                  <div>
                    {!isCurrentActor ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <BookingButton
                          targetId={actor.id}
                          targetName={actor.name}
                          targetSector={actor.sector}
                          targetType={actor.actorType}
                          label="Sewa Jasa / Rekrut Sekarang"
                          termsConfig={customTermsConfig}
                        />
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 border border-emerald-600/40 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                            title="Chat WhatsApp Langsung"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {actor.contactEmail && !waLink && (
                          <a
                            href={`mailto:${actor.contactEmail}?subject=${encodeURIComponent(`Tawaran Proyek Kerja - ${actor.name}`)}`}
                            className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                          >
                            <Mail className="w-4 h-4 text-stone-500" />
                            <span>Kirim Email</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <OpenEditModalButton
                          initialTab="specs"
                          label="Edit Halaman Profil"
                        />
                        <Link
                          href="/dashboard/showcase"
                          className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                        >
                          <span>Kelola Portofolio</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isStudio && (
          <section className="mb-16">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2 flex items-center gap-2">
                  <span>{actor.sector}</span>
                  <span className="w-1 h-1 bg-stone-300" />
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-700 animate-pulse" />
                    Studio Siap Booking
                  </span>
                </div>
                <div className="flex items-center gap-3.5 mb-2">
                  {actor.owner?.avatarUrl && (
                    <div className="w-12 h-12 rounded-none overflow-hidden bg-stone-100 border border-stone-200 shadow-xs shrink-0">
                      <img src={actor.owner.avatarUrl} alt={actor.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-[#1E1B2E] tracking-tight">
                    {actor.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                  {actor.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{actor.location}</span>
                  )}
                  {socialLinks.instagram && (
                    <>
                      <span>&mdash;</span>
                      <a href={socialLinks.instagram.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#1E1B2E] transition-colors">
                        <InstagramIcon className="w-3 h-3" />
                        <span>Instagram</span>
                      </a>
                    </>
                  )}
                  {socialLinks.website && (
                    <>
                      <span>&mdash;</span>
                      <a href={socialLinks.website.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#1E1B2E] transition-colors">
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

              {!isCurrentActor ? (
                <div className="flex flex-wrap items-center gap-3">
                  <BookingButton
                    targetId={actor.id}
                    targetName={actor.name}
                    targetSector={actor.sector}
                    targetType={actor.actorType}
                    label="Sewa Studio Sekarang"
                    termsConfig={customTermsConfig}
                  />
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600/40 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                      title="Chat WhatsApp Langsung"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Chat via WhatsApp</span>
                    </a>
                  ) : actor.contactEmail ? (
                    <a
                      href={`mailto:${actor.contactEmail}?subject=${encodeURIComponent(`Reservasi Sewa Studio - ${actor.name}`)}`}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                    >
                      <Mail className="w-4 h-4 text-stone-500" />
                      <span>Kirim Email</span>
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <OpenEditModalButton
                    initialTab="specs"
                    label="Edit Fasilitas & Profil"
                    iconClassName="text-blue-300"
                  />
                  <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                  >
                    <span>Kelola Portofolio</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-stone-50 border border-stone-200/80 mb-6">
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Tarif Sewa</div>
                <div className="text-xs font-semibold text-[#1E1B2E]">{startingRate}</div>
              </div>
              <div className="space-y-0.5 sm:border-l border-stone-200/60 sm:pl-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Waktu Booking</div>
                <div className="text-xs font-semibold text-[#1E1B2E]">Shift 4 Jam / 8 Jam</div>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-stone-200/60 sm:pl-3 pt-2 sm:pt-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Lokasi Studio</div>
                <div className="text-xs font-semibold text-[#1E1B2E] truncate">{actor.location || "Jakarta"}</div>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-stone-200/60 sm:pl-3 pt-2 sm:pt-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Sistem Pembayaran</div>
                <div className="text-xs font-semibold text-[#1E1B2E]">DP Reservasi Slot 50%</div>
              </div>
            </div>

            <div className="w-full h-[40vh] sm:h-[60vh] bg-stone-100 overflow-hidden">
               <img
                  src={previewImage}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                />
            </div>
          </section>
        )}

        {isBrand && (
          <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 pt-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">
              {actor.actorType === "BRAND" || (actor.actorType as string) === "MSME" ? "Brand & Label Busana" : "Creative Collective"}
            </div>

            {actor.owner?.avatarUrl && (
              <div className="w-20 h-20 rounded-none overflow-hidden bg-stone-100 border border-stone-200 mx-auto mb-4 shadow-xs">
                <img src={actor.owner.avatarUrl} alt={actor.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic text-[#1E1B2E] leading-tight mb-6">
              {actor.name}
            </h1>

            <p className="text-base md:text-lg font-light text-stone-500 leading-relaxed max-w-2xl mb-8">
              {actor.description || "Kami adalah entitas yang fokus pada penciptaan nilai visual tinggi melalui sinergi komersial."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-stone-50 border border-stone-200/80 mb-8 w-full text-left">
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Produksi & Katalog</div>
                <div className="text-xs font-semibold text-[#1E1B2E]">{startingRate}</div>
              </div>
              <div className="space-y-0.5 sm:border-l border-stone-200/60 sm:pl-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Status Kerjasama</div>
                <div className="text-xs font-semibold text-emerald-700">Menerima Pengadaan / Sewa</div>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-stone-200/60 sm:pl-3 pt-2 sm:pt-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Domisili</div>
                <div className="text-xs font-semibold text-[#1E1B2E] truncate">{actor.location || "Indonesia"}</div>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-stone-200/60 sm:pl-3 pt-2 sm:pt-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Kontrak Kerja</div>
                <div className="text-xs font-semibold text-[#1E1B2E]">Invoice Resmi & PO</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#1E1B2E] mb-8 border-y border-stone-200 py-4 w-full">
               {actor.location && (
                 <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-stone-400" />{actor.location}</span>
               )}
               {socialLinks.instagram && (
                 <a href={socialLinks.instagram.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-stone-500 transition-colors">
                   <InstagramIcon className="w-3.5 h-3.5 text-stone-400" />
                   <span>Instagram</span>
                 </a>
               )}
               {socialLinks.website && (
                 <a href={socialLinks.website.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-stone-500 transition-colors">
                   <Globe className="w-3.5 h-3.5 text-stone-400" />
                   <span>Website</span>
                 </a>
               )}
               {actor.contactEmail && (
                 <a href={`mailto:${actor.contactEmail}`} className="flex items-center gap-2 hover:text-stone-500 transition-colors">
                   <Mail className="w-3.5 h-3.5 text-stone-400" /> Email
                 </a>
               )}
            </div>

            {!isCurrentActor ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <BookingButton
                  targetId={actor.id}
                  targetName={actor.name}
                  targetSector={actor.sector}
                  targetType={actor.actorType}
                  label="Pesan Jasa / Pengadaan"
                  termsConfig={customTermsConfig}
                />
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600/40 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                    title="Chat WhatsApp Langsung"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Chat via WhatsApp</span>
                  </a>
                ) : actor.contactEmail ? (
                  <a
                    href={`mailto:${actor.contactEmail}?subject=${encodeURIComponent(`Penawaran Pengadaan / Kerjasama - ${actor.name}`)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 hover:border-[#1E1B2E] text-stone-700 hover:text-[#1E1B2E] text-xs font-bold uppercase tracking-widest bg-white hover:bg-stone-50 transition-all shadow-xs"
                  >
                    <Mail className="w-4 h-4 text-stone-500" />
                    <span>Kirim Email</span>
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <OpenEditModalButton
                  initialTab="profile"
                  label="Edit Brand & Profil"
                  iconClassName="text-emerald-300"
                />
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

        <div className="border-t border-stone-200 pt-12">
          <ActorDetailTabs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actor={actorWithCoCredits as any}
            isCurrentActor={isCurrentActor}
          />
        </div>
      </div>
    </AppShell>
  );
}
