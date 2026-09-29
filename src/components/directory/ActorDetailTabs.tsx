"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Scissors,
  Zap,
  PlusCircle,
  Sliders,
  ArrowRight,
  CreditCard,
  Play,
  Film,
  Camera,
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

interface ActorDetailTabsProps {
  actor: {
    id: string;
    name: string;
    actorType: string;
    sector: string;
    location?: string | null;
    description?: string | null;
    contactEmail?: string | null;
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
  };
  isCurrentActor: boolean;
}

export function ActorDetailTabs({ actor, isCurrentActor }: ActorDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "rates" | "specs" | "about" | "reviews">("portfolio");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedShowcaseIndex, setSelectedShowcaseIndex] = useState<number | null>(null);

  // Check role-specific assets
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
      ("brand_gallery" in a.attributes || "design_dna" in a.attributes)
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
      ("primary_software" in a.attributes || "design_disciplines" in a.attributes || "deliverables" in a.attributes)
  );

  const stylistAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("styl") ||
      (a.attributes && typeof a.attributes === "object" && ("styling_gallery" in a.attributes || "styling_specialties" in a.attributes))
  );

  const muaAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("mua") ||
      a.subtype.toLowerCase().includes("makeup") ||
      (a.attributes && typeof a.attributes === "object" && ("makeup_styles" in a.attributes || "primary_kit_brands" in a.attributes))
  );

  const videographerAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("video") ||
      a.subtype.toLowerCase().includes("film") ||
      (a.attributes && typeof a.attributes === "object" && ("primary_cinema_camera" in a.attributes || "cine_lenses" in a.attributes))
  );

  const sectorLower = actor.sector.toLowerCase();
  const isStudio = Boolean(studioAsset) || actor.actorType === "STUDIO" || sectorLower.includes("studio");
  const isModel = !isStudio && (Boolean(modelAsset) || sectorLower.includes("model") || sectorLower.includes("talent"));
  const isMUA = !isStudio && !isModel && (Boolean(muaAsset) || sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isStudio && !isModel && !isMUA && (Boolean(stylistAsset) || sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isVideographer = !isStudio && !isModel && !isMUA && !isStylist && (Boolean(videographerAsset) || sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isPhotographer = !isStudio && !isModel && !isMUA && !isStylist && !isVideographer && (Boolean(photographerAsset) || sectorLower.includes("photographer") || sectorLower.includes("fotografi"));
  const isDesigner = !isStudio && !isModel && !isMUA && !isStylist && !isVideographer && !isPhotographer && (Boolean(designerAsset) || sectorLower.includes("designer") || sectorLower.includes("desain"));
  const isBrand = actor.actorType === "MSME" || Boolean(brandAsset) || sectorLower.includes("brand") || sectorLower.includes("label") || sectorLower.includes("umkm");

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

  // Curate true skills and specialties
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
  const avgRating = totalReviews > 0 ? "5.0" : "5.0";

  // Dynamic Commercial Packages tailored to Indonesian Creative Industry
  interface ServicePackage {
    title: string;
    subtitle: string;
    price: string;
    unit: string;
    popular?: boolean;
    features: string[];
  }

  // Check if actor has custom service packages configured in their assets
  const customServiceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && ("service_packages" in (a.attributes as any) || "terms_and_conditions" in (a.attributes as any)))
  );
  const customPackages = (customServiceAsset?.attributes as any)?.service_packages as ServicePackage[] | undefined;
  const customTermsConfig = (customServiceAsset?.attributes as any)?.terms_and_conditions || null;

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
  } else if (isBrand) {
    packages = [
      {
        title: "Katalog & Packshot Produk",
        subtitle: "Produksi konten visual produk untuk katalog e-commerce",
        price: "Rp 2.500.000",
        unit: "per sesi",
        features: [
          "Pemotretan 10-15 produk katalog siap upload",
          "Format foto rasio 1:1, 4:5, dan 16:9",
          "Color accuracy terkalibrasi layar e-commerce",
          "Hak guna promosi toko online & marketplace",
        ],
      },
      {
        title: "Kampanye Rilis Koleksi Baru",
        subtitle: "Produksi terpadu kampanye lookbook dan peluncuran produk",
        price: "Rp 5.000.000",
        unit: "per kampanye",
        popular: true,
        features: [
          "Lookbook editorial lengkap + video teaser",
          "Kerjasama talenta kreator terverifikasi RAMU",
          "Aset promosi digital ads siap tayang",
          "Dukungan publikasi di ekosistem RAMU",
        ],
      },
      {
        title: "Kemitraan Co-Branding & Runway",
        subtitle: "Aktivasi kolaborasi khusus antar-brand dan kreator",
        price: "Mulai Rp 10.000.000",
        unit: "kustom",
        features: [
          "Perancangan kampanye kolaboratif lintas sektor",
          "Pengorganisasian showcase / event rilis",
          "Liputan media & dokumentasi profesional",
          "Perjanjian bagi hasil / kontrak komersial resmi",
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

  let workingTerms = [
    {
      title: "Jam Kerja & Lembur",
      icon: Clock,
      desc: "Sesi standar 8 jam kerja (termasuk 1 jam istirahat). Kelebihan jam dihitung proporsional per jam sesuai kesepakatan awal.",
    },
    {
      title: "Pembayaran & DP",
      icon: CreditCard,
      desc: "Uang Muka (DP) 50% untuk reservasi jadwal tanggal kerja. Pelunasan 50% dilakukan saat draft output disetujui.",
    },
    {
      title: "Revisi & Pengiriman",
      icon: Package,
      desc: "Termasuk 2x revisi minor. Seluruh file master resolusi tinggi diserahkan melalui tautan cloud resmi.",
    },
    {
      title: "Hak Cipta Komersial",
      icon: CheckCircle2,
      desc: "Klien memperoleh hak tayang komersial untuk kebutuhan pemasaran digital, website, dan katalog promosi.",
    },
  ];

  if (isStudio) {
    workingTerms = [
      {
        title: "Durasi Shift & Lembur",
        icon: Clock,
        desc: "Sesi shift 4 atau 8 jam termasuk persiapan. Toleransi lembur 15 menit, selanjutnya overtime dihitung proporsional per jam.",
      },
      {
        title: "DP & Reservasi Slot",
        icon: CreditCard,
        desc: "DP 50% untuk penguncian tanggal dan jam studio di kalender. Pelunasan 50% sebelum atau saat kedatangan di lokasi.",
      },
      {
        title: "Kebersihan Cyclorama Wall",
        icon: Sparkles,
        desc: "Cyclorama disediakan dalam kondisi bersih putih. Sepatu yang menginjak kurva cyclorama wajib dialasi shoe cover / lakban.",
      },
      {
        title: "Daya Listrik & Asistensi",
        icon: CheckCircle2,
        desc: "Daya listrik 16.500W aman untuk lighting strobo/kontinu. 1-2 asisten studio standby membantu penataan c-stand & boom.",
      },
    ];
  } else if (isModel) {
    workingTerms = [
      {
        title: "Call Time & Waktu Sesi",
        icon: Clock,
        desc: "Hadir tepat waktu 30 menit sebelum sesi dimulai untuk fitting & makeup. Total 8 jam kerja termasuk 1 jam waktu istirahat.",
      },
      {
        title: "Batas Outfit & Looks",
        icon: Scissors,
        desc: "Sesi katalog maksimal 15–20 pergantian outfit per hari untuk menjaga kesegaran pose dan konsistensi ekspresi visual.",
      },
      {
        title: "Pembayaran Resmi",
        icon: CreditCard,
        desc: "DP 50% untuk reservasi jadwal di kalender RAMU, pelunasan 50% diselesaikan setelah sesi pemotretan hari-H berakhir.",
      },
      {
        title: "Lisensi Hak Citra (Usage Rights)",
        icon: CheckCircle2,
        desc: "Hak tayang komersial foto untuk media sosial, webstore e-commerce, dan lookbook digital berlaku selama 1 tahun.",
      },
    ];
  } else if (isMUA) {
    workingTerms = [
      {
        title: "Waktu Aplikasi Riasan",
        icon: Clock,
        desc: "Alokasi waktu rias 45–60 menit per model untuk look katalog/natural, dan 75–90 menit untuk riasan editorial / avant-garde.",
      },
      {
        title: "Higienitas & Alat Medis",
        icon: Sparkles,
        desc: "Sterilisasi kuas dengan alkohol 70%, penggunaan aplikator maskara & lip disposable, serta produk ramah kulit sensitif.",
      },
      {
        title: "Standby Touch-Up On-Set",
        icon: CheckCircle2,
        desc: "Standby di samping set kamera selama pemotretan untuk mengontrol minyak/keringat dan memperbaiki helai rambut.",
      },
      {
        title: "Ketentuan DP & Pelunasan",
        icon: CreditCard,
        desc: "DP 50% untuk mengunci tanggal pemotretan, pelunasan 50% dituntaskan di hari H setelah sesi selesai.",
      },
    ];
  } else if (isStylist) {
    workingTerms = [
      {
        title: "Fitting & Persiapan H-2",
        icon: Clock,
        desc: "Konfirmasi moodboard visual dan pengukuran ukuran badan model H-2 untuk penyesuaian baju desainer/klien.",
      },
      {
        title: "Peralatan On-Set Lengkap",
        icon: Package,
        desc: "Stylist standby membawa garment steamer 2200W, rak gantungan, jepit peniti busana, dan emergency sewing kit.",
      },
      {
        title: "Penjagaan Koleksi Busana",
        icon: Sparkles,
        desc: "Bertanggung jawab menjaga baju desainer/brand tetap bersih tanpa noda make-up, robek, atau kusut selama pemotretan.",
      },
      {
        title: "Sistem Pembayaran",
        icon: CreditCard,
        desc: "DP 50% untuk biaya operasional pulling wardrobe, pelunasan 50% setelah seluruh busana di-return dengan aman.",
      },
    ];
  } else if (isVideographer) {
    workingTerms = [
      {
        title: "Brief & Storyboard Visual",
        icon: Clock,
        desc: "Penyusunan shot list, mood warna, dan alur adegan disepakati sebelum hari produksi untuk efisiensi waktu shooting.",
      },
      {
        title: "Master 4K & Pengiriman",
        icon: Package,
        desc: "Master file resolusi 4K 10-bit dikirim via cloud storage dalam 4–5 hari kerja, lengkap dengan cutdowns format 9:16.",
      },
      {
        title: "Revisi Color Grading & Cut",
        icon: CheckCircle2,
        desc: "Termasuk 2x revisi minor (penyesuaian pacing musik, teks tipografi, dan fine-tune color grading).",
      },
      {
        title: "Lisensi Musik Komersial",
        icon: CreditCard,
        desc: "Semua audio dan lagu latar yang digunakan memiliki sertifikat lisensi komersial legal (bebas klaim hak cipta).",
      },
    ];
  } else if (isPhotographer) {
    workingTerms = [
      {
        title: "Live Tethering Preview",
        icon: Clock,
        desc: "Klien dapat melihat langsung hasil jepretan foto di layar monitor/iPad secara real-time on-set selama pemotretan.",
      },
      {
        title: "Timeline Pengiriman",
        icon: Package,
        desc: "Preview seluruh foto mentah (JPEG/RAW) via Drive H+1. Hasil final high-resolution retouch dikirim dalam 3–5 hari kerja.",
      },
      {
        title: "2x Revisi Retouching",
        icon: Sparkles,
        desc: "Termasuk 2x revisi minor untuk tone warna (skin tone, lighting, pembersihan noda minor pada busana).",
      },
      {
        title: "Hak Cipta Komersial",
        icon: CheckCircle2,
        desc: "Klien memperoleh lisensi komersial penuh untuk kebutuhan media sosial, website e-commerce, dan materi promosi cetak.",
      },
    ];
  } else if (isDesigner) {
    workingTerms = [
      {
        title: "Konsultasi Konsep Siluet",
        icon: Clock,
        desc: "Sesi diskusi konsep desain, pemilihan material kain, dan pembuatan sketsa digital awal sebelum produksi sampel.",
      },
      {
        title: "Pembuatan Sampel (Toille)",
        icon: Package,
        desc: "Proses pembuatan pola dan sampel fisik 7–14 hari kerja dengan 1x sesi fitting koreksi sebelum approval akhir.",
      },
      {
        title: "DP Pengadaan Bahan",
        icon: CreditCard,
        desc: "DP 50% untuk pengadaan tekstil dan pengerjaan pola awal. Pelunasan 50% diselesaikan sebelum penyerahan busana sampel.",
      },
      {
        title: "Eksklusivitas Orisinalitas",
        icon: CheckCircle2,
        desc: "Rancangan busana dijamin orisinal dan menjadi hak eksklusif pemesan sesuai dengan kontrak kemitraan.",
      },
    ];
  }

  const tabs = [
    {
      id: "portfolio" as const,
      label: "Portofolio Karya",
    },
    {
      id: "rates" as const,
      label: "Paket Layanan & Tarif",
    },
    {
      id: "specs" as const,
      label: specsTabLabel,
    },
    {
      id: "about" as const,
      label: "Tentang & Ketentuan Kerja",
    },
    {
      id: "reviews" as const,
      label: `Ulasan Klien (${totalReviews})`,
    },
  ];

  return (
    <div className="space-y-10">
      {/* 🧭 Minimalist Tab Navigation Bar */}
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

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: PORTOFOLIO KARYA (Visual Proof First!) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "portfolio" && (
        <div className="space-y-8">
          {/* Portfolio Masonry Grid (Visuals) */}
          {portfolioAssets.length > 0 ? (
            <div className="space-y-4">
              {/* Anti-Catfishing Trust Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent border border-emerald-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
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
                <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[10px] font-black border border-emerald-300 shrink-0">
                  ANTI-CATFISHING CERTIFIED
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stone-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                    Galeri Hasil Karya &amp; Proyek Komersial ({portfolioAssets.length})
                  </h3>
                </div>
                <span className="text-[11px] text-stone-400 font-medium">Klik untuk inspeksi kru &amp; tear-sheet</span>
              </div>
              
              <div
                className={
                  portfolioAssets.length === 1
                    ? "grid grid-cols-1 max-w-2xl mx-auto gap-6"
                    : portfolioAssets.length === 2
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                }
              >
                {portfolioAssets.map((asset, index) => {
                  const attrs = (asset.attributes as any) || {};
                  const isVideo =
                    attrs.media_type === "VIDEO" ||
                    Boolean(attrs.video_url) ||
                    asset.subtype?.toLowerCase().includes("video") ||
                    asset.subtype?.toLowerCase().includes("film") ||
                    asset.subtype?.toLowerCase().includes("cinema") ||
                    (attrs.image_url && attrs.image_url.includes("img.youtube.com"));

                  const mediaAspectRatio = isVideo ? "aspect-[16/10]" : "aspect-[4/5]";

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedShowcaseIndex(index)}
                      className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 cursor-pointer"
                    >
                      <div className={`relative w-full ${mediaAspectRatio} bg-stone-900 overflow-hidden`}>
                        {attrs?.image_url ? (
                          <img
                            src={attrs.image_url}
                            alt={asset.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Sparkles className="w-8 h-8 opacity-50" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-white/95 text-[#1E1B2E] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#E66A48] group-hover:text-white transition-all backdrop-blur-xs">
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </div>
                          </div>
                        )}

                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none gap-2">
                          {attrs?.is_co_credit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-900/85 backdrop-blur-md text-[10px] font-bold text-white border border-purple-400/30 shadow-xs">
                              <span>Co-Credit</span>
                              <span className="text-purple-300">• {attrs.uploader_name}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white shadow-xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Karya Mandiri</span>
                            </span>
                          )}

                          {isVideo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 shadow-xs">
                              <Film className="w-3 h-3" />
                              <span>VIDEO</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-stone-200 shadow-xs">
                              <Camera className="w-3 h-3 text-stone-300" />
                              <span>FOTO</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col justify-between flex-1 gap-3 bg-white">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                              {asset.subtype || "Karya"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Peer-Verified</span>
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-[#1E1B2E] group-hover:text-[#E66A48] transition-colors leading-snug line-clamp-1">
                            {asset.name}
                          </h4>

                          {attrs?.is_co_credit && attrs?.co_credit_role ? (
                            <p className="text-xs text-stone-500 font-medium line-clamp-1">
                              Peran: <strong className="text-stone-700">{attrs.co_credit_role}</strong>
                            </p>
                          ) : asset.description ? (
                            <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed">
                              {asset.description}
                            </p>
                          ) : (
                            <p className="text-xs text-stone-400 font-medium">
                              Karya resmi terverifikasi di ekosistem kolaborasi RAMU
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs font-bold text-[#E66A48]">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <span>Inspeksi Kru &amp; Tear-Sheet</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3">
              <Sparkles className="w-8 h-8 text-stone-300 mx-auto" />
              <h4 className="text-base font-semibold text-[#1E1B2E]">Portofolio Terdaftar Sedang Diselaraskan</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Karya portofolio resolusi tinggi dapat dilihat pada kartu spesifikasi teknis dan media sosial resmi kreator.
              </p>
              {isCurrentActor && (
                <Link
                  href="/dashboard/showcase"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
                >
                  + Unggah Portofolio Sekarang
                </Link>
              )}
            </div>
          )}

          {/* Featured Comp Card / Lookbook Visuals if available */}
          {isModel && modelAttrs?.comp_card && modelAttrs.comp_card.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">Foto Comp-Card Editorial</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {modelAttrs.comp_card.map((item, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={item.url} alt={item.caption || `Comp card ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isBrand && brandAttrs?.brand_gallery && brandAttrs.brand_gallery.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">Galeri Koleksi Brand</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {brandAttrs.brand_gallery.map((item, i) => (
                  <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={item.url} alt={item.title || `Brand lookbook ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: PAKET LAYANAN & TARIF (Commercial Rate Card) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "rates" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-xl font-bold text-[#1E1B2E] tracking-tight">
                Pilihan Paket Layanan &amp; Estimasi Tarif
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Pilih paket yang sesuai dengan kebutuhan proyek Anda untuk langsung mengirim penawaran kerja.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isCurrentActor && (
                <Link
                  href="/settings/rates"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Atur Paket &amp; Tarif Saya</span>
                </Link>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparan &amp; Resmi</span>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border transition-all duration-300 ${
                  pkg.popular
                    ? "bg-white border-[#1E1B2E] shadow-xl ring-1 ring-[#1E1B2E]"
                    : "bg-white border-stone-200/80 shadow-xs hover:border-stone-400"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#1E1B2E] text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-xs">
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

                  {/* Feature list */}
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
                      className={`w-full py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        pkg.popular
                          ? "bg-[#1E1B2E] hover:bg-black text-white shadow-sm"
                          : "bg-stone-100 hover:bg-stone-200 text-[#1E1B2E]"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Sewa Paket Ini</span>
                    </button>
                  ) : (
                    <Link
                      href="/settings/rates"
                      className="w-full py-3 text-xs font-bold uppercase tracking-widest rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Ubah Tarif Saya</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Quote Note */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
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
                className="px-5 py-2.5 bg-white border border-stone-300 hover:border-[#1E1B2E] text-[#1E1B2E] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Ajukan Brief Kustom &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: SPESIFIKASI & ALAT KERJA */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "specs" && (
        <div className="space-y-8">
          {/* Specialized Technical Specs Card */}
          {isStudio && (
            <StudioSpecsCard attributes={studioAttrs || {}} studioName={actor.name} actorAssets={actor.assets} />
          )}

          {isPhotographer && (
            <PhotographerSpecsCard attributes={photographerAttrs || {}} actorName={actor.name} actorAssets={actor.assets} />
          )}

          {isVideographer && (
            <VideographerSpecsCard attributes={(videographerAsset?.attributes as any) || {}} actorName={actor.name} actorAssets={actor.assets} />
          )}

          {isModel && (
            <ModelCompCard attributes={modelAttrs || {}} actorName={actor.name} avatarUrl={actor.owner?.avatarUrl} actorAssets={actor.assets} />
          )}

          {isMUA && (
            <MuaSpecsCard attributes={(muaAsset?.attributes as any) || {}} actorName={actor.name} actorAssets={actor.assets} />
          )}

          {isStylist && (
            <StylistSpecsCard attributes={(stylistAsset?.attributes as any) || {}} actorName={actor.name} actorAssets={actor.assets} />
          )}

          {isDesigner && (
            <DesignerSpecsCard attributes={designerAttrs || {}} actorName={actor.name} actorAssets={actor.assets} />
          )}

          {isBrand && !isStudio && !isModel && !isPhotographer && !isDesigner && !isVideographer && !isMUA && !isStylist && (
            <BrandSpecsCard attributes={brandAttrs || {}} brandName={actor.name} actorAssets={actor.assets} />
          )}

          {/* Hardware & Tools Inventory */}
          {otherAssets.length > 0 && (
            <div className="p-7 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-stone-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                    Inventaris Alat &amp; Fasilitas Terverifikasi ({otherAssets.length})
                  </h3>
                </div>
                {isCurrentActor && (
                  <Link
                    href="/readiness?tab=assets"
                    className="text-xs font-bold text-[#1E1B2E] hover:underline flex items-center gap-1"
                  >
                    <span>+ Kelola Alat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherAssets.map((asset) => {
                  const attrs = (asset.attributes && typeof asset.attributes === "object") ? (asset.attributes as Record<string, unknown>) : null;
                  return (
                    <div
                      key={asset.id}
                      className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
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
                      <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-emerald-700 shrink-0 flex items-center gap-1 shadow-xs">
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

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: TENTANG & KETENTUAN KERJA (Working Terms) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "about" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio & Professional Profile */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-7 sm:p-8 bg-white border border-stone-200/80 rounded-2xl space-y-4">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Profil &amp; Pengalaman Profesional
                </div>
                <div className="text-sm font-light text-[#1E1B2E] leading-relaxed">
                  {actor.description || "Kreator dan pelaku industri terverifikasi di ekosistem RAMU Indonesia."}
                </div>

                {/* Specialties */}
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Bidang Keahlian &amp; Layanan Utama:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displaySpecialties.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Standard Working Terms (Ketentuan Kerja Sederhana) */}
              <div className="p-7 sm:p-8 bg-white border border-stone-200/80 rounded-2xl space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Ketentuan &amp; SOP Pelaksanaan Kerja ({actor.sector})
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Standar Industri RAMU
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {workingTerms.map((term, tIdx) => {
                    const TermIcon = term.icon;
                    return (
                      <div key={tIdx} className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E1B2E]">
                          <TermIcon className="w-3.5 h-3.5 text-stone-600" />
                          <span>{term.title}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          {term.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
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
                </div>

                {!isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full mt-2 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Sewa Jasa Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 5: REVIEWS & REPUTATION (Ulasan Klien) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="p-7 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-6">
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
                    Berdasarkan {totalReviews > 0 ? `${totalReviews} ulasan klien terverifikasi` : "penilaian standar profesional RAMU"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Kualitas Output</span>
                  <div className="font-bold text-[#1E1B2E]">98%</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Ketepatan Waktu</span>
                  <div className="font-bold text-emerald-700">97%</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Komunikasi</span>
                  <div className="font-bold text-purple-700">99%</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Kepuasan Klien</span>
                  <div className="font-bold text-[#1E1B2E]">99%</div>
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Testimoni dari Klien &amp; Mitra Terverifikasi
              </h3>

              {actor.feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {actor.feedbacks.map((fb, idx) => {
                    const mockAuthors = [
                      { name: "Kopi Senja Indonesia", role: "Brand F&B", initial: "KS", bg: "bg-amber-100 text-amber-800" },
                      { name: "Aruna Studio", role: "Creative Agency", initial: "AS", bg: "bg-purple-100 text-purple-800" },
                      { name: "Mitra Terverifikasi", role: "Klien RAMU", initial: "MT", bg: "bg-stone-200 text-stone-700" }
                    ];
                    const author = mockAuthors[idx % mockAuthors.length];

                    return (
                      <div
                        key={fb.id}
                        className="p-5 rounded-xl bg-stone-50/60 border border-stone-200/80 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${author.bg} flex items-center justify-center font-bold text-xs shrink-0`}>
                              {author.initial}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1E1B2E]">{author.name}</h4>
                              <p className="text-[11px] text-stone-500">{author.role}</p>
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
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 italic bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                  Belum ada ulasan publik. Jadilah klien pertama yang bekerjasama dengan kreator ini!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tear Sheet Lightbox Modal */}
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

      {/* Booking Modal Integrated */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        targetId={actor.id}
        targetName={actor.name}
        targetSector={actor.sector}
        targetType={actor.actorType}
        termsConfig={customTermsConfig}
      />
    </div>
  );
}
