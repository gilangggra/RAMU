"use client";

import Link from "next/link";
import {
  Check,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CircleDollarSign,
  Calendar,
  Layers,
  Clock,
  Users,
  Briefcase,
} from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

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
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  IN_REVIEW: {
    label: "Tahap Review",
    badge: "bg-stone-100 text-stone-700 border-stone-200",
    dot: "bg-stone-500",
  },
  FILLED: {
    label: "Peran Terisi",
    badge: "bg-blue-50 text-blue-800 border-blue-200/80",
    dot: "bg-blue-500",
  },
  CLOSED: {
    label: "Selesai",
    badge: "bg-stone-100 text-stone-500 border-stone-200",
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
  const totalInterests = neededRoles.reduce(
    (sum, r) => sum + (r.interests?.length || 0),
    0
  );

  const daysAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check role match against user sector
  const checkRoleMatchesUser = (roleLabel: string) => {
    if (!userSector) return false;
    const rLabel = roleLabel.toLowerCase();
    const uSector = userSector.toLowerCase();
    return (
      rLabel.includes(uSector) ||
      uSector.includes(rLabel) ||
      (uSector.includes("photo") && rLabel.includes("foto")) ||
      (uSector.includes("video") && rLabel.includes("video")) ||
      (uSector.includes("mua") && (rLabel.includes("makeup") || rLabel.includes("mua"))) ||
      (uSector.includes("model") && rLabel.includes("model")) ||
      (uSector.includes("stylist") && rLabel.includes("stylist")) ||
      (uSector.includes("desain") && rLabel.includes("desain"))
    );
  };

  const isSectorMatch = Boolean(
    userSector && openRoles.some((r) => checkRoleMatchesUser(r.roleLabel))
  );

  // Formatting compensation label & budget
  const compKey = (compensationModel || "").toUpperCase();
  const estimatedTotal = budget?.estimatedTotal;
  const targetLaunch = timeline?.targetLaunch;
  const estimatedDuration = timeline?.estimatedDuration;

  // Render Compensation Badge
  const renderCompensationBadge = () => {
    if (estimatedTotal) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <CircleDollarSign className="w-3 h-3 text-emerald-600" />
          <span>{estimatedTotal}</span>
        </span>
      );
    }
    if (compKey === "PAID" || compKey.includes("BERBAYAR")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <CircleDollarSign className="w-3 h-3 text-emerald-600" />
          <span>Fee Komersial (Paid)</span>
        </span>
      );
    }
    if (compKey === "BARTER") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
          <span>Barter Produk / Jasa</span>
        </span>
      );
    }
    if (compKey === "TFP") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200/80">
          <span>TFP (Portofolio)</span>
        </span>
      );
    }
    if (compKey === "REVENUE_SHARE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
          <span>Bagi Hasil (Rev-Share)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
        <span>Komersial</span>
      </span>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. LIST VIEW MODE (Attio Dense Job Table / Row)
  // ══════════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <Link
        href={`/projects/${id}`}
        className="group block p-4 bg-white rounded-xl border border-stone-200/90 hover:border-stone-800 transition-all duration-200 shadow-2xs hover:shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Initiator Avatar */}
            <ActorAvatar
              name={creatorActor.name}
              avatarUrl={creatorActor.owner?.avatarUrl}
              className="w-10 h-10 rounded-full"
            />

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <span>{creatorActor.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
                <span className="text-stone-300 text-xs">&bull;</span>
                <span className="text-[11px] text-stone-500">
                  {location || creatorActor.location || "Indonesia"}
                </span>
                <span className="text-stone-300 text-xs">&bull;</span>
                <span className="text-[11px] text-stone-400">
                  {daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}
                </span>

                {isSectorMatch && !isOwnBrief && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-900 text-white">
                    <Sparkles className="w-2.5 h-2.5" />
                    Sesuai Profil Anda
                  </span>
                )}
                {isOwnBrief && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                    Brief Anda
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-stone-950 transition-colors truncate">
                {title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded">
                  {projectType}
                </span>
                {aestheticStyle && (
                  <span className="text-[11px] text-stone-500 font-medium">
                    Tema: {aestheticStyle}
                  </span>
                )}
                {targetOutput && (
                  <span className="text-[11px] text-stone-500 truncate max-w-xs">
                    Luaran: {targetOutput}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Roles Chips */}
          <div className="lg:w-80 shrink-0 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Lowongan Kru: {openRoles.length} Terbuka dari {neededRoles.length} Peran
            </div>
            <div className="flex flex-wrap gap-1.5">
              {neededRoles.slice(0, 3).map((role) => {
                const matchesUser = checkRoleMatchesUser(role.roleLabel);
                return (
                  <span
                    key={role.id}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-all ${
                      role.isFilled
                        ? "bg-stone-50 text-stone-400 border-stone-200 line-through"
                        : matchesUser
                        ? "bg-stone-900 text-white border-stone-900 font-semibold"
                        : "bg-white text-stone-800 border-stone-200 font-medium"
                    }`}
                  >
                    {role.roleLabel}
                  </span>
                );
              })}
              {neededRoles.length > 3 && (
                <span className="text-[11px] text-stone-400 px-1 py-0.5">
                  +{neededRoles.length - 3} lainnya
                </span>
              )}
            </div>
          </div>

          {/* Compensation & CTA */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
            <div className="text-left lg:text-right">
              {renderCompensationBadge()}
              <div className="text-[10px] text-stone-400 mt-1 flex items-center lg:justify-end gap-1">
                <Users className="w-3 h-3 text-stone-400" />
                <span>{totalInterests} pelamar terdaftar</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold group-hover:bg-stone-800 transition-colors shrink-0 shadow-2xs">
              <span>{isOwnBrief ? "Kelola Brief" : "Lamar Peran"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. GRID VIEW MODE (Attio Editorial Card with Crystal Clear Job Info)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Link
      href={`/projects/${id}`}
      className="group flex flex-col justify-between bg-white rounded-xl border border-stone-200/90 hover:border-stone-800 transition-all duration-200 shadow-2xs hover:shadow-xs overflow-hidden relative"
    >
      {/* CARD TOP: INITIATOR INFO + COMPENSATION BADGE */}
      <div className="p-5 pb-3 border-b border-stone-100 flex items-start justify-between gap-3">
        {/* Initiator Info */}
        <div className="flex items-center gap-3 min-w-0">
          <ActorAvatar
            name={creatorActor.name}
            avatarUrl={creatorActor.owner?.avatarUrl}
            className="w-9 h-9 rounded-full"
          />

          <div className="min-w-0">
            <div className="font-semibold text-stone-900 text-xs truncate flex items-center gap-1">
              <span>{creatorActor.name}</span>
              <span title="Inisiator Terverifikasi">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </span>
            </div>
            <div className="text-[11px] text-stone-500 truncate flex items-center gap-1">
              <span>{creatorActor.sector}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-stone-400" />
                <span>{location || creatorActor.location || "Indonesia"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Status / Compensation */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {renderCompensationBadge()}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusCfg.badge}`}
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
      <div className="p-5 space-y-3.5 flex-1">
        {/* Project Title & Category tags */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-semibold rounded uppercase tracking-wider">
              {projectType}
            </span>
            {aestheticStyle && (
              <span className="px-2 py-0.5 bg-stone-50 text-stone-600 text-[10px] font-medium rounded border border-stone-200/70">
                {aestheticStyle}
              </span>
            )}
            {isSectorMatch && !isOwnBrief && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-900 text-white shadow-2xs">
                <Sparkles className="w-2.5 h-2.5" />
                Sesuai Profil Anda
              </span>
            )}
            {isOwnBrief && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-700 rounded border border-stone-200">
                Brief Anda
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-stone-900 group-hover:text-stone-950 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          <p className="text-xs text-stone-500 font-normal leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* DELIVERABLE & TIMELINE METADATA */}
        <div className="p-2.5 bg-stone-50/70 rounded-lg border border-stone-200/70 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 shrink-0">
              <Layers className="w-3 h-3 text-stone-400" />
              Target Luaran:
            </span>
            <span className="text-[11px] font-semibold text-stone-800 truncate text-right">
              {targetOutput || "Produksi Kreatif"}
            </span>
          </div>

          {(targetLaunch || estimatedDuration) && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
              <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 text-stone-400" />
                Jadwal Produksi:
              </span>
              <span className="text-[11px] font-semibold text-stone-800 text-right">
                {targetLaunch || estimatedDuration}
              </span>
            </div>
          )}
        </div>

        {/* NEEDED ROLES BREAKDOWN WITH SLOTS */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-stone-400" />
              Lowongan Kru ({neededRoles.length} Peran)
            </span>
            {openRoles.length > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-700">
                {openRoles.length} slot terbuka
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-stone-400" />
                Semua Terisi
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {neededRoles.map((role) => {
              const matchesUser = checkRoleMatchesUser(role.roleLabel);
              return (
                <span
                  key={role.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all ${
                    role.isFilled
                      ? "bg-stone-50 text-stone-400 border border-stone-200/70 line-through"
                      : matchesUser
                      ? "bg-stone-900 text-white font-semibold shadow-2xs"
                      : "bg-white text-stone-800 border border-stone-200/90 font-medium hover:border-stone-400"
                  }`}
                >
                  {role.isFilled ? (
                    <Check className="w-2.5 h-2.5 text-stone-400" />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        matchesUser ? "bg-emerald-400" : "bg-emerald-500"
                      }`}
                    />
                  )}
                  <span>{role.roleLabel}</span>
                  {matchesUser && !role.isFilled && (
                    <span className="text-[9px] font-bold text-stone-300 ml-0.5">
                      (Anda)
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* CARD FOOTER: APPLICANTS & CTA */}
      <div className="px-5 py-3 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-stone-500 text-[11px]">
          <span className="flex items-center gap-1 font-medium text-stone-700">
            <Users className="w-3 h-3 text-stone-400" />
            {totalInterests} pelamar
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-stone-400">
            <Clock className="w-2.5 h-2.5 text-stone-300" />
            {daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold group-hover:bg-stone-800 transition-colors shadow-2xs">
          <span>{isOwnBrief ? "Kelola Brief" : "Lamar Peran"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
