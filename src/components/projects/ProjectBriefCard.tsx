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
  description?: string | null;
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
    badge: "bg-amber-50 text-amber-800 border-amber-200/80",
    dot: "bg-amber-500",
  },
  FILLED: {
    label: "Peran Terisi",
    badge: "bg-[#4CC9FE]/15 text-[#0284c7] border-[#4CC9FE]/30",
    dot: "bg-[#4CC9FE]",
  },
  CLOSED: {
    label: "Selesai",
    badge: "bg-slate-100 text-slate-600 border-slate-200/80",
    dot: "bg-slate-400",
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
      (uSector.includes("brand") && rLabel.includes("brand"))
    );
  };

  const isSectorMatch = Boolean(
    userSector && openRoles.some((r) => checkRoleMatchesUser(r.roleLabel))
  );

  // Formatting compensation label & budget
  const estimatedTotal = budget?.estimatedTotal;
  const roleFees = (budget?.roleFees as Record<string, string>) || {};
  const targetLaunch = timeline?.targetLaunch;
  const estimatedDuration = timeline?.estimatedDuration;

  const getRoleFee = (role: { roleLabel: string; description?: string | null }) => {
    if (roleFees[role.roleLabel]) return roleFees[role.roleLabel];
    if (role.description?.includes("[Estimasi Fee:")) {
      const match = role.description.match(/\[Estimasi Fee:\s*([^\]]+)\]/);
      if (match?.[1]) return match[1].trim();
    }
    return null;
  };

  // Render Compensation Badge
  const renderCompensationBadge = () => {
    if (estimatedTotal) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fee: {estimatedTotal}</span>
        </span>
      );
    }
    const hasAnyFee = Object.keys(roleFees).length > 0;
    if (hasAnyFee) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Estimasi Fee per Peran</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
        <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
        <span>Honorarium Flat per Peran</span>
      </span>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. LIST VIEW MODE (Glassmorphic Dense Job Row)
  // ══════════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <Link
        href={`/projects/${id}`}
        className="glass-card group block p-4 sm:p-5 rounded-[22px] border-white/80 hover:border-[#4CC9FE]/40 transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Initiator Avatar */}
            <ActorAvatar
              name={creatorActor.name}
              avatarUrl={creatorActor.owner?.avatarUrl}
              className="w-10 h-10 rounded-full shrink-0 ring-2 ring-white/80 shadow-xs"
            />

            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <span>{creatorActor.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
                <span className="text-slate-300 text-xs">&bull;</span>
                <span className="text-[11px] text-slate-500">
                  {location || creatorActor.location || "Indonesia"}
                </span>
                <span className="text-slate-300 text-xs">&bull;</span>
                <span className="text-[11px] text-slate-400">
                  {daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}
                </span>

                {isSectorMatch && !isOwnBrief && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                    <Sparkles className="w-2.5 h-2.5 text-[#0284c7]" />
                    Sesuai Profil Anda
                  </span>
                )}
                {isOwnBrief && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                    Brief Anda
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug">
                {title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="px-2.5 py-0.5 bg-slate-100/80 text-slate-700 text-[10px] font-semibold rounded-full border border-slate-200/60">
                  {projectType}
                </span>
                {aestheticStyle && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tema: {aestheticStyle}
                  </span>
                )}
                {targetOutput && (
                  <span className="text-[11px] text-slate-600 font-medium">
                    Luaran: {targetOutput}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Roles Chips */}
          <div className="lg:w-80 shrink-0 space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Lowongan Kru: {openRoles.length} Terbuka dari {neededRoles.length} Peran
            </div>
            <div className="flex flex-wrap gap-1.5">
              {neededRoles.slice(0, 3).map((role) => {
                const matchesUser = checkRoleMatchesUser(role.roleLabel);
                const fee = getRoleFee(role);
                return (
                  <span
                    key={role.id}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                      role.isFilled
                        ? "bg-slate-100/60 text-slate-400 border-slate-200 line-through"
                        : matchesUser
                        ? "bg-[#4CC9FE] text-white border-[#4CC9FE] font-semibold shadow-xs"
                        : "bg-white/80 text-slate-700 border-white/80 font-medium"
                    }`}
                  >
                    <span>{role.roleLabel}</span>
                    {fee && !role.isFilled && (
                      <span className="ml-1 opacity-90 font-bold">&bull; {fee}</span>
                    )}
                  </span>
                );
              })}
              {neededRoles.length > 3 && (
                <span className="text-[11px] text-slate-500 px-1 py-0.5 font-medium">
                  +{neededRoles.length - 3} lainnya
                </span>
              )}
            </div>
          </div>

          {/* Compensation & CTA */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="text-left lg:text-right">
              {renderCompensationBadge()}
              <div className="text-[10px] text-slate-400 mt-1 flex items-center lg:justify-end gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{totalInterests} pelamar terdaftar</span>
              </div>
            </div>

            <div className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shrink-0">
              <span>{isOwnBrief ? "Kelola Brief" : "Lamar Peran"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. GRID VIEW MODE (Glassmorphic Editorial Card)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Link
      href={`/projects/${id}`}
      className="glass-card group flex flex-col justify-between rounded-[22px] border-white/80 hover:border-[#4CC9FE]/40 transition-all duration-300 overflow-hidden relative shadow-2xs hover:shadow-md"
    >
      {/* CARD TOP: INITIATOR INFO + COMPENSATION BADGE */}
      <div className="p-4 pb-2.5 border-b border-slate-100/80 flex items-start justify-between gap-3 bg-white/40">
        {/* Initiator Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <ActorAvatar
            name={creatorActor.name}
            avatarUrl={creatorActor.owner?.avatarUrl}
            className="w-9 h-9 rounded-full shrink-0 ring-2 ring-white/80 shadow-xs"
          />

          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
              <span>{creatorActor.name}</span>
              <span title="Inisiator Terverifikasi">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span>{creatorActor.sector}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                <span>{location || creatorActor.location || "Indonesia"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Status / Compensation */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {renderCompensationBadge()}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-medium rounded-full border ${statusCfg.badge}`}
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
      <div className="p-4 space-y-3 flex-1">
        {/* Project Title & Category tags */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100/90 text-slate-700 text-[10px] font-semibold rounded-full uppercase tracking-wider border border-slate-200/60">
              {projectType}
            </span>
            {aestheticStyle && (
              <span className="px-2 py-0.5 bg-white/80 text-slate-600 text-[10px] font-medium rounded-full border border-white/80">
                {aestheticStyle}
              </span>
            )}
            {isSectorMatch && !isOwnBrief && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-[#0284c7]" />
                Sesuai Profil Anda
              </span>
            )}
            {isOwnBrief && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200/80">
                Brief Anda
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-xs text-slate-600 font-normal leading-relaxed">
            {description}
          </p>
        </div>

        {/* DELIVERABLE & TIMELINE METADATA */}
        <div className="p-2.5 bg-white/70 backdrop-blur-xs rounded-xl border border-white/80 space-y-1.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 shrink-0">
              <Layers className="w-3 h-3 text-slate-400" />
              Target Luaran:
            </span>
            <span className="text-[11px] font-semibold text-slate-800 text-right">
              {targetOutput || "Produksi Kreatif"}
            </span>
          </div>

          {(targetLaunch || estimatedDuration) && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3 h-3 text-slate-400" />
                Jadwal Produksi:
              </span>
              <span className="text-[11px] font-semibold text-slate-800 text-right">
                {targetLaunch || estimatedDuration}
              </span>
            </div>
          )}
        </div>

        {/* NEEDED ROLES BREAKDOWN WITH SLOTS */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-slate-400" />
              Lowongan Kru ({neededRoles.length} Peran)
            </span>
            {openRoles.length > 0 ? (
              <span className="text-[10px] font-semibold text-emerald-700">
                {openRoles.length} slot terbuka
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-slate-400" />
                Semua Terisi
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {neededRoles.map((role) => {
              const matchesUser = checkRoleMatchesUser(role.roleLabel);
              const fee = getRoleFee(role);
              return (
                <span
                  key={role.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] transition-all ${
                    role.isFilled
                      ? "bg-slate-100/60 text-slate-400 border border-slate-200/70 line-through"
                      : matchesUser
                      ? "bg-[#4CC9FE] text-white font-semibold shadow-xs"
                      : "bg-white/80 text-slate-700 border border-white/80 font-medium hover:border-slate-300"
                  }`}
                >
                  {role.isFilled ? (
                    <Check className="w-2.5 h-2.5 text-slate-400" />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        matchesUser ? "bg-white" : "bg-emerald-500"
                      }`}
                    />
                  )}
                  <span>{role.roleLabel}</span>
                  {fee && !role.isFilled && (
                    <span className="font-semibold text-emerald-700 ml-0.5">&bull; {fee}</span>
                  )}
                  {matchesUser && !role.isFilled && (
                    <span className="text-[9px] font-bold text-white/90 ml-0.5">
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
      <div className="px-4 py-2.5 bg-white/50 backdrop-blur-xs border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-500 text-[10px]">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Users className="w-3 h-3 text-slate-400" />
            {totalInterests} pelamar
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-300" />
            {daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}
          </span>
        </div>

        <div className="btn-primary-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold">
          <span>{isOwnBrief ? "Kelola Brief" : "Lamar Peran"}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
