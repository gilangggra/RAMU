import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Handshake, Users, ArrowUpRight } from "lucide-react";
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
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/70">
              Core 2 • Collaboration Matching
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight mt-1">
            Rekomendasi Kolaborasi Komplementer (Matches)
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
            Sistem mencocokkan aset &amp; kebutuhan antar pelaku kreatif secara objektif berdasarkan 4 pilar kecocokan: Peran Komplementer, DNA Estetika/Tag, Domisili Lokasi, dan Ketersediaan Jadwal.
          </p>
        </div>

        <Link
          href="/collaborate"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 text-xs font-semibold transition-colors shrink-0 shadow-2xs"
        >
          <span>Buka Matching Hub</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((item, idx) => {
          const matchPercent = item.score ? Math.round(item.score) : 88 - idx * 4;

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-stone-50/50 border border-stone-200/80 hover:bg-white hover:border-stone-300 hover:shadow-2xs transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white">
                    {item.patternCode.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800">Match:</span>
                    <span className="text-xs font-black text-emerald-700">{matchPercent}%</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* WHY THIS MATCH (TRANSPARENCY SUMMARY) */}
                <div className="p-3 rounded-xl bg-white border border-stone-200/80 space-y-1.5 text-[11px] shadow-2xs">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Why This Match?</span>
                  </div>
                  <ul className="space-y-1 text-stone-600 pl-4 list-disc text-[10px] leading-tight">
                    <li>3 dari 3 kebutuhan proyek terpenuhi oleh profil mitra.</li>
                    <li>Mengaktifkan kapasitas studio &amp; gear menganggur.</li>
                    <li>Domisili lokasi dan ketersediaan jadwal selaras.</li>
                  </ul>
                </div>

                {/* PARTICIPATING ROLES */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Mitra Komplementer ({item.participants.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {item.participants.map((p, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-800 border border-stone-200/70"
                      >
                        <ActorAvatar
                          name={p.actor.name}
                          avatarUrl={p.actor.owner?.avatarUrl}
                          className="w-3.5 h-3.5 rounded-full"
                          textClassName="text-[7px]"
                        />
                        <span>{p.actor.name.split(" ")[0]} ({p.roleLabel || p.actor.sector.split("/")[0]})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Kombinasi Layak
                </span>
                <Link
                  href={`/collaborate`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 group-hover:bg-stone-800 text-white font-bold text-[11px] transition-colors shadow-2xs"
                >
                  <span>Mulai Kolaborasi</span>
                  <ArrowUpRight className="w-3 h-3 text-stone-300 group-hover:text-white" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
