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
  Scale,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ROLE_PRESETS, detectRoleCategory, ServicePackage, PackageTier } from "@/lib/constants/rolePresets";
import { ModelCompCard, ModelAttributes } from "./ModelCompCard";
import { StudioSpecsCard, StudioAttributes } from "./StudioSpecsCard";
import { BrandSpecsCard, BrandAttributes } from "./BrandSpecsCard";
import { PhotographerSpecsCard, PhotographerAttributes } from "./PhotographerSpecsCard";
import { MuaSpecsCard } from "./MuaSpecsCard";
import { StylistSpecsCard } from "./StylistSpecsCard";
import { VideographerSpecsCard } from "./VideographerSpecsCard";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { BookingModal } from "./BookingModal";
import { TearSheetModal } from "@/components/showcase/TearSheetModal";
import { ShowcaseCard } from "@/components/showcase/ShowcaseCard";
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
  initialTab?: "portfolio" | "rates" | "specs" | "collaborations" | "about" | "reviews";
  bookedDates?: string[];
  availabilityData?: any;
}

export function ActorDetailTabs({
  actor,
  isCurrentActor,
  registeredActors,
  initialTab,
  bookedDates = [],
  availabilityData,
}: ActorDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "rates" | "specs" | "collaborations" | "about" | "reviews">(initialTab || "portfolio");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined);
  const [selectedPackageForCollab, setSelectedPackageForCollab] = useState<ServicePackage | null>(null);
  const [selectedShowcaseIndex, setSelectedShowcaseIndex] = useState<number | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<string>("ALL");
  const [expandedPackageIdx, setExpandedPackageIdx] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTabType>("profile");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const tabLower = tabParam.toLowerCase();
      if (tabLower === "rates" || tabLower === "tarif" || tabLower === "paket") {
        setActiveTab("rates");
      } else if (tabLower === "portfolio" || tabLower === "porto") {
        setActiveTab("portfolio");
      } else if (tabLower === "specs" || tabLower === "spesifikasi") {
        setActiveTab("specs");
      } else if (tabLower === "collaborations" || tabLower === "proyek") {
        setActiveTab("collaborations");
      } else if (tabLower === "about" || tabLower === "tentang") {
        setActiveTab("about");
      } else if (tabLower === "reviews" || tabLower === "ulasan") {
        setActiveTab("reviews");
      }
    }
  }, [searchParams]);

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
  const isBrand = actor.actorType === "BRAND" || (actor.actorType as string) === "MSME" || actor.actorType === "COLLECTIVE" || Boolean(brandAsset) || sectorLower.includes("brand") || sectorLower.includes("label") || sectorLower.includes("umkm") || sectorLower.includes("designer") || sectorLower.includes("desain");
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
    sectorLower.includes("wardrobe")
  );

  const isStudio = !isIndividualSector && !isBrand && (hasStudioSpaceAsset || Boolean(studioAsset) || actor.actorType === "STUDIO" || sectorLower.includes("studio"));
  const isModel = !isBrand && !isStudio && (Boolean(modelAsset) || sectorLower.includes("model") || sectorLower.includes("talent"));
  const isMUA = !isBrand && !isStudio && !isModel && (Boolean(muaAsset) || sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isBrand && !isStudio && !isModel && !isMUA && (Boolean(stylistAsset) || sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isVideographer = !isBrand && !isStudio && !isModel && !isMUA && !isStylist && (Boolean(videographerAsset) || sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isPhotographer = !isBrand && !isStudio && !isModel && !isMUA && !isStylist && !isVideographer && (Boolean(photographerAsset) || sectorLower.includes("photographer") || sectorLower.includes("fotografi"));

  const modelAttrs = modelAsset?.attributes as ModelAttributes | undefined;
  const studioAttrs = studioAsset?.attributes as StudioAttributes | undefined;
  const brandAttrs = brandAsset?.attributes as BrandAttributes | undefined;
  const photographerAttrs = photographerAsset?.attributes as PhotographerAttributes | undefined;

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
        avatarBg: "from-[#4CC9FE] to-[#0284c7]",
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
    const filterLower = portfolioFilter.toLowerCase();
    const matched = portfolioAssets.filter((a) => {
      const sub = (a.subtype || "").toLowerCase();
      const title = a.name.toLowerCase();
      return sub.includes(filterLower) || title.includes(filterLower);
    });
    return matched.length > 0 ? matched : portfolioAssets;
  }, [portfolioAssets, portfolioFilter]);

  const explicitSpecialties: string[] = [];
  if (modelAttrs?.specialties) explicitSpecialties.push(...modelAttrs.specialties);
  if (photographerAttrs?.specialties) explicitSpecialties.push(...photographerAttrs.specialties);

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

  const customServiceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && ("service_packages" in (a.attributes as any) || "terms_and_conditions" in (a.attributes as any)))
  );
  const customPackages = (customServiceAsset?.attributes as any)?.service_packages as ServicePackage[] | undefined;
  const customTermsConfig = (customServiceAsset?.attributes as any)?.terms_and_conditions || null;
  const hasCustomPackages = Boolean(customPackages && Array.isArray(customPackages) && customPackages.length > 0);

  const detectedRole = detectRoleCategory(actor.sector, actor.actorType);
  const rolePreset = ROLE_PRESETS[detectedRole];

  let packages: ServicePackage[] = [];
  if (customPackages && Array.isArray(customPackages) && customPackages.length > 0) {
    packages = customPackages.map((pkg, idx) => {
      const fallbackTier: PackageTier = idx === 0 ? "STARTER" : idx === 1 ? "CAMPAIGN" : "COMMERCIAL";
      const presetFallback = rolePreset.packages[idx] || rolePreset.packages[0];
      return {
        ...pkg,
        tier: pkg.tier || fallbackTier,
        capacityDuration: pkg.capacityDuration || presetFallback?.capacityDuration || "Sesuai durasi sesi",
        deliverablesSummary: pkg.deliverablesSummary || presetFallback?.deliverablesSummary || pkg.subtitle,
        usageRights: pkg.usageRights || presetFallback?.usageRights || "Komersial Digital 1 Tahun",
        equipmentIncluded: pkg.equipmentIncluded || presetFallback?.equipmentIncluded || "Peralatan standar profesional",
      };
    });
  } else {
    packages = rolePreset.packages;
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
      label: isBrand ? "Kemitraan & Paket" : "Paket Kolaborasi",
    },
    {
      id: "specs" as const,
      label: "Spesifikasi",
    },
    {
      id: "collaborations" as const,
      label: "Proyek Kolaborasi",
    },
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
    <div className="space-y-8">
      {/* Segmented Pill Tabs Navigation Bar */}
      <div className="p-1.5 bg-slate-100/90 backdrop-blur-sm rounded-full border border-slate-200/80 inline-flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 whitespace-nowrap text-xs font-bold rounded-full transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50 border border-transparent"
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Portofolio &amp; Hasil Karya ({portfolioAssets.length})
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Peer-Verified Co-Credit</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:block">Klik karya untuk inspeksi kru &amp; tear-sheet</span>
                  {isCurrentActor && (
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "portfolio" } }));
                      }}
                      className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Karya</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1">
                {[
                  { id: "ALL", label: "Semua Karya" },
                  { id: "Fashion Campaign", label: "Fashion Campaign" },
                  { id: "Editorial", label: "Editorial" },
                  { id: "Product Shoot", label: "Product Shoot" },
                  { id: "Lookbook", label: "Lookbook" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPortfolioFilter(item.id)}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none border rounded-full whitespace-nowrap active:scale-95 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
                      portfolioFilter === item.id
                        ? "btn-primary-pill !py-1.5 !px-4 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 border-transparent"
                        : "bg-white/90 hover:bg-white text-slate-600 hover:text-[#0284c7] border-slate-200/80 hover:border-[#4CC9FE]/40"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
                {portfolioCategories.videoCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPortfolioFilter("VIDEO")}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all cursor-pointer select-none border rounded-full whitespace-nowrap active:scale-95 ${
                      portfolioFilter === "VIDEO"
                        ? "btn-primary-pill !py-1.5 !px-4 text-white font-semibold shadow-md shadow-[#4CC9FE]/25"
                        : "bg-white/90 hover:bg-white text-slate-600 hover:text-[#0284c7] border-slate-200/80 hover:border-[#4CC9FE]/40"
                    }`}
                  >
                    <Film className="w-3 h-3 text-[#4CC9FE]" />
                    <span>Video &amp; Motion</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${portfolioFilter === "VIDEO" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {portfolioCategories.videoCount}
                    </span>
                  </button>
                )}
              </div>

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
                    const showcaseItem = showcaseItems[targetIndex];
                    if (!showcaseItem) return null;

                    return (
                      <ShowcaseCard
                        key={asset.id}
                        item={showcaseItem}
                        onOpenTearSheet={() => setSelectedShowcaseIndex(targetIndex)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs text-slate-500">Tidak ada karya yang sesuai dengan kategori ini.</p>
                  <button
                    type="button"
                    onClick={() => setPortfolioFilter("ALL")}
                    className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
                  >
                    Tampilkan Semua Karya
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-base font-semibold text-slate-900">Portofolio Terdaftar Sedang Diselaraskan</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Karya portofolio resolusi tinggi dapat dilihat pada kartu spesifikasi teknis dan media sosial resmi kreator.
              </p>
              {isCurrentActor && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "portfolio" } }));
                    }}
                    className="btn-primary-pill !text-xs !py-2.5 !px-6 text-white font-bold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    + Unggah Portofolio Sekarang
                  </button>
                  <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Studio Showcase &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {isModel && modelAttrs?.comp_card && modelAttrs.comp_card.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Foto Comp-Card Editorial</h3>
                {isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                    }}
                    className="btn-primary-pill !text-xs !py-1.5 !px-3.5 shadow-sm shadow-[#4CC9FE]/20 font-semibold cursor-pointer inline-flex items-center gap-1.5 text-white"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Comp Card</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {modelAttrs.comp_card.map((item, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={item.url} alt={item.caption || `Comp card ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isBrand && brandAttrs?.brand_gallery && brandAttrs.brand_gallery.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Galeri Koleksi Brand</h3>
                {isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                    }}
                    className="btn-primary-pill !text-xs !py-1.5 !px-3.5 shadow-sm shadow-[#4CC9FE]/20 font-semibold cursor-pointer inline-flex items-center gap-1.5 text-white"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Galeri Brand</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {brandAttrs.brand_gallery.map((item, i) => (
                  <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
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
                  className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Atur Preferensi Kerjasama</span>
                </button>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
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
                  return <CreditCard className="w-5 h-5 text-slate-700" />;
                case "Product Seeding / Gifting":
                  return <Gift className="w-5 h-5 text-slate-700" />;
                case "Revenue Share / Affiliate":
                  return <TrendingUp className="w-5 h-5 text-slate-700" />;
                case "Barter / Trade for Content":
                  return <Repeat className="w-5 h-5 text-slate-700" />;
                case "Co-Branding & Kolaborasi Koleksi":
                  return <Handshake className="w-5 h-5 text-slate-700" />;
                case "Casting Open":
                  return <Users className="w-5 h-5 text-slate-700" />;
                default:
                  return <Target className="w-5 h-5 text-slate-700" />;
              }
            };

            return (
              <>
                {/* Tipe Kerjasama */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {collabTypes.map((type, idx) => (
                    <div key={idx} className="p-5 bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-[#0284c7] transition-colors">
                      <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-1">
                        {renderCollabIcon(type)}
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">{type}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {type === "Paid Campaign" && "Kreator dibayar sesuai rate card. Cocok untuk campaign terstruktur dengan brief yang jelas."}
                        {type === "Product Seeding / Gifting" && "Brand mengirimkan produk gratis kepada kreator pilihan untuk konten organik tanpa kewajiban posting."}
                        {type === "Revenue Share / Affiliate" && "Kreator mendapatkan komisi dari setiap konversi/penjualan yang dihasilkan melalui kode unik mereka."}
                        {type === "Barter / Trade for Content" && "Pertukaran nilai: brand menyediakan produk/jasa, kreator menyediakan konten berkualitas."}
                        {type === "Co-Branding & Kolaborasi Koleksi" && "Kerjasama rilis koleksi bersama antara dua brand atau brand dan kreator untuk edisi terbatas."}
                        {type === "Casting Open" && "Brand membuka casting terbuka untuk model, fotografer, atau kreator untuk proyek tertentu."}
                        {!["Paid Campaign", "Product Seeding / Gifting", "Revenue Share / Affiliate", "Barter / Trade for Content", "Co-Branding & Kolaborasi Koleksi", "Casting Open"].includes(type) && "Jenis kerjasama terbuka sesuai kesepakatan bersama."}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Budget / Kompensasi</span>
                    <p className="text-sm font-bold text-slate-900">{budgetRange}</p>
                    <p className="text-[11px] text-slate-500">Bervariasi per jenis kolaborasi</p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Timeline Kampanye</span>
                    <p className="text-sm font-bold text-slate-900">{timeline}</p>
                    <p className="text-[11px] text-slate-500">Dari brief hingga publikasi konten</p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Sistem Kontrak</span>
                    <p className="text-sm font-bold text-slate-900">Invoice Resmi & PO</p>
                    <p className="text-[11px] text-slate-500">Dilindungi perjanjian tertulis</p>
                  </div>
                </div>

                {/* Persyaratan Kreator */}
                <div className="p-5 bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Target className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Profil Kreator yang Dicari</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{creatorRequirements}</p>
                  {collabNotes && (
                    <div className="p-3 bg-sky-50 border border-sky-200/60 text-[11px] text-sky-950 rounded-2xl leading-relaxed">
                      <strong className="font-bold">Catatan:</strong> {collabNotes}
                    </div>
                  )}
                </div>

                {/* Kebutuhan Talenta & Brief Brand (Jika ada) */}
                {actor.needs && actor.needs.length > 0 && (
                  <div className="p-5 bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
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
                        <div key={need.id} className="p-3.5 bg-slate-50 border border-slate-200/70 space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#0284c7] bg-[#4CC9FE]/15 px-2 py-0.5 border border-[#4CC9FE]/30 rounded-full inline-block">
                            {need.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{need.title}</h5>
                          {need.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{need.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Ajukan Proposal / Pitch */}
                <div className="p-6 rounded-[22px] bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Tertarik berkolaborasi dengan {actor.name}?</h4>
                    <p className="text-[11px] text-slate-300">Kirimkan portofolio dan konsep proposal singkat Anda melalui formulir kemitraan resmi RAMU.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {!isCurrentActor && (
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(true)}
                        className="btn-primary-pill !text-xs !py-3 !px-6 text-white font-semibold cursor-pointer flex items-center gap-2 shadow-md shadow-[#4CC9FE]/25 active:scale-95"
                      >
                        <Briefcase className="w-4 h-4 text-white" />
                        <span>Ajukan Pitch Kolaborasi</span>
                      </button>
                    )}
                    <Link
                      href={`/projects?tab=browse&search=${encodeURIComponent(actor.name)}`}
                      className="px-5 py-2.5 rounded-full border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Kapasitas Resource &amp; Acuan Paket Kolaborasi
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Unit resource terstruktur sebagai starting anchor komersial untuk alokasi proyek kolaboratif RAMU.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isCurrentActor && (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "rates" } }));
                  }}
                  className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Atur Paket &amp; Kapasitas Saya</span>
                </button>
              )}
              {hasCustomPackages ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tarif Mandiri Terverifikasi</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Acuan Standar Ekosistem</span>
                </div>
              )}
            </div>
          </div>

          {/* 3 Structured Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => {
              const tierBadgeLabel =
                pkg.tier === "STARTER"
                  ? "Starter"
                  : pkg.tier === "COMMERCIAL"
                  ? "Full Commercial"
                  : "Campaign ⭐";

              const isHighlighted = pkg.tier === "CAMPAIGN" || pkg.popular;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col justify-between p-6 rounded-[22px] border transition-all duration-300 ${
                    isHighlighted
                      ? "bg-white border-[#0284c7] shadow-lg ring-1 ring-[#0284c7]/30"
                      : "bg-white border-slate-200 shadow-sm hover:border-slate-400"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          pkg.tier === "STARTER"
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : pkg.tier === "COMMERCIAL"
                            ? "bg-[#4CC9FE] text-white"
                            : "bg-sky-100 text-sky-900 border border-sky-200"
                        }`}
                      >
                        {tierBadgeLabel}
                      </span>

                      {isHighlighted && (
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Paling Populer
                        </span>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">{pkg.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{pkg.subtitle}</p>
                    </div>

                    {/* Price */}
                    <div className="pt-2 pb-2 border-y border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {pkg.price}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          / {pkg.unit || "sesi"}
                        </span>
                      </div>
                    </div>

                    {/* Clean Bullet Points */}
                    <div className="space-y-2 py-1">
                      {pkg.capacityDuration && (
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{pkg.capacityDuration}</span>
                        </div>
                      )}
                      {pkg.deliverablesSummary && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{pkg.deliverablesSummary}</span>
                        </div>
                      )}
                      {pkg.usageRights && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{pkg.usageRights}</span>
                        </div>
                      )}
                      {pkg.equipmentIncluded && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{pkg.equipmentIncluded}</span>
                        </div>
                      )}
                    </div>

                    {/* View details toggle */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedPackageIdx(expandedPackageIdx === idx ? null : idx)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{expandedPackageIdx === idx ? "Tutup rincian" : "Lihat rincian teknis"}</span>
                        {expandedPackageIdx === idx ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Features */}
                    {expandedPackageIdx === idx && pkg.features && pkg.features.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-5">
                    {!isCurrentActor ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPackageForCollab(pkg);
                          setIsBookingOpen(true);
                        }}
                        className={`w-full py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                          isHighlighted
                            ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25"
                            : "bg-white/90 hover:bg-white text-[#0284c7] border border-[#4CC9FE]/40 shadow-xs"
                        }`}
                      >
                        <Handshake className={`w-3.5 h-3.5 ${isHighlighted ? "text-white" : "text-[#0284c7]"}`} />
                        <span>Pilih Paket Ini</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "rates" } }));
                        }}
                        className="w-full py-2.5 text-xs font-semibold rounded-full bg-white/90 hover:bg-white text-[#0284c7] border border-[#4CC9FE]/30 hover:border-[#4CC9FE] transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Ubah Tarif &amp; Kapasitas</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kalender Ketersediaan Jadwal & Slot SPK Riil */}
          <div className="pt-2">
            <AvailabilityCalendar
              bookedDates={bookedDates}
              isAvailable={availabilityData?.isAvailable !== undefined ? availabilityData.isAvailable : true}
              statusNote={availabilityData?.statusNote}
              selectedDate={selectedCalendarDate}
              onSelectDate={(dateStr) => {
                setSelectedCalendarDate(dateStr);
                if (!isCurrentActor) {
                  setIsBookingOpen(true);
                }
              }}
            />
          </div>

          {/* Clean Custom Resource Allocation Bar */}
          <div className="py-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Butuh alokasi khusus atau brief di luar 3 pilihan paket di atas?{" "}
              {!isCurrentActor && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackageForCollab(null);
                    setIsBookingOpen(true);
                  }}
                  className="text-slate-900 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 ml-1"
                >
                  <span>Ajukan Brief Kustom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {activeTab === "specs" && (
        <div className="space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Spesifikasi Teknis Terverifikasi
              </h3>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "specs" } }));
                }}
                className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
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

          {isBrand && !isStudio && !isModel && !isPhotographer && !isVideographer && !isMUA && !isStylist && (
            <BrandSpecsCard attributes={brandAttrs || {}} brandName={actor.name} isCurrentActor={isCurrentActor} actorAssets={actor.assets} />
          )}

          {otherAssets.length > 0 && (
            <div className="p-7 sm:p-8 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Package className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Inventaris Alat &amp; Fasilitas Terverifikasi ({otherAssets.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherAssets.map((asset) => {
                  const attrs = (asset.attributes && typeof asset.attributes === "object") ? (asset.attributes as Record<string, unknown>) : null;
                  return (
                    <div
                      key={asset.id}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {asset.category} • {asset.subtype}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{asset.name}</h4>
                        {asset.description && (
                          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{asset.description}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-emerald-700 shrink-0 flex items-center gap-1 shadow-xs">
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Proyek Kolaborasi Multi-Pihak (Projects)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Berbeda dari galeri portofolio visual, proyek di bawah ini merefleksikan kolaborasi multi-aktor nyata di ekosistem RAMU yang menggabungkan berbagai sumber daya di bawah SPK terpadu.
              </p>
            </div>
            {isCurrentActor ? (
              <Link
                href="/projects/new"
                className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
              >
                <span>+ Buat Project Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
              >
                <Handshake className="w-3.5 h-3.5 text-amber-400" />
                <span>Inisiasi Kolaborasi</span>
              </button>
            )}
          </div>

          {/* Section 1: Real Multi-Party Projects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Histori &amp; Sinergi Proyek Bersama ({actor.collaborationParticipations?.length || 1})
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                100% Terikat SPK Sah
              </span>
            </div>

            {actor.collaborationParticipations && actor.collaborationParticipations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {actor.collaborationParticipations.map((part) => {
                  const statusColor =
                    part.collaboration.status === "COMPLETED"
                      ? "bg-slate-100 text-slate-800 border-slate-200"
                      : part.collaboration.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200";

                  const participantsList = part.collaboration.participants || [];

                  return (
                    <div
                      key={part.id}
                      className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-400 transition-all"
                    >
                      {/* Top Row: Status & Project Value */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${statusColor}`}>
                          ● {part.collaboration.status === "COMPLETED" ? "Selesai & Rilis" : part.collaboration.status === "ACTIVE" ? "Sedang Berjalan" : "Fase Produksi"}
                        </span>
                        <div className="text-right">
                          <span
                            className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block"
                            title="Total skala produksi seluruh tim gabungan, bukan tarif individual"
                          >
                            Skala Produksi Tim: Rp 15.000.000
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">
                            *Total gabungan tim (bukan tarif perorangan)
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h5 className="font-bold text-slate-900 text-base leading-snug">
                          {part.collaboration.title}
                        </h5>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">
                          {part.collaboration.description || "Kampanye busana kolaboratif multi-pihak dengan pembagian peran, hak siar, dan milestone transparan."}
                        </p>
                      </div>

                      {/* Resources Combined Badges */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Resources Combined (Sumber Daya Terpadu):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                            Photography
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold">
                            Studio Space
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
                            Fashion Model
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 rounded-full text-[10px] font-bold">
                            MUA &amp; Hair
                          </span>
                        </div>
                      </div>

                      {/* Credits Line */}
                      <div className="pt-3 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Kredit Sinergi Kru:
                        </span>
                        <p className="text-xs font-medium text-slate-700">
                          {participantsList.length > 0
                            ? participantsList.map((p) => `${p.actor.name} (${p.actor.sector})`).join(" · ")
                            : "Nala The Label (Brand) · Lensa Kreatif (Photographer) · Studio Imaji (Studio) · Dara Ayu (Model)"}
                        </p>
                      </div>

                      {/* Bottom Link */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Peran Aktor: <strong className="text-slate-700">{part.roleCode}</strong>
                        </span>
                        <Link
                          href={`/collaborations/${part.collaboration.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1"
                        >
                          <span>Buka Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                {/* Exemplar Real-World Collaborative Case Study Card */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border bg-slate-100 text-slate-800 border-slate-200">
                      ● Sinergi Ekosistem RAMU
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Nala The Label — Autumn Campaign 2026
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    Nilai Proyek: Rp 15.000.000 (Pool Kolaborasi)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Studi kasus standar kolaborasi di RAMU: Brand busana menyediakan 15 sampel look, studio menyediakan cyclorama L-curve 120m², fotografer memimpin sesi lookbook 8 jam dan retouching majalah, model mengeksekusi pose katalog. Seluruh pihak terlindungi di bawah 1 SPK terpadu dengan bagi hasil/termin pembayaran terverifikasi.
                </p>

                {/* Resources Combined Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Resources Combined (Sumber Daya Terpadu):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                      Photography
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold">
                      Studio Space
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
                      Fashion Model
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 rounded-full text-[10px] font-bold">
                      MUA &amp; Hair
                    </span>
                  </div>
                </div>

                {/* Credits Line */}
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-900">Kredit Sinergi:</strong> Nala The Label (Brand) · Lensa Kreatif (Photographer) · Studio Imaji (Studio) · Dara Ayu (Model) · Bella MUA (MUA)
                </div>

                {/* Call to action for empty state */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl">
                  <span className="text-xs text-slate-600 font-medium">
                    {actor.name} siap menerima tawaran proyek kolaborasi baru di RAMU.
                  </span>
                  {!isCurrentActor && (
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(true)}
                      className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <Handshake className="w-3.5 h-3.5 text-amber-400" />
                      <span>Inisiasi Kolaborasi Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div className="space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Profil &amp; Pengalaman Profesional
              </h3>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "about" } }));
                }}
                className="btn-primary-pill !text-xs !py-1.5 !px-3.5 shadow-sm shadow-[#4CC9FE]/20 font-semibold cursor-pointer inline-flex items-center gap-1.5 text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profil</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 4-Metric Quick Overview Grid */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Lokasi / Domisili
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {actor.location || "Jakarta, Indonesia"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pengalaman
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  5+ Tahun di Industri Mode
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Waktu Respon
                </span>
                <span className="text-sm font-bold text-emerald-800 block">
                  Dalam 24 Jam (&lt; 1 Hari)
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Status Ekosistem
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Terverifikasi Aktif</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="p-7 sm:p-8 bg-white border border-slate-200/80 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Profil &amp; Pengalaman Profesional
                  </div>
                </div>
                <div className="text-sm font-light text-slate-900 leading-relaxed">
                  {actor.description || "Kreator dan pelaku industri terverifikasi di ekosistem RAMU Indonesia."}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Bidang Keahlian &amp; Layanan Utama:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displaySpecialties.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Informasi Verifikasi
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Tipe Entitas:</span>
                    <span className="font-bold text-slate-900">{actor.actorType}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Sektor:</span>
                    <span className="font-bold text-slate-900">{actor.sector}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Domisili:</span>
                    <span className="font-bold text-slate-900">{actor.location || "Indonesia"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Status Akun:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Terverifikasi Aktif</span>
                    </span>
                  </div>
                  {socialLinks.instagram && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Instagram:</span>
                      <a
                        href={socialLinks.instagram.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:underline flex items-center gap-1.5"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Instagram</span>
                      </a>
                    </div>
                  )}
                  {socialLinks.website && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Website:</span>
                      <a
                        href={socialLinks.website.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:underline flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>Website</span>
                      </a>
                    </div>
                  )}
                </div>

                {!isCurrentActor && (
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="btn-primary-pill !text-xs !py-3 !px-6 w-full text-white font-bold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>
                      {isBrand
                        ? "Ajukan Kolaborasi Sekarang"
                        : isStudio
                        ? "Alokasikan Studio ke Proyek"
                        : "Alokasikan Resource ke Kolaborasi"}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Ulasan &amp; Reputasi Kolaborasi
              </h3>
            </div>
            {isCurrentActor && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-edit-modal", { detail: { tab: "reviews" } }));
                }}
                className="btn-primary-pill !text-xs !py-1.5 !px-3.5 shadow-sm shadow-[#4CC9FE]/20 font-semibold cursor-pointer inline-flex items-center gap-1.5 text-white"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Atur Ulasan &amp; Reputasi</span>
              </button>
            )}
          </div>

          <div className="p-7 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            {/* Overall Rating Header + 4 Pillars */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl font-black text-slate-900">
                  {avgRating || "5.0"}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    Berdasarkan {totalReviews > 0 ? totalReviews : 1} ulasan proyek terverifikasi
                  </div>
                </div>
              </div>

              {/* 4 Collaboration Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kolaborasi</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">5.0 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                </div>
                <div className="space-y-0.5 sm:border-l border-slate-200/80 sm:pl-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Komunikasi</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">5.0 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                </div>
                <div className="space-y-0.5 sm:border-l border-slate-200/80 sm:pl-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keandalan</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">5.0 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                </div>
                <div className="space-y-0.5 sm:border-l border-slate-200/80 sm:pl-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deliverables</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">5.0 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                </div>
              </div>

              <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5 self-start lg:self-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Ulasan Transaksi Asli</span>
              </div>
            </div>

            {/* Protokol Ulasan Dua Arah Tertutup (Double-Blind Review) */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-[#4CC9FE]/30 text-sky-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0284c7] shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Protokol Ulasan Dua Arah Tertutup (Double-Blind Review)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Demi menjaga integritas reputasi dan mencegah ulasan balas dendam (*retaliatory / revenge rating*), seluruh testimoni antar mitra tersimpan tertutup (*blinded*) dan baru dipublikasikan bersamaan setelah kedua belah pihak menyelesaikan penilaian mereka, atau otomatis dirilis setelah 14 hari kalender.
              </p>
            </div>

            {/* Testimonials List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Testimoni dari Klien &amp; Mitra Kolaborasi Terverifikasi
              </h3>

              {totalReviews > 0 ? (
                <div className="space-y-3">
                  {actor.feedbacks.map((fb) => {
                    const authorName = (fb as any).authorActor?.name || (fb as any).authorName || "Klien RAMU Terverifikasi";
                    const authorRole = (fb as any).authorActor?.sector || "Mitra Kolaborasi";
                    const initial = authorName.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={fb.id}
                        className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284c7] border border-[#4CC9FE]/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {initial}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{authorName}</h4>
                              <p className="text-[11px] text-slate-500">{authorRole}</p>
                            </div>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Klien Terverifikasi
                            </span>
                          </div>
                        </div>

                        {/* Project context tag */}
                        <div className="inline-block px-2.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                          Proyek: Nala The Label — Autumn Campaign · 2026
                        </div>

                        <p className="text-xs text-slate-900 leading-relaxed italic pl-1">
                          &ldquo;{fb.comments || "Kolaborasi sangat lancar dan memuaskan. Sinergi seluruh tim terarah dan luaran tepat waktu."}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Default Exemplar Verified Collaboration Review */}
                  <div className="p-5 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284c7] border border-[#4CC9FE]/30 flex items-center justify-center font-bold text-xs shrink-0">
                          SU
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Sarah Utami</h4>
                          <p className="text-[11px] text-slate-500">Creative Director, Nala The Label</p>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Klien Terverifikasi
                        </span>
                      </div>
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                      Proyek: Nala The Label — Autumn Campaign · 2026
                    </div>

                    <p className="text-xs text-slate-900 leading-relaxed italic pl-1">
                      &ldquo;Kolaborasi sangat profesional! Sinergi antara studio, model, dan pencahayaan menghasilkan lookbook editorial berstandar internasional. Seluruh foto final retouch diserahkan tepat waktu sesuai kesepakatan SPK.&rdquo;
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/70 text-xs text-sky-950 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span>
                      Jadilah mitra berikutnya yang berkolaborasi dengan {actor.name} di RAMU!
                    </span>
                    {!isCurrentActor && (
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(true)}
                        className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        Mulai Kolaborasi Pertama
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedPackageForCollab(null);
          setSelectedCalendarDate(undefined);
        }}
        targetId={actor.id}
        targetName={actor.name}
        targetSector={actor.sector}
        targetType={actor.actorType}
        termsConfig={customTermsConfig}
        selectedPackage={selectedPackageForCollab}
        initialStartDate={selectedCalendarDate}
        bookedDates={bookedDates}
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
