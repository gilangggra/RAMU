"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Sparkles,
  CalendarCheck,
  Star,
  Target,
  Search,
  Building2,
  MapPin,
  Mail,
  Globe,
  Package,
  ShieldAlert,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Zap,
  PlusCircle,
  Sliders,
  ArrowRight,
  CreditCard,
  Play,
  Film,
  Camera,
  Pencil,
  Gift,
  TrendingUp,
  Repeat,
  Handshake,
  Users,
} from "lucide-react";
import { ModelCompCard, ModelAttributes } from "./ModelCompCard";
import { StudioSpecsCard, StudioAttributes } from "./StudioSpecsCard";
import { BrandSpecsCard, BrandAttributes } from "./BrandSpecsCard";
import { PhotographerSpecsCard, PhotographerAttributes } from "./PhotographerSpecsCard";
import { DesignerSpecsCard, DesignerAttributes } from "./DesignerSpecsCard";
import { MuaSpecsCard } from "./MuaSpecsCard";
import { StylistSpecsCard } from "./StylistSpecsCard";
import { VideographerSpecsCard } from "./VideographerSpecsCard";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { BookingModal } from "./BookingModal";
import { TearSheetModal } from "@/components/showcase/TearSheetModal";
import { ShowcaseItem } from "@/application/showcaseService";
import { parseSocialLinks, InstagramIcon } from "@/lib/socialUtils";
import { ProfileSlideOverDrawer, DrawerTabType } from "./ProfileSlideOverDrawer";

interface ActorDetailTabsProps {
  actor: {
    id: string;
    name: string;
    actorType: string;
    sector: string;
    location?: string | null;
    description?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    websiteUrl?: string | null;
    owner?: {
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
    assets: Array<{
      id: string;
      name: string;
      category: string;
      subtype: string;
      roles: string[];
      description?: string | null;
      attributes?: Record<string, unknown> | null;
    }>;
    goals: Array<{
      id: string;
      title: string;
      category: string;
      description?: string | null;
    }>;
    needs: Array<{
      id: string;
      title: string;
      category: string;
      description?: string | null;
    }>;
    constraints: Array<{
      id: string;
      type: string;
      value?: number | null;
      unit?: string | null;
      severity: string;
      negotiability: string;
      notes?: string | null;
    }>;
    opportunityParticipations: Array<{
      opportunity: {
        id: string;
        title: string;
        patternCode: string;
        feasibilityStatus: string;
        scores: Array<{ overallScore: number }>;
      };
    }>;
    feedbacks: Array<{
      id: string;
      relevanceScore?: number | null;
      feasibilityScore?: number | null;
      noveltyScore?: number | null;
      usefulnessScore?: number | null;
      comments?: string | null;
      createdAt: Date | string;
    }>;
    _count: {
      assets: number;
      goals: number;
      needs: number;
      feedbacks: number;
      collaborationParticipations: number;
    };
    collaborationParticipations?: Array<{
      id: string;
      roleCode: string;
      status: string;
      joinedAt: Date | string;
      collaboration: {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        startedAt?: Date | string | null;
        completedAt?: Date | string | null;
        outcomes?: Array<{
          id: string;
          title: string;
          outcomeType: string;
          description?: string | null;
        }>;
        participants?: Array<{
          actor: {
            id: string;
            name: string;
            sector: string;
          };
        }>;
      };
    }>;
  };
  isCurrentActor: boolean;
  registeredActors?: Array<{
    id: string;
    name: string;
    sector: string;
    location: string | null;
  }>;
}

export function ActorDetailTabs({ actor, isCurrentActor, registeredActors }: ActorDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "rates" | "specs" | "collaborations" | "about" | "reviews">("portfolio");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedShowcaseIndex, setSelectedShowcaseIndex] = useState<number | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<string>("ALL");

  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTabType>("profile");

  useEffect(() => {
    if (isCurrentActor) {
      const editParam = searchParams.get("edit");
      if (editParam) {
        const paramLower = editParam.toLowerCase();
        if (paramLower === "profile") {
          setDrawerTab("profile");
          setIsDrawerOpen(true);
        } else if (paramLower === "portfolio" || paramLower === "porto") {
          setDrawerTab("portfolio");
          setIsDrawerOpen(true);
        } else if (paramLower === "rates" || paramLower === "tarif") {
          setDrawerTab("rates");
          setIsDrawerOpen(true);
        } else if (paramLower === "specs" || paramLower === "spesifikasi") {
          setDrawerTab("specs");
          setIsDrawerOpen(true);
        } else if (paramLower === "about" || paramLower === "contact" || paramLower === "tentang") {
          setDrawerTab("about");
          setIsDrawerOpen(true);
        } else if (paramLower === "reviews" || paramLower === "usulan" || paramLower === "ulasan") {
          setDrawerTab("reviews");
          setIsDrawerOpen(true);
        }
      }
    }
  }, [searchParams, isCurrentActor]);

  useEffect(() => {
    const handleOpenEdit = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: DrawerTabType }>;
      if (customEvent.detail?.tab) {
        setDrawerTab(customEvent.detail.tab);
      }
      setIsDrawerOpen(true);
    };

