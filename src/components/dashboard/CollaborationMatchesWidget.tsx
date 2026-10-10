import React from "react";
import Link from "next/link";
import { Handshake, ArrowRight, CheckCircle2, ArrowUpRight, Users } from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

interface MatchParticipant {
  actor: {
    name: string;
    sector: string;
    location?: string | null;
    owner?: {
      avatarUrl?: string | null;
    } | null;
  };
  roleLabel?: string | null;
  roleCode?: string;
}

interface MatchOpportunity {
  id: string;
  title: string;
  description: string;
  patternCode: string;
  feasibilityStatus: string;
  score?: number;
  participants: MatchParticipant[];
  whyBullets?: string[];
}

interface CollaborationMatchesWidgetProps {
  matches: MatchOpportunity[];
}

export function CollaborationMatchesWidget({ matches }: CollaborationMatchesWidgetProps) {
  return (
    <div className="p-5 md:p-6 rounded-[24px] bg-white/95 border border-stone-200/80 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center">
              <Handshake className="w-3.5 h-3.5 text-[#0284c7]" />
            </div>
            <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
              Rekomendasi Kolaborasi
            </h2>
            <span className="text-[10px] font-bold text-[#0284c7] bg-[#4CC9FE]/15 px-2.5 py-0.5 rounded-full border border-[#4CC9FE]/30">
              {matches.length} Peluang
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-xl font-normal">
            Peluang kerja sama yang cocok dengan peran, domisili, dan inventaris yang Anda sediakan.
          </p>
        </div>

        <Link
          href="/directory?tab=matched"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] border border-white/80 text-xs font-semibold transition-all shrink-0 shadow-xs"
        >
          <span>Semua Rekomendasi</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 shadow-2xs">
            <Users className="w-5 h-5 text-[#0284c7]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900">Belum Ada Rekomendasi</h3>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed font-normal">
              Lengkapi ketersediaan aset dan preferensi peran Anda untuk menemukan kecocokan mitra secara otomatis.
            </p>
          </div>
          <Link
            href="/directory?tab=matched"
            className="btn-primary-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs"
          >
            <span>Cari Kolaborator</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {matches.map((item) => {
            const matchPercent = item.score ? Math.round(item.score) : 85;
            const reasons = item.whyBullets && item.whyBullets.length > 0
              ? item.whyBullets
              : [
                  "Peran & perlengkapan saling melengkapi",
                  "Studio & alat siap pakai",
                  "Lokasi & jadwal kerja sejalan",
                ];

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-[20px] bg-white/70 hover:bg-white/95 border border-white/90 hover:border-white hover:shadow-xs transition-all space-y-3 flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0f172a] text-white">
                      {item.patternCode.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-bold text-[#0f172a] bg-white/90 px-2.5 py-0.5 rounded-full border border-white/80 tabular-nums shadow-2xs">
                      Cocok {matchPercent}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#0284c7] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#475569] mt-1 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* WHY THIS MATCH */}
                  <div className="p-3 rounded-[16px] bg-white/60 border border-white/80 space-y-1 text-xs">
                    <div className="font-semibold text-slate-700 flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                      <span>Faktor Kesesuaian:</span>
                    </div>
                    <ul className="space-y-0.5 text-[#475569] pl-3.5 list-disc text-xs leading-relaxed font-normal">
                      {reasons.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* PARTICIPATING ROLES EQUATION */}
                  <div className="p-3 rounded-[16px] bg-white/60 border border-white/80 space-y-1.5">
                    <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider flex items-center justify-between">
                      <span>Formula Tim Produksi:</span>
                      <span className="text-[#0f172a] font-bold">{item.participants.length} Komplementer</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.participants.map((p, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-slate-300 font-bold text-xs">+</span>}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-[#0f172a] border border-white/80 shadow-2xs">
                            <ActorAvatar
                              name={p.actor.name}
                              avatarUrl={p.actor.owner?.avatarUrl}
                              className="w-3.5 h-3.5 rounded-full"
                              textClassName="text-[8px]"
                            />
                            <span>{p.actor.name.split(" ")[0]} ({p.roleLabel || p.actor.sector.split("/")[0]})</span>
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#475569] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Siap Dijalankan
                  </span>
                  <Link
                    href="/directory?tab=matched"
                    className="btn-primary-pill inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold"
                  >
                    <span>Mulai</span>
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
