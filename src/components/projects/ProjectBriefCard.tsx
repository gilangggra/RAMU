"use client";

import Link from "next/link";
import {
  Check,
  Circle,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CircleDollarSign,
  Calendar,
  Layers,
  Clock,
  Users,
} from "lucide-react";

export interface ProjectBriefRole {
  id: string;
  roleLabel: string;
  assetCategory: string;
  isFilled: boolean;
  interests?: { id: string; status: string }[];
}

export interface ProjectBriefCardProps {
  id: string;
  title: string;
  description: string;
  projectType: string;
  targetOutput: string;
  location?: string | null;
  compensationModel?: string | null;
  status: string;
  neededRoles: ProjectBriefRole[];
  creatorActor: {
    name: string;
    sector: string;
    location?: string | null;
    owner?: {
      avatarUrl?: string | null;
    } | null;
  };
  createdAt: Date;
  isOwnBrief?: boolean;
  budget?: { estimatedTotal?: string; notes?: string } | any;
  timeline?: { estimatedDuration?: string; targetLaunch?: string } | any;
  aestheticStyle?: string | null;
  userSector?: string;
  viewMode?: "grid" | "list";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  OPEN: {
    label: "Terbuka",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  IN_REVIEW: {
    label: "Tahap Review",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  FILLED: {
    label: "Peran Terisi",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  CLOSED: {
    label: "Selesai",
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    dot: "bg-stone-400",
  },
};

export function ProjectBriefCard({
  id,
  title,
  description,
  projectType,
  targetOutput,
  location,
  compensationModel,
  status,
  neededRoles,
  creatorActor,
  createdAt,
  isOwnBrief = false,
  budget,
  timeline,
  aestheticStyle,
  userSector,
  viewMode = "grid",
}: ProjectBriefCardProps) {
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const openRoles = neededRoles.filter((r) => !r.isFilled);
  const filledRoles = neededRoles.filter((r) => r.isFilled);
  const totalInterests = neededRoles.reduce(
    (sum, r) => sum + (r.interests?.length || 0),
    0
  );

  const daysAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check if current user sector matches any open role in this brief
  const isSectorMatch = Boolean(
    userSector &&
      openRoles.some((r) => {
        const rLabel = r.roleLabel.toLowerCase();
        const uSector = userSector.toLowerCase();
        return (
          rLabel.includes(uSector) ||
          uSector.includes(rLabel) ||
          (uSector.includes("photo") && rLabel.includes("foto")) ||
          (uSector.includes("video") && rLabel.includes("video")) ||
          (uSector.includes("mua") && rLabel.includes("makeup")) ||
          (uSector.includes("model") && rLabel.includes("model")) ||
          (uSector.includes("stylist") && rLabel.includes("stylist"))
        );
      })
  );

  // Formatting compensation label & budget
  const compKey = (compensationModel || "").toUpperCase();
  const estimatedTotal = budget?.estimatedTotal;
  const targetLaunch = timeline?.targetLaunch;
  const estimatedDuration = timeline?.estimatedDuration;

  // ══════════════════════════════════════════════════════════════════════════
  // 1. LIST VIEW MODE (Compact & Dense for Fast Scanning)
  // ══════════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <Link
        href={`/projects/${id}`}
        className="group block p-4 sm:p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-800 transition-all duration-200 shadow-2xs hover:shadow-md"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                {projectType}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusCfg.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${
                    status === "OPEN" ? "animate-pulse" : ""
                  }`}
                />
                {statusCfg.label}
              </span>
              {isSectorMatch && !isOwnBrief && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-stone-950" />
                  Cocok Profil Anda
                </span>
              )}
              {isOwnBrief && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#1E1B2E] text-white rounded-md">
                  Brief Anda
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight group-hover:text-amber-900 transition-colors truncate">
              {title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
              <span className="font-semibold text-stone-800">
                {creatorActor.name}
              </span>
              <span>&bull;</span>
              <span>{creatorActor.sector}</span>
              {(location || creatorActor.location) && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{location || creatorActor.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Roles Chips */}
          <div className="lg:w-72 shrink-0 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Peran: {openRoles.length} Terbuka / {neededRoles.length} Total
            </div>
            <div className="flex flex-wrap gap-1.5">
              {neededRoles.slice(0, 3).map((role) => (
                <span
                  key={role.id}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                    role.isFilled
                      ? "bg-stone-50 text-stone-400 border-stone-200 line-through"
                      : "bg-white text-stone-800 border-stone-200"
                  }`}
                >
                  {role.roleLabel}
                </span>
              ))}
              {neededRoles.length > 3 && (
                <span className="text-[10px] text-stone-400 px-1 py-0.5">
                  +{neededRoles.length - 3} lainnya
                </span>
              )}
            </div>
          </div>

          {/* Compensation & CTA */}
          <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
            <div className="text-left lg:text-right">
              <div className="text-xs font-black text-stone-900">
                {estimatedTotal ? estimatedTotal : compKey === "PAID" ? "Fee Komersial" : compKey === "BARTER" ? "Barter Produk" : compKey === "TFP" ? "TFP Portofolio" : compKey === "REVENUE_SHARE" ? "Bagi Hasil" : "Komersial"}
              </div>
              <div className="text-[10px] text-stone-400">
                {totalInterests} pelamar &bull; {daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1B2E] text-white rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-black transition-colors shrink-0 shadow-xs">
              <span>Tinjau</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. GRID VIEW MODE (Rich Editorial Creative Card)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Link
      href={`/projects/${id}`}
      className="group flex flex-col justify-between bg-white rounded-2xl border border-stone-200 hover:border-stone-900 transition-all duration-300 shadow-xs hover:shadow-lg overflow-hidden relative"
    >
      {/* TOP EDITORIAL ACCENT STRIP */}
      <div className="px-6 pt-5 pb-3 border-b border-stone-100 bg-gradient-to-r from-stone-50 via-white to-stone-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
            {projectType}
          </span>
          {aestheticStyle && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-900 text-[10px] font-semibold rounded-md border border-purple-200">
              {aestheticStyle}
            </span>
          )}
          {isSectorMatch && !isOwnBrief && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-stone-950" />
              Cocok Profil Anda
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOwnBrief && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 rounded-md border border-stone-200">
              Brief Anda
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusCfg.badge}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${
                status === "OPEN" ? "animate-pulse" : ""
              }`}
            />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-6 space-y-4 flex-1">
        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-[#1E1B2E] tracking-tight group-hover:text-amber-900 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-stone-500 font-normal leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* COMPENSATION & BUDGET HIGHLIGHT BOX */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block flex items-center gap-1">
              <CircleDollarSign className="w-3 h-3 text-stone-500" />
              Skema Kompensasi
            </span>
            <div className="text-xs font-black text-stone-900 truncate">
              {estimatedTotal ? (
                <span>{estimatedTotal}</span>
              ) : compKey === "PAID" ? (
                <span className="text-emerald-800">Fee Komersial (Paid)</span>
              ) : compKey === "BARTER" ? (
                <span className="text-amber-800">Barter Produk / Jasa</span>
              ) : compKey === "TFP" ? (
                <span className="text-purple-800">TFP (Trade for Portfolio)</span>
              ) : compKey === "REVENUE_SHARE" ? (
                <span className="text-blue-800">Bagi Hasil Penjualan</span>
              ) : (
                <span>Komersial</span>
              )}
            </div>
          </div>

          {(targetLaunch || estimatedDuration) && (
            <div className="text-right space-y-0.5 shrink-0 pl-3 border-l border-stone-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3 text-stone-500" />
                Jadwal
              </span>
              <div className="text-xs font-semibold text-stone-800">
                {targetLaunch || estimatedDuration}
              </div>
            </div>
          )}
        </div>

        {/* TARGET LUARAN */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 shrink-0">
            <Layers className="w-3 h-3 text-stone-400" />
            Luaran:
          </span>
          <span className="text-xs font-medium text-stone-700 truncate">
            {targetOutput}
          </span>
        </div>

        {/* NEEDED ROLES BREAKDOWN WITH SLOTS */}
        <div className="space-y-2 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Kebutuhan Kru ({neededRoles.length} Peran)
            </span>
            {openRoles.length > 0 ? (
              <span className="text-[11px] font-bold text-amber-800">
                {openRoles.length} peran terbuka
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Semua Terisi</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {neededRoles.map((role) => (
              <span
                key={role.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  role.isFilled
                    ? "bg-stone-50 text-stone-400 border-stone-200 line-through"
                    : "bg-white text-stone-800 border-stone-200 shadow-2xs group-hover:border-stone-300"
                }`}
              >
                {role.isFilled ? (
                  <Check className="w-2.5 h-2.5 text-stone-400" />
                ) : (
                  <Circle className="w-2 h-2 text-amber-500 fill-amber-500" />
                )}
                <span>{role.roleLabel}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CARD FOOTER: CREATOR & STATS */}
      <div className="px-6 py-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-4 text-xs">
        {/* Creator Info */}
        <div className="flex items-center gap-3 min-w-0">
          {creatorActor.owner?.avatarUrl ? (
            <img
              src={creatorActor.owner.avatarUrl}
              alt={creatorActor.name}
              className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-stone-200 text-[#1E1B2E] font-bold text-xs flex items-center justify-center shrink-0">
              {creatorActor.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="font-bold text-[#1E1B2E] truncate flex items-center gap-1">
              <span>{creatorActor.name}</span>
              <span title="Inisiator Terverifikasi">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </span>
            </div>
            <div className="text-[10px] text-stone-400 truncate">
              {creatorActor.sector}
              {(location || creatorActor.location) && (
                <span> &bull; {location || creatorActor.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Interests & Time */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            {totalInterests > 0 && (
              <span className="text-[11px] font-bold text-stone-800 flex items-center justify-end gap-1">
                <Users className="w-3 h-3 text-stone-400" />
                {totalInterests} pelamar
              </span>
            )}
            <span className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
              <Clock className="w-2.5 h-2.5 text-stone-300" />
              {daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}
            </span>
          </div>

          <div className="p-2 bg-white group-hover:bg-[#1E1B2E] group-hover:text-white rounded-lg border border-stone-200 transition-all text-stone-600 shadow-2xs">
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
