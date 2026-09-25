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
      className="group block p-6 rounded-[28px] bg-white/95 border border-stone-200/80 hover:border-amber-300/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] hover:shadow-[0_15px_35px_rgba(39,33,61,0.07)] transition-all duration-200 space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badge}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${status === "OPEN" ? "animate-pulse" : ""}`}
              />
              {statusCfg.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              {projectType}
            </span>
            {isOwnBrief && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-50 text-[#1E1B2E] border border-stone-200">
                Brief Anda
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight group-hover:text-[#1E1B2E] transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{description}</p>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
        <Target className="w-4 h-4 text-[#1E1B2E] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-0.5">
            Target Luaran Kolektif
          </div>
          <p className="text-xs text-[#1E1B2E] font-medium line-clamp-1">{targetOutput}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Peran Kolaborator ({neededRoles.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {neededRoles.map((role) => (
            <span
              key={role.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                role.isFilled
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-75"
                  : "bg-white text-[#1E1B2E] border-stone-200/80 shadow-2xs"
              }`}
            >
              {role.isFilled ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Circle className="w-2.5 h-2.5 text-stone-400" />
              )}
              <span>{role.roleLabel}</span>
            </span>
          ))}
        </div>
        {openRoles.length > 0 && (
          <p className="text-[11px] text-amber-800 font-semibold">
            {openRoles.length} dari {neededRoles.length} peran terbuka
          </p>
        )}
        {filledRoles.length === neededRoles.length && (
          <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Seluruh peran telah diterima</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
            {creatorActor.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#1E1B2E] truncate">
              {creatorActor.name}
            </div>
            <div className="text-[10px] text-stone-500 truncate">{creatorActor.sector}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-500 shrink-0">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{location}</span>
            </span>
          )}
          {totalInterests > 0 && (
            <span className="text-[#1E1B2E] font-bold">
              {totalInterests} minat
            </span>
          )}
          <span>{daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}</span>
        </div>
      </div>
    </Link>
  );
}
