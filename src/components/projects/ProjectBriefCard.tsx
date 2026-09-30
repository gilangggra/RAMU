"use client";

import Link from "next/link";
import { Target, Check, Circle, MapPin } from "lucide-react";

interface ProjectBriefRole {
  id: string;
  roleLabel: string;
  assetCategory: string;
  isFilled: boolean;
  interests?: { id: string; status: string }[];
}

interface ProjectBriefCardProps {
  id: string;
  title: string;
  description: string;
  projectType: string;
  targetOutput: string;
  location?: string | null;
  status: string;
  neededRoles: ProjectBriefRole[];
  creatorActor: {
    name: string;
    sector: string;
  };
  createdAt: Date;
  isOwnBrief?: boolean;
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
    badge: "bg-stone-50 text-amber-800 border-stone-200",
    dot: "bg-[#1E1B2E]",
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
  status,
  neededRoles,
  creatorActor,
  createdAt,
  isOwnBrief = false,
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

  return (
    <Link
      href={`/projects/${id}`}
      className="group block p-6 sm:p-7 bg-white border border-stone-200 hover:border-stone-800 transition-all duration-300 shadow-2xs hover:shadow-md space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
              {projectType}
            </span>
            <span className="text-stone-300">•</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold border ${statusCfg.badge}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${status === "OPEN" ? "animate-pulse" : ""}`}
              />
              {statusCfg.label}
            </span>
            {isOwnBrief && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                Brief Anda
              </span>
            )}
          </div>

          <h3 className="text-lg font-medium text-[#1E1B2E] tracking-tight group-hover:text-stone-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-stone-500 font-light leading-relaxed line-clamp-2">{description}</p>

      {/* Target Output Row */}
      <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
          Target Luaran:
        </span>
        <span className="text-xs font-medium text-stone-800 truncate">{targetOutput}</span>
      </div>

      {/* Roles Row */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
            Peran Dibutuhkan ({neededRoles.length})
          </span>
          {openRoles.length > 0 ? (
            <span className="text-[11px] font-semibold text-amber-800">
              {openRoles.length} peran terbuka
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Lengkap</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {neededRoles.map((role) => (
            <span
              key={role.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border ${
                role.isFilled
                  ? "bg-stone-50 text-stone-400 border-stone-200 line-through"
                  : "bg-white text-stone-800 border-stone-200 shadow-2xs"
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

      {/* Creator & Meta Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-[#1E1B2E] shrink-0">
            {creatorActor.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#1E1B2E] truncate">
              {creatorActor.name}
            </div>
            <div className="text-[10px] text-stone-400 font-light truncate">{creatorActor.sector}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-400 shrink-0 font-light">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{location}</span>
            </span>
          )}
          {totalInterests > 0 && (
            <span className="text-stone-800 font-semibold">
              {totalInterests} minat
            </span>
          )}
          <span>{daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}</span>
        </div>
      </div>
    </Link>
  );
}