    window.addEventListener("open-edit-modal", handleOpenEdit);
    return () => {
      window.removeEventListener("open-edit-modal", handleOpenEdit);
    };
  }, []);

  const socialLinks = useMemo(() => parseSocialLinks(actor.websiteUrl), [actor.websiteUrl]);

  const modelAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("model") ||
      (a.attributes && typeof a.attributes === "object" && "comp_card" in a.attributes)
  );

  const studioAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("studio") ||
      (a.attributes && typeof a.attributes === "object" && "cyclorama_type" in a.attributes)
  );

  const brandAsset = actor.assets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("brand_gallery" in a.attributes || "design_dna" in a.attributes || "sample_sizes_ready" in a.attributes || "fabric_materials" in a.attributes || "capacity_monthly" in a.attributes)
  );

  const photographerAsset = actor.assets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("primary_camera" in a.attributes || "lenses" in a.attributes || "drone_aerial" in a.attributes)
  );

  const designerAsset = actor.assets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("primary_software" in a.attributes || "design_disciplines" in a.attributes || "deliverables" in a.attributes || "style_dna" in a.attributes)
  );

  const stylistAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("styl") ||
      (a.attributes && typeof a.attributes === "object" && ("styling_gallery" in a.attributes || "styling_specialties" in a.attributes || "onset_equipment" in a.attributes || "wardrobe_archive_count" in a.attributes))
  );

  const muaAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("mua") ||
      a.subtype.toLowerCase().includes("makeup") ||
      (a.attributes && typeof a.attributes === "object" && ("makeup_styles" in a.attributes || "primary_kit_brands" in a.attributes || "hair_specialties" in a.attributes || "sanitation_standards" in a.attributes))
  );

  const videographerAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("video") ||
      a.subtype.toLowerCase().includes("film") ||
      (a.attributes && typeof a.attributes === "object" && ("primary_cinema_camera" in a.attributes || "cine_lenses" in a.attributes || "stabilizer_gimbal" in a.attributes || "stabilization_rigs" in a.attributes))
  );

  const sectorLower = actor.sector.toLowerCase();
  const hasStudioSpaceAsset = actor.assets.some(
    (a) => a.category === "STUDIO_SPACE" || a.subtype.toLowerCase().includes("studio")
  );
  const isBrand = actor.actorType === "BRAND" || (actor.actorType as string) === "MSME" || actor.actorType === "COLLECTIVE" || Boolean(brandAsset) || sectorLower.includes("brand") || sectorLower.includes("label") || sectorLower.includes("umkm");
  const isIndividualSector = !isBrand && (
    sectorLower.includes("photographer") ||
    sectorLower.includes("fotografi") ||
    sectorLower.includes("model") ||
    sectorLower.includes("talent") ||
    sectorLower.includes("video") ||
    sectorLower.includes("film") ||
    sectorLower.includes("cinema") ||
    sectorLower.includes("mua") ||
    sectorLower.includes("makeup") ||
    sectorLower.includes("hair") ||
    sectorLower.includes("stylist") ||
    sectorLower.includes("wardrobe") ||
    sectorLower.includes("designer") ||
    sectorLower.includes("desain")
  );

  const isStudio = !isIndividualSector && !isBrand && (hasStudioSpaceAsset || Boolean(studioAsset) || actor.actorType === "STUDIO" || sectorLower.includes("studio"));
  const isModel = !isBrand && !isStudio && (Boolean(modelAsset) || sectorLower.includes("model") || sectorLower.includes("talent"));
  const isMUA = !isBrand && !isStudio && !isModel && (Boolean(muaAsset) || sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isBrand && !isStudio && !isModel && !isMUA && (Boolean(stylistAsset) || sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isVideographer = !isBrand && !isStudio && !isModel && !isMUA && !isStylist && (Boolean(videographerAsset) || sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isPhotographer = !isBrand && !isStudio && !isModel && !isMUA && !isStylist && !isVideographer && (Boolean(photographerAsset) || sectorLower.includes("photographer") || sectorLower.includes("fotografi"));
  const isDesigner = !isBrand && !isStudio && !isModel && !isMUA && !isStylist && !isVideographer && !isPhotographer && (Boolean(designerAsset) || sectorLower.includes("designer") || sectorLower.includes("desain"));

  const modelAttrs = modelAsset?.attributes as ModelAttributes | undefined;
  const studioAttrs = studioAsset?.attributes as StudioAttributes | undefined;
  const brandAttrs = brandAsset?.attributes as BrandAttributes | undefined;
  const photographerAttrs = photographerAsset?.attributes as PhotographerAttributes | undefined;
  const designerAttrs = designerAsset?.attributes as DesignerAttributes | undefined;

  const portfolioAssets = actor.assets.filter((a) => a.category === "PORTFOLIO_WORK");
  const otherAssets = actor.assets.filter((a) => a.category !== "PORTFOLIO_WORK");

  const actorInitials = actor.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const showcaseItems: ShowcaseItem[] = portfolioAssets.map((asset) => {
    const attrs = (asset.attributes as any) || {};
    let imageUrl = attrs.image_url;
    if (!imageUrl && attrs.brand_gallery && attrs.brand_gallery.length > 0) imageUrl = attrs.brand_gallery[0];
    if (!imageUrl && attrs.styling_gallery && attrs.styling_gallery.length > 0) imageUrl = attrs.styling_gallery[0];
    if (!imageUrl && attrs.comp_card && attrs.comp_card.images && attrs.comp_card.images.length > 0) imageUrl = attrs.comp_card.images[0];
    if (!imageUrl) {
      imageUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
    }

    const mediaType: "IMAGE" | "VIDEO" = attrs.media_type || (attrs.video_url ? "VIDEO" : "IMAGE");

    return {
      id: asset.id,
      title: asset.name,
      category: asset.subtype || actor.sector || "Komersial",
      imageUrl,
      mediaType,
      videoUrl: attrs.video_url || null,
      videoSource: attrs.video_source || (attrs.video_url ? "EXTERNAL" : null),
      aspectRatio: attrs.aspect_ratio || null,
      tearSheet: attrs.tear_sheet || null,
      actor: {
        id: actor.id,
        name: actor.name,
        sector: actor.sector,
        location: actor.location || null,
        description: actor.description || null,
        experienceLevel: null,
        aestheticStyles: [],
        compensationModels: [],
        initials: actorInitials,
        avatarBg: "from-amber-400 to-[#E66A48]",
      },
    };
  });

  const portfolioCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    let videoCount = 0;
    let photoCount = 0;

    portfolioAssets.forEach((asset) => {
      const attrs = (asset.attributes as any) || {};
      const isVid =
        attrs.media_type === "VIDEO" ||
        Boolean(attrs.video_url) ||
        asset.subtype?.toLowerCase().includes("video") ||
        asset.subtype?.toLowerCase().includes("film") ||
        asset.subtype?.toLowerCase().includes("cinema") ||
        (attrs.image_url && attrs.image_url.includes("img.youtube.com"));

      if (isVid) videoCount++;
      else photoCount++;

      const sub = asset.subtype || "Karya";
      counts[sub] = (counts[sub] || 0) + 1;
    });

    const categoryList = Object.entries(counts).map(([name, count]) => ({
      id: name,
      label: name,
      count,
    }));

    return {
      categoryList,
      videoCount,
      photoCount,
      totalCount: portfolioAssets.length,
    };
  }, [portfolioAssets]);

  const filteredPortfolioAssets = useMemo(() => {
    if (portfolioFilter === "ALL") return portfolioAssets;
    if (portfolioFilter === "VIDEO") {
      return portfolioAssets.filter((a) => {
        const attrs = (a.attributes as any) || {};
        return (
          attrs.media_type === "VIDEO" ||
          Boolean(attrs.video_url) ||
          a.subtype?.toLowerCase().includes("video") ||
          a.subtype?.toLowerCase().includes("film") ||
          a.subtype?.toLowerCase().includes("cinema") ||
          (attrs.image_url && attrs.image_url.includes("img.youtube.com"))
        );
      });
    }
    if (portfolioFilter === "PHOTO") {
      return portfolioAssets.filter((a) => {
        const attrs = (a.attributes as any) || {};
        const isVid =
          attrs.media_type === "VIDEO" ||
          Boolean(attrs.video_url) ||
          a.subtype?.toLowerCase().includes("video") ||
          a.subtype?.toLowerCase().includes("film") ||
          a.subtype?.toLowerCase().includes("cinema") ||
          (attrs.image_url && attrs.image_url.includes("img.youtube.com"));
        return !isVid;
      });
    }
    return portfolioAssets.filter((a) => (a.subtype || "Karya") === portfolioFilter);
  }, [portfolioAssets, portfolioFilter]);

  const explicitSpecialties: string[] = [];
  if (modelAttrs?.specialties) explicitSpecialties.push(...modelAttrs.specialties);
  if (photographerAttrs?.specialties) explicitSpecialties.push(...photographerAttrs.specialties);
  if (designerAttrs?.design_disciplines) explicitSpecialties.push(...designerAttrs.design_disciplines);

  for (const asset of actor.assets) {
    if (asset.category === "SKILL_TALENT") {
      explicitSpecialties.push(asset.name);
    } else if (
      asset.category !== "EQUIPMENT" &&
      asset.category !== "STUDIO_SPACE" &&
      asset.subtype &&
      !asset.subtype.toLowerCase().includes("kamera") &&
      !asset.subtype.toLowerCase().includes("lensa") &&
      !asset.subtype.toLowerCase().includes("lighting")
    ) {
      explicitSpecialties.push(asset.subtype);
    }
  }

  const uniqueSpecialties = Array.from(new Set(explicitSpecialties.filter(Boolean)));
  const displaySpecialties = uniqueSpecialties.length > 0
    ? uniqueSpecialties
    : [actor.sector, "Layanan Komersial", "Produksi Terverifikasi"];

  const totalReviews = actor.feedbacks.length;
  const avgRating = totalReviews > 0
    ? (
        actor.feedbacks.reduce((sum, f) => {
          const raw = (f as any).rating;
          if (typeof raw === "number") return sum + raw;
          const scores = [f.relevanceScore, f.feasibilityScore, f.noveltyScore, f.usefulnessScore].filter(
            (s): s is number => typeof s === "number"
          );
          const feedbackAvg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;
          return sum + feedbackAvg;
        }, 0) / totalReviews
      ).toFixed(1)
    : null;

  interface ServicePackage {
    title: string;
    subtitle: string;
    price: string;
    unit: string;
    popular?: boolean;
    features: string[];
  }

  const customServiceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && ("service_packages" in (a.attributes as any) || "terms_and_conditions" in (a.attributes as any)))
  );
  const customPackages = (customServiceAsset?.attributes as any)?.service_packages as ServicePackage[] | undefined;
  const customTermsConfig = (customServiceAsset?.attributes as any)?.terms_and_conditions || null;
  const hasCustomPackages = Boolean(customPackages && Array.isArray(customPackages) && customPackages.length > 0);

  let packages: ServicePackage[] = [];

  if (customPackages && Array.isArray(customPackages) && customPackages.length > 0) {
    packages = customPackages;
  } else if (isStudio) {
    packages = [
      {
        title: "Shift Setengah Hari",
        subtitle: "Sesi foto katalog, podcast, atau lookbook ringkas",
        price: "Rp 750.000",
        unit: "per 4 jam",
        features: [
          "Akses area cyclorama wall & ruang makeup",
          "Daya listrik 16.500 Watt (3-Phase)",
          "AC dingin & high-speed Wi-Fi",
          "1 Asisten studio standby",
        ],
      },
      {
        title: "Shift Penuh (Full-Day)",
        subtitle: "Pilihan utama untuk campaign lookbook & video komersial",
        price: "Rp 1.400.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Akses penuh seluruh area studio & fitting room",
          "Bebas ganti setup lighting & background seamless",
          "Free parking kru & loading barang mudah",
          "Termasuk 1 jam persiapan (setup/breakdown)",
          "2 Asisten studio standby",
        ],
      },
      {
        title: "Produksi Besar / 12 Jam",
        subtitle: "Untuk syuting iklan TVC, webseries, atau multi-brand",
        price: "Rp 2.200.000",
        unit: "per 12 jam",
        features: [
          "Prioritas jadwal & booking slot",
          "Izin pemakaian generator / heavy-duty lighting",
          "Overtime grace period 30 menit",
          "Akses pantry & ruang tunggu VIP",
        ],
      },
    ];
  } else if (isModel) {
    packages = [
      {
        title: "Katalog & E-Commerce",
        subtitle: "Foto produk katalog marketplace & webstore",
        price: "Rp 1.000.000",
        unit: "per 3-4 jam",
        features: [
          "Maksimal 15 look / pergantian busana",
          "Pose katalog bersih & profesional",
          "Pilihan eksposur tag akun Instagram",
          "Termasuk fitting sebelum sesi",
        ],
      },
      {
        title: "Kampanye Lookbook (Full Day)",
        subtitle: "Kampanye musiman koleksi baru label busana",
        price: "Rp 1.800.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Unlimited looks dalam durasi kerja",
          "Photoshoot indoor atau outdoor",
          "Hak tayang digital & media sosial 1 tahun",
          "Fleksibel untuk konsep editorial & avant-garde",
        ],
      },
      {
        title: "Video TVC & Brand Ambassador",
        subtitle: "Iklan komersial video, billboard, atau digital ads",
        price: "Rp 3.500.000",
        unit: "per proyek",
        features: [
          "Video acting & dialog / voiceover",
          "Hak guna komersial multi-channel (Ads & Billboard)",
          "1x Post feed & 2x Story endorsement",
          "Kontrak eksklusivitas kategori busana",
        ],
      },
    ];
  } else if (isMUA) {
    packages = [
      {
        title: "Makeup Katalog & Lookbook",
        subtitle: "Riasan natural glow & flawless untuk pemotretan busana",
        price: "Rp 800.000",
        unit: "per 4 jam",
        features: [
          "Maksimal 2-3 model katalog atau 1 model multi-look",
          "Produk high-end internasional & hypoallergenic",
          "Termasuk basic hair styling / hijab do",
          "Standby touch-up on-set selama sesi",
        ],
      },
      {
        title: "Editorial & Creative Glam",
        subtitle: "Konsep riasan editorial avant-garde untuk majalah & rilis koleksi",
        price: "Rp 1.500.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Eksplorasi riasan kreatif, graphic liner, atau aksen mutiara/foil",
          "Full hair styling & hairpiece integration",
          "Standby touch-up penuh di bawah lampu studio",
          "Termasuk pembersihan & ganti look on-set",
        ],
      },
      {
        title: "Kampanye Komersial & TVC",
        subtitle: "High-definition beauty makeup untuk kamera 4K dan iklan",
        price: "Rp 2.500.000",
        unit: "per proyek",
        features: [
          "Teknik makeup HD 4K tahan keringat & lighting panas",
          "Asistensi makeup artist standby seharian",
          "Hair restyling multi-adegan",
          "Termasuk konsultasi moodboard pra-produksi",
        ],
      },
    ];
  } else if (isStylist) {
    packages = [
      {
        title: "Lookbook & Catalog Styling",
        subtitle: "Kurasi padu padan outfit untuk pemotretan katalog",
        price: "Rp 1.200.000",
        unit: "per 4 jam",
        features: [
          "Kurasi gaya hingga 8 look busana siap pakai",
          "Disediakan garment steamer & peralatan fitting on-set",
          "Peminjaman aksesoris & sepatu pendukung esensial",
          "Penjagaan kerapian busana selama di depan kamera",
        ],
      },
      {
        title: "Kampanye Musiman Koleksi",
        subtitle: "Pengarahan gaya komprehensif kampanye rilis busana baru",
        price: "Rp 2.200.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Moodboard konsep styling & palet warna selaras DNA brand",
          "Kurasi 15-20 look head-to-toe lengkap",
          "Akses pulling wardrobe & perhiasan desainer lokal",
          "Manajemen wardrobe on-set tanpa noda & rapi",
        ],
      },
      {
        title: "Creative Direction & Sourcing",
        subtitle: "Konseptualisasi tema rilis brand dan kurasi editorial besar",
        price: "Rp 4.000.000",
        unit: "per proyek",
        features: [
          "Perancangan visual identity kampanye dari nol",
          "Sourcing koleksi vintage archive & kain wastra langka",
          "Supervisi langsung wardrobe di set pemotretan",
          "Arahan lookbook digital & panduan gaya katalog",
        ],
      },
    ];
  } else if (isVideographer) {
    packages = [
      {
        title: "Reels & TikTok Cinematic",
        subtitle: "Video fashion vertikal 9:16 untuk media sosial",
        price: "Rp 1.800.000",
        unit: "per 4 jam",
        features: [
          "1-2 Video reels sinematik durasi 30-45 detik",
          "Kamera sinema 4K + Gimbal stabilization",
          "Color grading khas seluloid / warm tone",
          "Lisensi musik komersial legal (tanpa copyright strike)",
        ],
      },
      {
        title: "Fashion Film & Campaign Video",
        subtitle: "Video kampanye sinematik lookbook untuk rilis koleksi",
        price: "Rp 3.500.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "1 Master film 4K (16:9) + 2 Cutdowns Reels (9:16)",
          "Lighting kit continuous bawaan + wireless mic",
          "Storyboarding & arahan visual on-set",
          "Gratis 2x revisi color grading & offline edit",
          "Delivery cepat 4-5 hari kerja",
        ],
      },
      {
        title: "Iklan TVC / Commercial Brand Video",
        subtitle: "Produksi video iklan komersial skala penuh",
        price: "Rp 6.000.000",
        unit: "per proyek",
        features: [
          "Setup multi-kamera 4K 10-bit ProRes + Drone aerial",
          "Full audio field recording 32-bit float",
          "Color grading ACES standar bioskop di DaVinci Resolve",
          "Full commercial broadcast & advertising license",
        ],
      },
    ];
  } else if (isPhotographer) {
    packages = [
      {
        title: "Paket Lookbook Half-Day",
        subtitle: "Sesi foto lookbook esensial untuk emerging brand",
        price: "Rp 1.500.000",
        unit: "per 4 jam",
        features: [
          "1 Kamera profesional + Lensa prime/zoom",
          "15 Foto final retouch resolusi tinggi",
          "Semua file mentah (RAW / JPEG preview) via Drive H+1",
          "Delivery hasil akhir 3-4 hari kerja",
        ],
      },
      {
        title: "Paket Kampanye Komersial",
        subtitle: "Produksi visual lookbook lengkap untuk rilis koleksi",
        price: "Rp 2.800.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "2 Kamera profesional + Full lighting kit bawaan",
          "40 Foto final retouch komersial majalah",
          "Color grading custom sesuai DNA brand Anda",
          "Gratis 2x revisi minor",
          "Full commercial license",
        ],
      },
      {
        title: "Foto + Teaser Video Reels",
        subtitle: "Paket visual all-in-one foto dan video media sosial",
        price: "Rp 4.200.000",
        unit: "per proyek",
        features: [
          "Seluruh fitur Paket Kampanye Komersial",
          "1 Video Reels / TikTok cinematic 30-45 detik",
          "Audio mastering berlisensi komersial",
          "Delivery prioritas 2-3 hari kerja",
        ],
      },
    ];
  } else if (isDesigner) {
    packages = [
      {
        title: "Konsultasi Desain & Moodboard",
        subtitle: "Pengembangan konsep visual dan pemilihan material",
        price: "Rp 1.500.000",
        unit: "per sesi",
        features: [
          "Diskusi siluet desain & tren pasar",
          "Pemilihan swatch kain & palet warna",
          "Sketsa desain digital 2D",
          "Panduan spesifikasi teknis (tech-pack)",
        ],
      },
      {
        title: "Pembuatan Pola & Sampel (Toille)",
        subtitle: "Pengerjaan prototipe fisik busana pertama siap fitting",
        price: "Rp 2.800.000",
        unit: "per koleksi",
        popular: true,
        features: [
          "Pembuatan pola presisi (pattern making)",
          "Pengerjaan sampel fisik busana (toille)",
          "1x Sesi fitting model & revisi ukuran",
          "Standar jahitan atelier rapi",
        ],
      },
      {
        title: "Produksi Koleksi Kapsul",
        subtitle: "Produksi busana siap pakai dalam kuota batch terbatas",
        price: "Mulai Rp 6.000.000",
        unit: "per batch",
        features: [
          "Grading ukuran lengkap (S, M, L)",
          "Pengawasan mutu (QC) ketat setiap pakaian",
          "Packaging & label placement",
          "Jaminan hak cipta desain orisinal",
        ],
      },
    ];
  } else {
    packages = [
      {
        title: "Paket Layanan Standar",
        subtitle: "Jasa profesional sesuai kebutuhan proyek awal",
        price: "Rp 1.200.000",
        unit: "per sesi",
        features: [
          "Konsultasi brief & referensi visual",
          "Pengerjaan terstandar profesional",
          "Delivery output via Google Drive",
          "Gratis 1x revisi minor",
        ],
      },
      {
        title: "Paket Proyek Lengkap",
        subtitle: "Pengerjaan komprehensif dari konsep hingga final",
        price: "Rp 2.500.000",
        unit: "per proyek",
        popular: true,
        features: [
          "Arahan kreatif & moodboard konsep",
          "Eksekusi penuh dengan standar industri",
          "Output resolusi tinggi siap cetak & digital",
          "Gratis 2x revisi komprehensif",
          "Hak cipta komersial penuh",
        ],
      },
      {
        title: "Paket Produksi Khusus",
        subtitle: "Kustomisasi untuk volume produksi atau kampanye multi-tahap",
        price: "Mulai Rp 4.000.000",
        unit: "kustom",
        features: [
          "Penyesuaian timeline & kontrak resmi",
          "Prioritas waktu kerja tim",
          "Dukungan asistensi intensif",
          "Perjanjian kerahasiaan (NDA) jika diperlukan",
        ],
      },
    ];
  }

  const specsTabLabel = isStudio
    ? "Fasilitas & Ruangan"
    : isPhotographer
    ? "Kamera & Lighting Gear"
    : isVideographer
    ? "Cinema Gear & Video Suite"
    : isModel
    ? "Comp Card & Fisik Agensi"
    : isMUA
    ? "Makeup Kit & Standar Rias"
    : isStylist
    ? "Wardrobe & Alat Styling"
    : isDesigner
    ? "Disiplin & Material Desain"
    : isBrand
    ? "Katalog & Identitas Brand"
    : "Spesifikasi Teknis & Alat";



  const totalCollaborationsCount = (actor.needs?.length || 0) + (actor.collaborationParticipations?.length || 0);

  const tabs = [
    {
      id: "portfolio" as const,
      label: "Portofolio",
    },
    {
      id: "rates" as const,
      label: isBrand ? "Kerjasama" : "Tarif",
    },
    {
      id: "specs" as const,
      label: isBrand ? "Identitas Brand" : "Spesifikasi",
    },
    ...(isBrand || totalCollaborationsCount > 0
      ? [
          {
            id: "collaborations" as const,
            label: `Kebutuhan & Proyek (${totalCollaborationsCount})`,
          },
        ]
      : []),
    {
      id: "about" as const,
      label: "Tentang",
    },
    {
      id: "reviews" as const,
      label: totalReviews > 0 ? `Ulasan (${totalReviews})` : "Ulasan",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="w-full flex items-center gap-8 overflow-x-auto no-scrollbar border-b border-stone-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                isActive
                  ? "text-[#1E1B2E] border-b-2 border-[#1E1B2E]"
                  : "text-stone-400 hover:text-stone-600 border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "portfolio" && (
        <div className="space-y-8">

          {portfolioAssets.length > 0 ? (
            <div className="space-y-4">

              <div className="p-3.5 rounded-none bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent border border-emerald-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-none bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950 block">
                      Portofolio Terverifikasi Bebas Catfishing (Peer-Verified Co-Credit)
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Setiap karya diverifikasi silang bersama kru produksi di set untuk memastikan 100% orisinalitas tanpa materi curian.
                    </span>
                  </div>
                </div>
                <span className="self-start sm:self-auto px-2.5 py-1 rounded-none bg-emerald-100 text-emerald-900 font-mono text-[10px] font-black border border-emerald-300 shrink-0">
                  ANTI-CATFISHING CERTIFIED
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stone-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                    Galeri Hasil Karya &amp; Proyek Komersial ({portfolioAssets.length})
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-stone-400 font-medium hidden sm:block">Klik karya untuk inspeksi kru &amp; tear-sheet</span>
                  {isCurrentActor && (
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "portfolio" } }));
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Karya</span>
                    </button>
                  )}
                </div>
              </div>

              {(portfolioCategories.categoryList.length > 1 || (portfolioCategories.videoCount > 0 && portfolioCategories.photoCount > 0)) && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    type="button"
                    onClick={() => setPortfolioFilter("ALL")}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none border rounded-none ${
                      portfolioFilter === "ALL"
                        ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                        : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200"
                    }`}
                  >
                    <span>Semua</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 ${portfolioFilter === "ALL" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                      {portfolioCategories.totalCount}
                    </span>
                  </button>

                  {portfolioCategories.categoryList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPortfolioFilter(cat.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none border rounded-none whitespace-nowrap ${
                        portfolioFilter === cat.id
                          ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                          : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 ${portfolioFilter === cat.id ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}

                  {portfolioCategories.videoCount > 0 && !portfolioCategories.categoryList.some((c) => c.id.toLowerCase().includes("video")) && (
                    <button
                      type="button"
                      onClick={() => setPortfolioFilter("VIDEO")}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none border rounded-none whitespace-nowrap ${
                        portfolioFilter === "VIDEO"
                          ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                          : "bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200"
                      }`}
                    >
                      <Film className="w-3 h-3 text-amber-500" />
                      <span>Video</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 ${portfolioFilter === "VIDEO" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"}`}>
                        {portfolioCategories.videoCount}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {filteredPortfolioAssets.length > 0 ? (
                <div
                  className={
                    filteredPortfolioAssets.length === 1
                      ? "max-w-xl mx-auto"
                      : filteredPortfolioAssets.length === 2
                      ? "columns-1 sm:columns-2 gap-4 max-w-4xl mx-auto"
                      : "columns-1 sm:columns-2 lg:columns-3 gap-4"
                  }
                >
                  {filteredPortfolioAssets.map((asset) => {
                    const originalIndex = showcaseItems.findIndex((item) => item.id === asset.id);
                    const targetIndex = originalIndex !== -1 ? originalIndex : 0;
                    const attrs = (asset.attributes as any) || {};
                    const isVideo =
                      attrs.media_type === "VIDEO" ||
                      Boolean(attrs.video_url) ||
                      asset.subtype?.toLowerCase().includes("video") ||
                      asset.subtype?.toLowerCase().includes("film") ||
                      asset.subtype?.toLowerCase().includes("cinema") ||
                      (attrs.image_url && attrs.image_url.includes("img.youtube.com"));

                    const isDirectVideo =
                      isVideo &&
                      attrs.video_url &&
                      (/\.(mp4|webm|mov)(\?.*)?$/i.test(attrs.video_url) ||
                        attrs.video_url.startsWith("/uploads/portfolios/videos/"));

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedShowcaseIndex(targetIndex)}
                        className="break-inside-avoid mb-4 group relative block overflow-hidden rounded-none bg-stone-100 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer select-none"
                      >
                        {isDirectVideo && attrs.video_url && (
                          <video
                            src={attrs.video_url}
                            muted
                            loop
                            playsInline
                            preload="none"
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                            className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-none"
                          />
                        )}

                        {attrs?.image_url ? (
                          <img
                            src={attrs.image_url}
                            alt={asset.name}
                            className="w-full h-auto object-cover rounded-none block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] flex items-center justify-center text-stone-400 bg-stone-100">
                            <Sparkles className="w-8 h-8 opacity-50" />
                          </div>
                        )}

                        {isVideo && (
                          <div className="absolute top-2.5 right-2.5 z-20 w-7 h-7 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-stone-50 border border-stone-200 rounded-none space-y-2">
                  <p className="text-xs text-stone-500">Tidak ada karya yang sesuai dengan kategori ini.</p>
                  <button
                    type="button"
                    onClick={() => setPortfolioFilter("ALL")}
                    className="text-xs font-bold text-[#E66A48] hover:underline cursor-pointer"
                  >
                    Tampilkan Semua Karya
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-stone-50 border border-stone-200/80 rounded-none space-y-3">
              <Sparkles className="w-8 h-8 text-stone-300 mx-auto" />
              <h4 className="text-base font-semibold text-[#1E1B2E]">Portofolio Terdaftar Sedang Diselaraskan</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Karya portofolio resolusi tinggi dapat dilihat pada kartu spesifikasi teknis dan media sosial resmi kreator.
              </p>
              {isCurrentActor && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "portfolio" } }));
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-black transition-colors cursor-pointer"
                  >
                    + Unggah Portofolio Sekarang
                  </button>
                  <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 text-[#1E1B2E] text-xs font-bold uppercase tracking-wider rounded-none hover:bg-stone-50 transition-colors"
                  >
                    Studio Showcase &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {isModel && modelAttrs?.comp_card && modelAttrs.comp_card.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">Foto Comp-Card Editorial</h3>
                {isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#1E1B2E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Comp Card</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {modelAttrs.comp_card.map((item, i) => (
                  <div key={i} className="aspect-[3/4] rounded-none overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={item.url} alt={item.caption || `Comp card ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isBrand && brandAttrs?.brand_gallery && brandAttrs.brand_gallery.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">Galeri Koleksi Brand</h3>
                {isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#1E1B2E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Galeri Brand</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {brandAttrs.brand_gallery.map((item, i) => (
                  <div key={i} className="aspect-[4/5] rounded-none overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={item.url} alt={item.title || `Brand lookbook ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "rates" && isBrand && (
        <div className="space-y-8">
          {/* BRAND: Header Kerjasama */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Jenis Kerjasama & Kolaborasi Terbuka
              </h3>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isCurrentActor && (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "rates" } }));
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Atur Preferensi Kerjasama</span>
                </button>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terbuka Kolaborasi</span>
              </div>
            </div>
          </div>

          {/* Jenis Kerjasama Cards */}
          {(() => {
            const brandCollabAsset = actor.assets.find(
              (a) => a.attributes && typeof a.attributes === "object" && "collab_types" in (a.attributes as any)
            );
            const collabAttrs = (brandCollabAsset?.attributes as any) || {};
            const collabTypes: string[] = Array.isArray(collabAttrs.collab_types)
              ? collabAttrs.collab_types
              : ["Paid Campaign", "Product Seeding / Gifting", "Revenue Share / Affiliate"];
            const budgetRange: string = collabAttrs.budget_range || "Sesuai brief & scope proyek";
            const timeline: string = collabAttrs.collab_timeline || "2 – 4 Minggu per Kampanye";
            const creatorRequirements: string = collabAttrs.creator_requirements || "Fotografer & Model Fashion, min. portofolio editorial";
            const collabNotes: string = collabAttrs.collab_notes || "";

            const renderCollabIcon = (type: string) => {
              switch (type) {
                case "Paid Campaign":
                  return <CreditCard className="w-5 h-5 text-stone-700" />;
                case "Product Seeding / Gifting":
                  return <Gift className="w-5 h-5 text-stone-700" />;
                case "Revenue Share / Affiliate":
                  return <TrendingUp className="w-5 h-5 text-stone-700" />;
                case "Barter / Trade for Content":
                  return <Repeat className="w-5 h-5 text-stone-700" />;
                case "Co-Branding & Kolaborasi Koleksi":
                  return <Handshake className="w-5 h-5 text-stone-700" />;
                case "Casting Open":
                  return <Users className="w-5 h-5 text-stone-700" />;
                default:
                  return <Target className="w-5 h-5 text-stone-700" />;
              }
            };

            return (
              <>
                {/* Tipe Kerjasama */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {collabTypes.map((type, idx) => (
                    <div key={idx} className="p-5 bg-white border border-stone-200/80 shadow-xs space-y-2 hover:border-[#1E1B2E] transition-colors">
                      <div className="w-9 h-9 rounded bg-stone-100 flex items-center justify-center text-stone-700 mb-1">
                        {renderCollabIcon(type)}
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#1E1B2E]">{type}</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {type === "Paid Campaign" && "Kreator dibayar sesuai rate card. Cocok untuk campaign terstruktur dengan brief yang jelas."}
                        {type === "Product Seeding / Gifting" && "Brand mengirimkan produk gratis kepada kreator pilihan untuk konten organik tanpa kewajiban posting."}
                        {type === "Revenue Share / Affiliate" && "Kreator mendapatkan komisi dari setiap konversi/penjualan yang dihasilkan melalui kode unik mereka."}
                        {type === "Barter / Trade for Content" && "Pertukaran nilai: brand menyediakan produk/jasa, kreator menyediakan konten berkualitas."}
                        {type === "Co-Branding & Kolaborasi Koleksi" && "Kerjasama desain koleksi bersama antara brand dan kreator/desainer untuk rilis terbatas."}
                        {type === "Casting Open" && "Brand membuka casting terbuka untuk model, fotografer, atau kreator untuk proyek tertentu."}
                        {!["Paid Campaign", "Product Seeding / Gifting", "Revenue Share / Affiliate", "Barter / Trade for Content", "Co-Branding & Kolaborasi Koleksi", "Casting Open"].includes(type) && "Jenis kerjasama terbuka sesuai kesepakatan bersama."}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-stone-50 border border-stone-200/60 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Budget / Kompensasi</span>
                    <p className="text-sm font-bold text-[#1E1B2E]">{budgetRange}</p>
                    <p className="text-[11px] text-stone-500">Bervariasi per jenis kolaborasi</p>
                  </div>
                  <div className="p-5 bg-stone-50 border border-stone-200/60 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Timeline Kampanye</span>
                    <p className="text-sm font-bold text-[#1E1B2E]">{timeline}</p>
                    <p className="text-[11px] text-stone-500">Dari brief hingga publikasi konten</p>
                  </div>
                  <div className="p-5 bg-stone-50 border border-stone-200/60 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Sistem Kontrak</span>
                    <p className="text-sm font-bold text-[#1E1B2E]">Invoice Resmi & PO</p>
                    <p className="text-[11px] text-stone-500">Dilindungi perjanjian tertulis</p>
                  </div>
                </div>

                {/* Persyaratan Kreator */}
                <div className="p-5 bg-white border border-stone-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Target className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1E1B2E]">Profil Kreator yang Dicari</h4>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{creatorRequirements}</p>
                  {collabNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                      <strong className="font-bold">Catatan:</strong> {collabNotes}
                    </div>
                  )}
                </div>

                {/* Kebutuhan Talenta & Brief Brand (Jika ada) */}
                {actor.needs && actor.needs.length > 0 && (
                  <div className="p-5 bg-white border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1E1B2E]">
                          Kebutuhan Talenta &amp; Brief Terbuka ({actor.needs.length})
                        </h4>
                      </div>
                      <Link
                        href={`/projects?tab=browse&search=${encodeURIComponent(actor.name)}`}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider inline-flex items-center gap-1"
                      >
                        <span>Jelajahi di Hub Proyek</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {actor.needs.map((need) => (
                        <div key={need.id} className="p-3.5 bg-stone-50 border border-stone-200/70 space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 inline-block">
                            {need.category}
                          </span>
                          <h5 className="text-xs font-bold text-[#1E1B2E]">{need.title}</h5>
                          {need.description && (
                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">{need.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Ajukan Proposal / Pitch */}
                <div className="p-5 bg-[#1E1B2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Tertarik berkolaborasi dengan {actor.name}?</h4>
                    <p className="text-[11px] text-stone-300">Kirimkan portofolio dan konsep proposal singkat Anda melalui formulir kemitraan resmi RAMU.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {!isCurrentActor && (
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(true)}
                        className="px-6 py-3 bg-white text-[#1E1B2E] text-xs font-black uppercase tracking-widest hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Ajukan Pitch Kolaborasi</span>
                      </button>
                    )}
                    <Link
                      href={`/projects?tab=browse&search=${encodeURIComponent(actor.name)}`}
                      className="px-5 py-3 border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Lihat Brief Proyek</span>
                    </Link>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {activeTab === "rates" && !isBrand && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Pilihan Paket &amp; Estimasi Tarif
              </h3>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isCurrentActor && (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "rates" } }));
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Atur Paket &amp; Tarif Saya</span>
                </button>
              )}
              {hasCustomPackages ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tarif Terverifikasi Talenta</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-stone-100 text-stone-600 text-xs font-semibold border border-stone-200">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Acuan Kisaran Industri</span>
                </div>
              )}
            </div>
          </div>

          {!hasCustomPackages && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Klien:</strong> Paket di bawah merupakan acuan standar industri untuk sektor {actor.sector}. Nilai kompensasi final dapat disepakati secara langsung berdasarkan kebutuhan brief dan durasi sesi.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-none border transition-all duration-300 ${
                  pkg.popular
                    ? "bg-white border-[#1E1B2E] shadow-xl ring-1 ring-[#1E1B2E]"
                    : "bg-white border-stone-200/80 shadow-xs hover:border-stone-400"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#1E1B2E] text-white text-[9px] font-bold uppercase tracking-widest rounded-none shadow-xs">
                    Paling Banyak Dipilih
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-[#1E1B2E] tracking-tight">{pkg.title}</h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{pkg.subtitle}</p>
                  </div>

                  <div className="pt-2 pb-4 border-y border-stone-100">
                    <div className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
                      {pkg.price}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">
                      {pkg.unit}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Rincian Layanan &amp; Output:
                    </span>
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-stone-600 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  {!isCurrentActor ? (
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(true)}
                      className={`w-full py-3 text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        pkg.popular
                          ? "bg-[#1E1B2E] hover:bg-black text-white shadow-sm"
                          : "bg-stone-100 hover:bg-stone-200 text-[#1E1B2E]"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Sewa Paket Ini</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "rates" } }));
                      }}
                      className="w-full py-3 text-xs font-bold uppercase tracking-widest rounded-none bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Ubah Tarif Saya</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-none bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[#1E1B2E] block">Butuh paket khusus atau brief di luar daftar?</span>
              <p className="text-stone-500">
                Anda dapat menentukan sendiri estimasi anggaran dan durasi kerja melalui formulir Sewa Jasa Langsung.
              </p>
            </div>
            {!isCurrentActor && (
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="px-5 py-2.5 bg-white border border-stone-300 hover:border-[#1E1B2E] text-[#1E1B2E] font-bold text-xs uppercase tracking-wider rounded-none transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Ajukan Brief Kustom &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "specs" && (
        <div className="space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Kartu Spesifikasi Teknis
              </h3>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Spesifikasi</span>
              </button>
            )}
          </div>

          {isStudio && (
            <StudioSpecsCard attributes={studioAttrs || {}} studioName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isPhotographer && (
            <PhotographerSpecsCard attributes={photographerAttrs || {}} actorName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isVideographer && (
            <VideographerSpecsCard attributes={(videographerAsset?.attributes as any) || {}} actorName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isModel && (
            <ModelCompCard attributes={modelAttrs || {}} actorName={actor.name} avatarUrl={actor.owner?.avatarUrl} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isMUA && (
            <MuaSpecsCard attributes={(muaAsset?.attributes as any) || {}} actorName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isStylist && (
            <StylistSpecsCard attributes={(stylistAsset?.attributes as any) || {}} actorName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isDesigner && (
            <DesignerSpecsCard attributes={designerAttrs || {}} actorName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {isBrand && !isStudio && !isModel && !isPhotographer && !isDesigner && !isVideographer && !isMUA && !isStylist && (
            <BrandSpecsCard attributes={brandAttrs || {}} brandName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {otherAssets.length > 0 && (
            <div className="p-7 sm:p-8 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Package className="w-4 h-4 text-stone-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Inventaris Alat &amp; Fasilitas Terverifikasi ({otherAssets.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherAssets.map((asset) => {
                  const attrs = (asset.attributes && typeof asset.attributes === "object") ? (asset.attributes as Record<string, unknown>) : null;
                  return (
                    <div
                      key={asset.id}
                      className="p-4 rounded-none bg-stone-50/70 border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {asset.category} • {asset.subtype}
                        </span>
                        <h4 className="font-bold text-[#1E1B2E] text-sm">{asset.name}</h4>
                        {asset.description && (
                          <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2">{asset.description}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-none bg-white border border-stone-200 text-[10px] font-bold text-emerald-700 shrink-0 flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Siap Pakai
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "collaborations" && (
        <div className="space-y-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Kebutuhan Terbuka, Target &amp; Rekam Jejak Proyek
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Kebutuhan kolaborator dan arah karya yang sedang dicari, serta histori proyek bersama di ekosistem RAMU.
              </p>
            </div>
            {isCurrentActor && (
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs"
              >
                <span>+ Buat Project Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seksi 1: Kebutuhan Mitra Kolaboratif Terbuka */}
            <div className="p-7 sm:p-8 bg-white border border-stone-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                    Kebutuhan Kolaborator Terbuka
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200">
                  {actor.needs.length} Dicari
                </span>
              </div>

              {actor.needs.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 italic space-y-2 bg-stone-50 border border-dashed border-stone-200">
                  <p>Saat ini belum ada kebutuhan mitra terbuka yang dicantumkan.</p>
                  {!isCurrentActor && (
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 text-stone-900 font-semibold text-xs not-italic hover:bg-stone-50 cursor-pointer"
                    >
                      <span>Ajukan Penawaran Proyek Langsung</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {actor.needs.map((need) => (
                    <div
                      key={need.id}
                      className="p-4 bg-stone-50/70 border border-stone-200/90 text-xs space-y-2 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 uppercase tracking-wider">
                          {need.category}
                        </span>
                        {!isCurrentActor && (
                          <button
                            type="button"
                            onClick={() => setIsBookingOpen(true)}
                            className="text-[11px] font-bold text-[#1E1B2E] hover:text-amber-600 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Tanggapi</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <h5 className="font-bold text-[#1E1B2E] text-sm leading-snug">{need.title}</h5>
                      {need.description && (
                        <p className="text-stone-500 text-xs leading-relaxed">{need.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seksi 2: Target & Arah Pertumbuhan Kreatif */}
            <div className="p-7 sm:p-8 bg-white border border-stone-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                    Target &amp; Arah Karya
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200">
                  {actor.goals.length} Sasaran
                </span>
              </div>

              {actor.goals.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 italic space-y-2 bg-stone-50 border border-dashed border-stone-200">
                  <p>Kreator belum mempublikasikan target karya spesifik.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actor.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-4 bg-stone-50/70 border border-stone-200/90 text-xs space-y-2 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 uppercase tracking-wider">
                          {goal.category}
                        </span>
                      </div>
                      <h5 className="font-bold text-[#1E1B2E] text-sm leading-snug">{goal.title}</h5>
                      {goal.description && (
                        <p className="text-stone-500 text-xs leading-relaxed">{goal.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Seksi 3: Histori Proyek Kolaborasi & Luaran Terverifikasi */}
          <div className="p-7 sm:p-8 bg-white border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Rekam Jejak Proyek Kolaboratif Resmi RAMU
                </h4>
              </div>
              <span className="text-xs text-stone-500 font-light">
                {actor.collaborationParticipations?.length || 0} Proyek Terdaftar
              </span>
            </div>

            {(!actor.collaborationParticipations || actor.collaborationParticipations.length === 0) ? (
              <div className="p-8 text-center text-xs text-stone-400 italic space-y-2 bg-stone-50 border border-dashed border-stone-200">
                <p>Belum ada proyek kolaborasi multi-pihak yang tercatat secara resmi di RAMU.</p>
                <p className="not-italic text-stone-500 text-[11px]">
                  Kolaborasi yang diinisiasi melalui Project Briefs dan disepakati dengan SPK Digital akan tercatat otomatis di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actor.collaborationParticipations.map((part) => (
                  <div
                    key={part.id}
                    className="p-5 bg-stone-50/70 border border-stone-200/90 text-xs space-y-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 uppercase tracking-wider">
                        Peran: {part.roleCode}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500">
                        {part.collaboration.status}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-[#1E1B2E] text-base leading-snug">
                        {part.collaboration.title}
                      </h5>
                      {part.collaboration.description && (
                        <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                          {part.collaboration.description}
                        </p>
                      )}
                    </div>

                    {part.collaboration.outcomes && part.collaboration.outcomes.length > 0 && (
                      <div className="pt-2 border-t border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                          Luaran Nyata Terverifikasi:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {part.collaboration.outcomes.map((o) => (
                            <span
                              key={o.id}
                              className="text-[10px] font-bold bg-white border border-stone-200 px-2 py-0.5 text-stone-800 inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{o.title} ({o.outcomeType})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {part.collaboration.participants && part.collaboration.participants.length > 0 && (
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                        <span className="truncate max-w-[200px]">
                          Mitra: {part.collaboration.participants.map((p) => p.actor.name).join(", ")}
                        </span>
                        <Link
                          href={`/collaborations/${part.collaboration.id}`}
                          className="font-bold text-[#1E1B2E] hover:text-emerald-700 inline-flex items-center gap-1 shrink-0"
                        >
                          <span>Buka Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div className="space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Profil &amp; Pengalaman Profesional
              </h3>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "about" } }));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profil</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-6">
              <div className="p-7 sm:p-8 bg-white border border-stone-200/80 rounded-none space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Profil &amp; Pengalaman Profesional
                  </div>
                </div>
                <div className="text-sm font-light text-[#1E1B2E] leading-relaxed">
                  {actor.description || "Kreator dan pelaku industri terverifikasi di ekosistem RAMU Indonesia."}
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Bidang Keahlian &amp; Layanan Utama:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displaySpecialties.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-none bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>


            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Informasi Verifikasi
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Tipe Entitas:</span>
                    <span className="font-bold text-[#1E1B2E]">{actor.actorType}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Sektor:</span>
                    <span className="font-bold text-[#1E1B2E]">{actor.sector}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Domisili:</span>
                    <span className="font-bold text-[#1E1B2E]">{actor.location || "Indonesia"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Status Akun:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Terverifikasi Aktif</span>
                    </span>
                  </div>
                  {socialLinks.instagram && (
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-stone-500">Instagram:</span>
                      <a
                        href={socialLinks.instagram.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#1E1B2E] hover:underline flex items-center gap-1.5"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>Instagram</span>
                      </a>
                    </div>
                  )}
                  {socialLinks.website && (
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-stone-500">Website:</span>
                      <a
                        href={socialLinks.website.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#1E1B2E] hover:underline flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-stone-400" />
                        <span>Website</span>
                      </a>
                    </div>
                  )}
                </div>

                {!isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full mt-2 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>
                      {isBrand
                        ? "Ajukan Kolaborasi Sekarang"
                        : isStudio
                        ? "Sewa Studio Sekarang"
                        : "Sewa Jasa Sekarang"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Ulasan &amp; Reputasi Klien
              </h3>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "reviews" } }));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Atur Ulasan &amp; Reputasi</span>
              </button>
            )}
          </div>

          {totalReviews === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white border border-stone-200/80 space-y-4">
              <div className="w-12 h-12 mx-auto bg-stone-50 border border-stone-200/70 flex items-center justify-center text-stone-400">
                <Star className="w-6 h-6 text-stone-300" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-bold text-[#1E1B2E]">Belum Ada Ulasan Publik</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Kreator ini belum memiliki ulasan dari proyek yang diselesaikan di RAMU. Jadilah brand atau mitra pertama yang berkolaborasi dan memberikan ulasan terverifikasi!
                </p>
              </div>
              {!isCurrentActor && (
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Mulai Kolaborasi Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-7 sm:p-8 rounded-none bg-white border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="text-4xl sm:text-5xl font-black text-[#1E1B2E]">
                    {avgRating}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs text-stone-500 font-semibold mt-1">
                      Berdasarkan {totalReviews} ulasan klien terverifikasi
                    </div>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Ulasan Transaksi Asli</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Testimoni dari Klien &amp; Mitra Terverifikasi
                </h3>

                <div className="space-y-3">
                  {actor.feedbacks.map((fb) => {
                    const authorName = (fb as any).authorActor?.name || (fb as any).authorName || "Klien RAMU Terverifikasi";
                    const authorRole = (fb as any).authorActor?.sector || "Mitra Kolaborasi";
                    const initial = authorName.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={fb.id}
                        className="p-5 rounded-none bg-stone-50/60 border border-stone-200/80 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-none bg-[#1E1B2E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {initial}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1E1B2E]">{authorName}</h4>
                              <p className="text-[11px] text-stone-500">{authorRole}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-0.5">
                            <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-stone-400 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Klien Terverifikasi
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#1E1B2E] leading-relaxed italic pl-12">
                          &ldquo;{fb.comments}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedShowcaseIndex !== null && showcaseItems[selectedShowcaseIndex] && (
        <TearSheetModal
          item={showcaseItems[selectedShowcaseIndex]}
          items={showcaseItems}
          currentIndex={selectedShowcaseIndex}
          isOpen={selectedShowcaseIndex !== null}
          onClose={() => setSelectedShowcaseIndex(null)}
          onSelectIndex={(newIdx) => setSelectedShowcaseIndex(newIdx)}
          onBookAuthor={() => setIsBookingOpen(true)}
          currentActorId={isCurrentActor ? actor.id : undefined}
        />
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        targetId={actor.id}
        targetName={actor.name}
        targetSector={actor.sector}
        targetType={actor.actorType}
        termsConfig={customTermsConfig}
      />

      {isCurrentActor && (
        <ProfileSlideOverDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              if (url.searchParams.has("edit")) {
                url.searchParams.delete("edit");
                window.history.replaceState({}, "", url.toString());
              }
            }
          }}
          defaultTab={drawerTab}
          actor={actor}
          registeredActors={registeredActors}
        />
      )}
    </div>
  );
}
