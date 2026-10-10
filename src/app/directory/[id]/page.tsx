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
  ArrowUpRight,
  MessageCircle,
  CheckCircle2,
  Pencil,
  Search,
  MessageSquare,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { parseSocialLinks, InstagramIcon } from "@/lib/socialUtils";
import { getActorBookedDatesAction } from "@/app/api/bookings/actions";
import { ActorDetailTabs } from "@/components/directory/ActorDetailTabs";
import { BookingButton } from "@/components/directory/BookingButton";
import { OpenEditModalButton } from "@/components/directory/OpenEditModalButton";
import { ActorAvatar } from "@/components/ui/ActorAvatar";
import { ProfileCompatibilityBanner } from "@/components/directory/ProfileCompatibilityBanner";
import { ActorMobileActionBar } from "@/components/directory/ActorMobileActionBar";
import { Navbar } from "@/components/landing/Navbar";
import { ShareProfileButton } from "@/components/directory/ShareProfileButton";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string; edit?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentActor = null;
  if (user) {
    currentActor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "asc" },
    });
  }

  const isGuest = !currentActor;

  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const rawTab = (sParams?.tab || "").toLowerCase();
  const initialTab: "portfolio" | "rates" | "specs" | "collaborations" | "about" | "reviews" =
    rawTab === "rates" || rawTab === "tarif" || rawTab === "paket"
      ? "rates"
      : rawTab === "specs" || rawTab === "spesifikasi"
      ? "specs"
      : rawTab === "collaborations" || rawTab === "proyek"
      ? "collaborations"
      : rawTab === "about" || rawTab === "tentang"
      ? "about"
      : rawTab === "reviews" || rawTab === "ulasan"
      ? "reviews"
      : "portfolio";

  const actor = await getDirectoryActorById(id);

  if (!actor) {
    notFound();
  }

  const isCurrentActor = currentActor ? currentActor.id === actor.id : false;

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

  const registeredActors = await prisma.actor.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      sector: true,
      location: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const bookedDates = await getActorBookedDatesAction(actor.id);



  const sectorLower = actor.sector.toLowerCase();
  const actorTypeUpper = (actor.actorType || "").toUpperCase();
  const hasStudioSpaceAsset = actor.assets.some(
    (a) => a.category === "STUDIO_SPACE" || a.subtype?.toLowerCase().includes("studio")
  );

  const isBrand =
    actorTypeUpper === "BRAND" ||
    actorTypeUpper === "MSME" ||
    actorTypeUpper === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("umkm") ||
    sectorLower.includes("designer") ||
    sectorLower.includes("desain") ||
    sectorLower.includes("atelier");

  // Studio: explicitly studio type, or named Studio Imaji, or sector contains studio and not photographer
  const isStudio =
    !isBrand &&
    (actorTypeUpper === "STUDIO" ||
      actor.name.toLowerCase().includes("studio imaji") ||
      (sectorLower.includes("studio") && !sectorLower.includes("photographer") && !sectorLower.includes("fotografi")));

  const isModel = !isBrand && !isStudio && (sectorLower.includes("model") || sectorLower.includes("talent"));
  const isMua = !isBrand && !isStudio && (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isBrand && !isStudio && !isMua && (sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isVideo = !isBrand && !isStudio && (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isPhotog = !isBrand && !isStudio && !isVideo && !isModel && !isMua && !isStylist;

  // Role-Aware Primary Preview Image Resolution
  let previewImage: string | null = null;

  if (isStudio) {
    // 1. Studio Space asset
    for (const asset of actorWithCoCredits.assets) {
      if (asset.category === "EQUIPMENT") continue;
      if (asset.attributes) {
        const attrs = asset.attributes as any;
        if (asset.category === "STUDIO_SPACE" && attrs.image_url) {
          previewImage = attrs.image_url;
          break;
        }
      }
    }
    // 2. Studio uploaded avatar / space photo
    if (!previewImage && actor.owner?.avatarUrl) {
      previewImage = actor.owner.avatarUrl;
    }
    // 3. Any portfolio image
    if (!previewImage) {
      for (const asset of actorWithCoCredits.assets) {
        if (asset.attributes) {
          const attrs = asset.attributes as any;
          if (attrs.image_url) {
            previewImage = attrs.image_url;
            break;
          }
        }
      }
    }
  } else if (isBrand) {
    // 1. Brand gallery or lookbook
    for (const asset of actorWithCoCredits.assets) {
      if (asset.category === "EQUIPMENT") continue;
      if (asset.attributes) {
        const attrs = asset.attributes as any;
        if (attrs.brand_gallery && attrs.brand_gallery.length > 0) {
          previewImage = attrs.brand_gallery[0];
          break;
        }
        if (asset.category === "PORTFOLIO_WORK" && attrs.image_url) {
          previewImage = attrs.image_url;
          break;
        }
      }
    }
    // 2. Brand official logo / avatar
    if (!previewImage && actor.owner?.avatarUrl) {
      previewImage = actor.owner.avatarUrl;
    }
  } else {
    // Individual Creators (Photographer, Model, MUA, Stylist, Videographer, Designer):
    if (isModel) {
      // 1. Comp card for models has highest priority
      for (const asset of actorWithCoCredits.assets) {
        if (asset.attributes) {
          const attrs = asset.attributes as any;
          if (attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) {
            previewImage = attrs.comp_card.images[0];
            break;
          }
        }
      }
      // 2. Official headshot / avatar
      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
      }
      // 3. Portfolio work
      if (!previewImage) {
        for (const asset of actorWithCoCredits.assets) {
          if (asset.attributes) {
            const attrs = asset.attributes as any;
            if (attrs.image_url) {
              previewImage = attrs.image_url;
              break;
            }
          }
        }
      }
    } else {
      // Photographer, Videographer, Stylist, Designer, MUA:
      // 1. Featured Cover or Masterpiece Portfolio has HIGHEST precedence for hero visual!
      for (const asset of actorWithCoCredits.assets) {
        if (asset.attributes) {
          const attrs = asset.attributes as any;
          if (attrs.is_featured_cover || attrs.is_cover) {
            if (attrs.image_url || attrs.thumbnail_url || attrs.poster_url) {
              previewImage = attrs.image_url || attrs.thumbnail_url || attrs.poster_url;
              break;
            }
          }
        }
      }

      // 2. Portfolio work / styling gallery
      if (!previewImage) {
        for (const asset of actorWithCoCredits.assets) {
          if (asset.category === "EQUIPMENT") continue;
          if (asset.category === "STUDIO_SPACE") continue;
          if (asset.attributes) {
            const attrs = asset.attributes as any;
            if (asset.category === "PORTFOLIO_WORK" && attrs.image_url) {
              previewImage = attrs.image_url;
              break;
            }
            if (attrs.styling_gallery && attrs.styling_gallery.length > 0) {
              previewImage = attrs.styling_gallery[0];
              break;
            }
          }
        }
      }

      // 3. Fallback to Official Avatar (if no portfolio uploaded yet)
      if (!previewImage && actor.owner?.avatarUrl) {
        previewImage = actor.owner.avatarUrl;
      }
    }
  }

  // Fallbacks if absolutely no image exists
  if (!previewImage) {
    if (isStudio) previewImage = "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd08?q=80&w=2000&auto=format&fit=crop";
    else if (isBrand) previewImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop";
    else previewImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop";
  }

  let roleBadgeLabel = "Kreator Ekosistem";
  let cardOverlayBadge = "Kreator Terverifikasi";
  let availabilityBadge = "Tersedia untuk Booking";
  let metric3Label = "Area & Format";
  let metric3Value = actor.location ? actor.location.split(",")[0] : "Indonesia";
  let metric4Label = "Sistem Kontrak";
  let metric4Value = "SPK Digital & Perikatan Sah";

  let startingRate = "Mulai Rp 1,5 Jt / sesi";
  let turnaroundTime = "3 – 5 Hari Kerja";

  if (isStudio) {
    roleBadgeLabel = "Studio & Lokasi Produksi";
    cardOverlayBadge = "Studio Foto Terverifikasi";
    availabilityBadge = "Studio Siap Booking Slot";
    startingRate = "Mulai Rp 200rb / jam (Shift Rp 750rb)";
    turnaroundTime = "Instan / Slot Booking Shift";
    metric3Label = "Luas & Fasilitas";
    metric3Value = "120 m² Cyclorama L-Curve";
    metric4Label = "Sistem Reservasi";
    metric4Value = "DP Reservasi & Garansi Jadwal";
  } else if (isBrand) {
    roleBadgeLabel = "Brand & Label Mode";
    cardOverlayBadge = "Partner Brand Resmi";
    availabilityBadge = "Menerima Pitch & Brief";
    startingRate = "Sesuai Brief & Volume Proyek";
    turnaroundTime = "Sesuai Timeline Produksi";
    metric3Label = "Fokus Kemitraan";
    metric3Value = "Lookbook & Campaign";
    metric4Label = "Kontrak Kerja";
    metric4Value = "Invoice Resmi & PO Transparan";
  } else if (isModel) {
    roleBadgeLabel = "Model & Fashion Talent";
    cardOverlayBadge = "Comp Card Agensi";
    availabilityBadge = "Tersedia untuk Booking";
    startingRate = "Mulai Rp 1,0 Jt / sesi";
    turnaroundTime = "Selesai On-Set Hari-H";
    metric3Label = "Format Kerja";
    metric3Value = "Katalog, Lookbook & TVC";
    metric4Label = "Proteksi Kerja";
    metric4Value = "SPK Digital & Safe Set Protocol";
  } else if (isMua) {
    roleBadgeLabel = "MUA & Hair Artistry";
    cardOverlayBadge = "Makeup Artist Standar Steril";
    availabilityBadge = "Tersedia untuk Booking";
    startingRate = "Mulai Rp 800rb / sesi";
    turnaroundTime = "Standby On-Set Hari-H";
    metric3Label = "Standar Kit";
    metric3Value = "Pro Luxury & Kuas Steril";
    metric4Label = "Proteksi Kerja";
    metric4Value = "SPK Digital Multi-Pihak";
  } else if (isStylist) {
    roleBadgeLabel = "Fashion Stylist & Wardrobe";
    cardOverlayBadge = "Fashion Stylist Terverifikasi";
    availabilityBadge = "Tersedia untuk Booking";
    startingRate = "Mulai Rp 1,2 Jt / sesi";
    turnaroundTime = "Fitting & On-Set Hari-H";
    metric3Label = "Arsip Wardrobe";
    metric3Value = "200+ Busana & Steamer On-Set";
    metric4Label = "Proteksi Kerja";
    metric4Value = "SPK Digital Multi-Pihak";
  } else if (isVideo) {
    roleBadgeLabel = "Videografer & Cinema Director";
    cardOverlayBadge = "Cinema Crew Terkurasi";
    availabilityBadge = "Tersedia untuk Booking";
    startingRate = "Mulai Rp 1,8 Jt / video";
    turnaroundTime = "4 – 6 Hari Kerja";
    metric3Label = "Kamera & Grading";
    metric3Value = "Cinema 4K & DaVinci 10-Bit";
    metric4Label = "Proteksi Kerja";
    metric4Value = "SPK Digital & Hak Lisensi";
  } else if (isPhotog) {
    roleBadgeLabel = "Fotografer Mode & Komersial";
    cardOverlayBadge = "Fotografer Terkurasi";
    availabilityBadge = "Tersedia untuk Booking";
    startingRate = "Mulai Rp 1,5 Jt / sesi";
    turnaroundTime = "3 – 5 Hari Kerja (Retouching)";
    metric3Label = "Format & Lighting";
    metric3Value = "Studio Cyclorama & Location";
    metric4Label = "Proteksi Kerja";
    metric4Value = "SPK Digital & Hak Lisensi";
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
  const availabilityData = (customAttrs?.availability as any) || null;

  const rawPhone = actor.contactPhone || "";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${actor.name}, saya melihat profil Anda di RAMU dan tertarik bekerjasama untuk proyek.`)}` : null;

  const socialLinks = parseSocialLinks(actor.websiteUrl);

  // Dynamic role-specific specs tags for profile header
  const specsAsset = actor.assets.find(
    (a) =>
      (isModel && (a.subtype.toLowerCase().includes("model") || (a.attributes && typeof a.attributes === "object" && ("comp_card" in (a.attributes as any) || "height_cm" in (a.attributes as any))))) ||
      (isStudio && (a.subtype.toLowerCase().includes("studio") || (a.attributes && typeof a.attributes === "object" && ("cyclorama_type" in (a.attributes as any) || "area_sqm" in (a.attributes as any))))) ||
      (isPhotog && a.attributes && typeof a.attributes === "object" && "primary_camera" in (a.attributes as any)) ||
      (isVideo && a.attributes && typeof a.attributes === "object" && ("primary_cinema_camera" in (a.attributes as any) || "stabilizer_gimbal" in (a.attributes as any))) ||
      (isMua && a.attributes && typeof a.attributes === "object" && ("makeup_styles" in (a.attributes as any) || "primary_kit_brands" in (a.attributes as any))) ||
      (isStylist && a.attributes && typeof a.attributes === "object" && ("styling_specialties" in (a.attributes as any) || "onset_equipment" in (a.attributes as any) || "wardrobe_archive_count" in (a.attributes as any))) ||
      (isBrand && a.attributes && typeof a.attributes === "object" && ("brand_gallery" in (a.attributes as any) || "sample_sizes_ready" in (a.attributes as any) || "design_dna" in (a.attributes as any)))
  );
  const specsAttrs = (specsAsset?.attributes && typeof specsAsset.attributes === "object")
    ? (specsAsset.attributes as Record<string, any>)
    : {};

  const headerTags: string[] = [];
  if (isModel) {
    if (specsAttrs.height_cm) headerTags.push(`Tinggi ${specsAttrs.height_cm} cm`);
    if (specsAttrs.bust_waist_hips) headerTags.push(`Vital ${specsAttrs.bust_waist_hips}`);
    if (specsAttrs.clothing_size) headerTags.push(`Size ${specsAttrs.clothing_size}`);
    if (specsAttrs.shoe_size) headerTags.push(`Sepatu ${specsAttrs.shoe_size}`);
    if (Array.isArray(specsAttrs.specialties) && specsAttrs.specialties.length > 0) {
      headerTags.push(...specsAttrs.specialties.slice(0, 2));
    } else {
      headerTags.push("Editorial & Lookbook", "Comp Card Resmi");
    }
  } else if (isStudio) {
    if (specsAttrs.area_sqm) headerTags.push(`Luas ${specsAttrs.area_sqm} m²`);
    if (specsAttrs.cyclorama_type) headerTags.push("Cyclorama L-Curve");
    if (specsAttrs.electrical_capacity) headerTags.push("Daya 16.500W 3-Phase");
    headerTags.push("Ruang Rias & Fitting AC", "Lighting Godox & Aputure");
  } else if (isBrand) {
    if (specsAttrs.sample_sizes_ready) headerTags.push(specsAttrs.sample_sizes_ready.length > 28 ? specsAttrs.sample_sizes_ready.slice(0, 28) + "..." : specsAttrs.sample_sizes_ready);
    if (specsAttrs.design_dna) headerTags.push(specsAttrs.design_dna.length > 28 ? specsAttrs.design_dna.slice(0, 28) + "..." : specsAttrs.design_dna);
    headerTags.push("Contemporary Ready-to-Wear", "Open Collaboration Brief", "PO & Invoice Resmi");
  } else if (isPhotog && !isVideo) {
    if (specsAttrs.primary_camera) headerTags.push(specsAttrs.primary_camera);
    if (Array.isArray(specsAttrs.lenses) && specsAttrs.lenses.length > 0) {
      headerTags.push(specsAttrs.lenses[0]);
    }
    if (specsAttrs.drone_aerial) headerTags.push("Drone Aerial Certified");
    headerTags.push("Editorial & Lookbook", "Studio & On-Location", "Retouching Presisi");
  } else if (isVideo && !isPhotog) {
    if (specsAttrs.primary_cinema_camera) headerTags.push(specsAttrs.primary_cinema_camera);
    if (specsAttrs.max_resolution) headerTags.push(specsAttrs.max_resolution);
    if (specsAttrs.drone_aerial) headerTags.push("Drone 4K Cinema");
    headerTags.push("Fashion Film & TVC", "Color Grading 10-Bit");
  } else if (isPhotog && isVideo) {
    if (specsAttrs.primary_camera || specsAttrs.primary_cinema_camera) {
      headerTags.push(specsAttrs.primary_camera || specsAttrs.primary_cinema_camera);
    }
    headerTags.push("Foto & Cinema Hybrid");
    if (specsAttrs.drone_aerial) headerTags.push("Drone Aerial Siap Terbang");
    headerTags.push("Editorial & Campaign");
  } else if (isMua) {
    if (Array.isArray(specsAttrs.makeup_styles) && specsAttrs.makeup_styles.length > 0) {
      headerTags.push(specsAttrs.makeup_styles[0]);
    } else {
      headerTags.push("High-Fashion Lookbook");
    }
    if (Array.isArray(specsAttrs.primary_kit_brands) && specsAttrs.primary_kit_brands.length > 0) {
      headerTags.push(`Pro Kit: ${specsAttrs.primary_kit_brands[0]}`);
    } else {
      headerTags.push("Pro Kit Luxury Brands");
    }
    if (specsAttrs.touchup_standby_hours) {
      headerTags.push(`Standby ${specsAttrs.touchup_standby_hours} Jam`);
    }
    headerTags.push("Higienitas Steril On-Set");
  } else if (isStylist) {
    if (Array.isArray(specsAttrs.styling_specialties) && specsAttrs.styling_specialties.length > 0) {
      headerTags.push(specsAttrs.styling_specialties[0]);
    } else {
      headerTags.push("Editorial Fashion Stylist");
    }
    if (specsAttrs.wardrobe_archive_count) {
      headerTags.push(`Arsip ${specsAttrs.wardrobe_archive_count}+ Busana`);
    }
    if (specsAttrs.aesthetic_dna) {
      headerTags.push(specsAttrs.aesthetic_dna.length > 28 ? specsAttrs.aesthetic_dna.slice(0, 28) + "..." : specsAttrs.aesthetic_dna);
    }
    headerTags.push("Garment Steamer & Fitting Kit");
  } else {
    if (Array.isArray(specsAttrs.specialties) && specsAttrs.specialties.length > 0) {
      headerTags.push(...specsAttrs.specialties.slice(0, 3));
    } else {
      headerTags.push("Editorial & Lookbook", "High-Fashion Campaign", "Komersial Terkurasi");
    }
  }

  const displayHeaderTags = Array.from(new Set(headerTags)).filter(Boolean).slice(0, 4);

  const pageContent = (
    <div className="w-full max-w-7xl mx-auto pb-24">
      {isGuest && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Mode Penampil Tamu
              </p>
            </div>
            <p className="text-xs text-slate-600">
              Anda sedang melihat profil portofolio kreator di RAMU. Masuk atau daftar akun untuk memulai kolaborasi resmi, kirim brief, dan booking talent.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/login?redirect=/directory/${actor.id}`}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-xs"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold rounded-full shadow-md shadow-[#4CC9FE]/25 transition-all"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-2xs transition-all w-fit group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Direktori</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* HERO SECTION: GLASS CARD CONTAINER                          */}
      {/* ============================================================ */}
      <section className="rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] p-6 sm:p-8 lg:p-10 mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left Column: Media Card with Badge & Verified Trust Strip */}
          <div className="w-full sm:w-72 md:w-80 shrink-0">
            <div className="aspect-[3/4] w-full bg-slate-100 border border-slate-200/80 rounded-2xl relative overflow-hidden shadow-sm group">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={actor.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : actor.owner?.avatarUrl ? (
                <img
                  src={actor.owner.avatarUrl}
                  alt={actor.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center text-4xl font-semibold tracking-tight">
                  {actor.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Owner hover quick-action to edit photo */}
              {isCurrentActor && (
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto">
                  <OpenEditModalButton
                    initialTab="profile"
                    label="Ubah Foto Profil"
                    className="btn-primary-pill !text-xs !py-2 !px-4 text-white shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    iconClassName="text-white"
                  />
                </div>
              )}

              {/* Role / Trust Micro Badge Overlay */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-800 shadow-xs border border-slate-200/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{cardOverlayBadge}</span>
                </span>
              </div>

              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[9px] font-semibold text-white shadow-xs border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>RAMU Ecosystem Verified</span>
                </span>
              </div>
            </div>

            {/* Trust Badge Strip */}
            <div className="mt-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Peer-Verified Co-Credit</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                100% Anti-Catfishing
              </span>
            </div>
          </div>

          {/* Right Column: Information, Badges, KPIs, Action Buttons */}
          <div className="flex-1 flex flex-col justify-between min-h-[360px] w-full">
            <div>
              {/* Role Pill & Availability status */}
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80">
                  {roleBadgeLabel}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {availabilityBadge}
                </span>
              </div>

              {/* Actor Name + Official Avatar Badge */}
              <div className="flex items-center gap-3.5 mb-3">
                <ActorAvatar
                  name={actor.name}
                  avatarUrl={actor.owner?.avatarUrl}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-200/90 bg-white shadow-xs shrink-0"
                  textClassName="text-base sm:text-lg font-bold"
                />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2.5">
                  <span>{actor.name}</span>
                </h1>
              </div>

              {/* Metadata Row (Location, Socials, Email) */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 mb-4">
                {actor.location && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{actor.location}</span>
                  </div>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instagram</span>
                  </a>
                )}
                {socialLinks.website && (
                  <a
                    href={socialLinks.website.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Website</span>
                  </a>
                )}
                {actor.contactEmail && (
                  <a
                    href={`mailto:${actor.contactEmail}`}
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors lowercase font-normal"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{actor.contactEmail}</span>
                  </a>
                )}
              </div>

              {/* Description / Bio */}
              <p className="text-sm font-normal text-slate-600 leading-relaxed max-w-2xl mb-4">
                {actor.description ||
                  `${actor.name} adalah entitas kreatif terverifikasi di ekosistem RAMU, berfokus pada kolaborasi komersial, produksi visual estetis, dan sinergi proyek industri busana kontemporer.`}
              </p>

              {/* Dynamic Role-Specific Specs & Capability Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                {displayHeaderTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/90 border border-slate-200/90 rounded-full text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 4-Metric KPI Grid */}
            <div className="space-y-5 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/70 backdrop-blur-md border border-white/90 rounded-[20px] shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {isStudio ? "Tarif Sewa" : isBrand ? "Skema Biaya" : "Estimasi Tarif"}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                    {startingRate}
                  </span>
                </div>
                <div className="space-y-0.5 sm:border-l border-slate-200/80 sm:pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Waktu Kerja
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                    {turnaroundTime}
                  </span>
                </div>
                <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-200/80 sm:pl-3 pt-2 sm:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {metric3Label}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                    {metric3Value}
                  </span>
                </div>
                <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-200/80 sm:pl-3 pt-2 sm:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {metric4Label}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-800 truncate block">
                    {metric4Value}
                  </span>
                </div>
              </div>

              {/* Action CTAs */}
              <div>
                {!isCurrentActor ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <ShareProfileButton actorId={actor.id} actorName={actor.name} />

                      {!isGuest ? (
                        <>
                          <BookingButton
                            targetId={actor.id}
                            targetName={actor.name}
                            targetSector={actor.sector}
                            targetType={actor.actorType}
                            label={
                              isBrand
                                ? "Ajukan Pitch Kolaborasi"
                                : isStudio
                                ? "Sewa Studio Sekarang"
                                : isModel
                                ? "Booking Model / Fitting"
                                : isMua
                                ? "Booking MUA & Hair Artist"
                                : isStylist
                                ? "Booking Fashion Stylist"
                                : isVideo
                                ? "Inisiasi Kerja Sama Video"
                                : "Booking Fotografer"
                            }
                            termsConfig={customTermsConfig}
                          />

                          <Link
                            href={`/messages?with=${actor.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 hover:bg-white text-[#0284c7] hover:text-[#0369a1] border border-[#4CC9FE]/40 hover:border-[#4CC9FE] text-xs font-bold rounded-full transition-all shadow-xs active:scale-95"
                            title="Kirim pesan langsung & diskusikan brief di dalam platform RAMU"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span>Chat &amp; Brief Proyek</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/login?redirect=/directory/${actor.id}`}
                          className="btn-primary-pill !text-xs !py-2.5 !px-6 shadow-md shadow-[#4CC9FE]/25 text-white font-bold flex items-center gap-2 active:scale-95 transition-all"
                        >
                          <span>Masuk untuk Kolaborasi</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                        </Link>
                      )}

                      {isBrand && (
                        <Link
                          href={`/projects?tab=browse&search=${encodeURIComponent(actor.name)}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200/90 hover:border-[#4CC9FE] text-slate-700 hover:text-[#0284c7] text-xs font-semibold rounded-full bg-white/90 hover:bg-slate-50 transition-all shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                          <span>Lihat Brief Proyek</span>
                        </Link>
                      )}

                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 border border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold rounded-full transition-all shadow-xs active:scale-95"
                          title={isStudio ? "Tanya ketersediaan jadwal studio via WhatsApp" : "Gunakan WhatsApp untuk konfirmasi darurat hari-H"}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp ({isStudio ? "Jadwal Studio" : "Darurat On-Set"})</span>
                        </a>
                      )}

                      {actor.contactEmail && !waLink && (
                        <a
                          href={`mailto:${actor.contactEmail}?subject=${encodeURIComponent(`Penawaran Proyek Kolaborasi - ${actor.name}`)}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200/90 hover:border-[#4CC9FE] text-slate-700 hover:text-[#0284c7] text-xs font-semibold rounded-full bg-white/90 hover:bg-slate-50 transition-all shadow-xs"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>Kirim Email</span>
                        </a>
                      )}

                      {!waLink && !actor.contactEmail && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100/80 border border-slate-200 text-[11px] font-semibold text-slate-600"
                          title="Kreator mengaktifkan proteksi privasi. Silakan gunakan Chat atau Booking resmi RAMU."
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                          <span>Kontak Privat Terproteksi</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Seluruh negosiasi, brief, dan SPK Kontrak Multi-Pihak resmi terlindungi aman dalam ekosistem RAMU.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <ShareProfileButton actorId={actor.id} actorName={actor.name} />
                    <OpenEditModalButton
                      initialTab="profile"
                      label="Edit Halaman Profil"
                    />
                    <Link
                      href="/dashboard/showcase"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#4CC9FE]/30 hover:border-[#4CC9FE] text-[#0284c7] hover:text-[#0369a1] text-xs font-bold rounded-full bg-white/90 hover:bg-white transition-all shadow-xs"
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

      {!isCurrentActor && !isGuest && (
        <div className="mb-8">
          <ProfileCompatibilityBanner
            targetActor={actor}
            currentActor={currentActor}
            termsConfig={customTermsConfig}
          />
        </div>
      )}

      <div className="pt-2">
        <ActorDetailTabs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actor={actorWithCoCredits as any}
          isCurrentActor={isCurrentActor}
          registeredActors={registeredActors}
          initialTab={initialTab}
          bookedDates={bookedDates}
          availabilityData={availabilityData}
        />
      </div>

      {!isCurrentActor && !isGuest && (
        <ActorMobileActionBar
          actor={actor}
          termsConfig={customTermsConfig}
        />
      )}
    </div>
  );

  if (isGuest || !currentActor) {
    return (
      <div className="min-h-screen app-background text-slate-900 font-sans selection:bg-[#4CC9FE]/25 selection:text-[#0284c7] relative">
        <Navbar />
        <main className="pt-28 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
          {pageContent}
        </main>
      </div>
    );
  }

  return (
    <AppShell actor={currentActor} activeRoute="/directory">
      {pageContent}
    </AppShell>
  );
}
