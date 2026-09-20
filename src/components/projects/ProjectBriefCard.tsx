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
    badge: "bg-primary-950 text-primary-300 border-primary-700/50",
    dot: "bg-primary-400",
  },
  IN_REVIEW: {
    label: "Tahap Review",
    badge: "bg-amber-950/60 text-amber-300 border-amber-600/40",
    dot: "bg-amber-400",
  },
  FILLED: {
    label: "Peran Terisi",
    badge: "bg-blue-950/60 text-blue-300 border-blue-600/40",
    dot: "bg-blue-400",
  },
  CLOSED: {
    label: "Selesai",
    badge: "bg-neutral-800 text-neutral-400 border-neutral-700",
    dot: "bg-neutral-500",
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
      className="group block p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-primary-600/60 hover:shadow-xl hover:shadow-primary-950/20 transition-all duration-200 space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badge}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${status === "OPEN" ? "animate-pulse" : ""}`}
              />
              {statusCfg.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
              {projectType}
            </span>
            {isOwnBrief && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Brief Anda
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-neutral-100 tracking-tight group-hover:text-primary-300 transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{description}</p>

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
        <Target className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">
            Target Luaran Kolektif
          </div>
          <p className="text-xs text-neutral-200 font-medium line-clamp-1">{targetOutput}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Peran Kolaborator ({neededRoles.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {neededRoles.map((role) => (
            <span
              key={role.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                role.isFilled
                  ? "bg-primary-950/60 text-primary-300 border-primary-700/40 line-through opacity-75"
                  : "bg-neutral-800/80 text-neutral-300 border-neutral-700/60"
              }`}
            >
              {role.isFilled ? (
                <Check className="w-3 h-3 text-primary-300" />
              ) : (
                <Circle className="w-2.5 h-2.5 text-neutral-400" />
              )}
              <span>{role.roleLabel}</span>
            </span>
          ))}
        </div>
        {openRoles.length > 0 && (
          <p className="text-[11px] text-amber-400 font-medium">
            {openRoles.length} dari {neededRoles.length} peran terbuka
          </p>
        )}
        {filledRoles.length === neededRoles.length && (
          <p className="text-[11px] text-primary-300 font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Seluruh peran telah diterima</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center text-xs font-bold text-primary-200 shrink-0">
            {creatorActor.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-neutral-200 truncate">
              {creatorActor.name}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">{creatorActor.sector}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-neutral-400 shrink-0">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span>{location}</span>
            </span>
          )}
          {totalInterests > 0 && (
            <span className="text-primary-400 font-semibold">
              {totalInterests} minat
            </span>
          )}
          <span>{daysAgo === 0 ? "Hari ini" : `${daysAgo}h lalu`}</span>
        </div>
      </div>
    </Link>
  );
}
