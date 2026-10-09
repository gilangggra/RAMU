"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  Check,
  AlertTriangle,
  Clock,
  ExternalLink,
  Ban,
  X,
  Calendar,
  Layers,
} from "lucide-react";
import {
  approveProjectBriefAction,
  takeDownProjectBriefAction,
  interveneTimeoutBriefAction,
} from "@/app/admin/actions";
import { ProjectBriefStatus } from "@prisma/client";

interface BriefItem {
  id: string;
  title: string;
  projectType: string;
  status: ProjectBriefStatus;
  createdAt: string | Date;
  creatorActor: {
    id: string;
    name: string;
    sector: string;
  };
  _count: {
    interests: number;
    neededRoles: number;
  };
  timeline?: any;
}

export function ProjectModerationClient({ initialBriefs }: { initialBriefs: BriefItem[] }) {
  const [briefs, setBriefs] = useState<BriefItem[]>(initialBriefs);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State for Take Down
  const [takeDownBrief, setTakeDownBrief] = useState<BriefItem | null>(null);
  const [takeDownReason, setTakeDownReason] = useState("");

  const now = new Date().getTime();

  const isTimeoutWarning = (brief: BriefItem) => {
    if (brief.status !== "OPEN") return false;
    const createdTime = new Date(brief.createdAt).getTime();
    const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && brief._count.interests > 0;
  };

  const filtered = briefs.filter((brief) => {
    if (filter === "TIMEOUT") return isTimeoutWarning(brief);
    if (filter !== "ALL" && brief.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        brief.title.toLowerCase().includes(q) ||
        brief.creatorActor.name.toLowerCase().includes(q) ||
        brief.projectType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (brief: BriefItem) => {
    if (!confirm(`Setujui dan publikasikan project brief "${brief.title}"?`)) return;

    startTransition(async () => {
      const res = await approveProjectBriefAction(brief.id);
      if (res.success) {
        setBriefs((prev) =>
          prev.map((b) => (b.id === brief.id ? { ...b, status: "OPEN" } : b))
        );
      } else {
        alert(res.error || "Gagal menyetujui brief.");
      }
    });
  };

  const handleTakeDownSubmit = () => {
    if (!takeDownBrief || !takeDownReason.trim()) {
      alert("Alasan penurunan brief wajib disertakan.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("briefId", takeDownBrief.id);
      formData.set("reason", takeDownReason.trim());

      const res = await takeDownProjectBriefAction(formData);
      if (res.success) {
        setBriefs((prev) =>
          prev.map((b) => (b.id === takeDownBrief.id ? { ...b, status: "TAKEN_DOWN" } : b))
        );
        setTakeDownBrief(null);
        setTakeDownReason("");
      } else {
        alert(res.error || "Gagal menurunkan brief.");
      }
    });
  };

  const handleIntervene = (briefId: string, action: "CLOSE" | "EXTEND") => {
    const confirmMsg =
      action === "CLOSE"
        ? "Tutup paksa brief ini karena inaktivitas terhadap pelamar?"
        : "Perpanjang durasi toleransi brief ini selama 7 hari tambahan?";
    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await interveneTimeoutBriefAction(briefId, action, 7);
      if (res.success) {
        if (action === "CLOSE") {
          setBriefs((prev) =>
            prev.map((b) => (b.id === briefId ? { ...b, status: "CLOSED" } : b))
          );
        } else {
          alert("Batas waktu respon brief berhasil diperpanjang 7 hari.");
        }
      } else {
        alert(res.error || "Gagal melakukan intervensi brief.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: "Semua Brief" },
            { id: "IN_REVIEW", label: "Menunggu Review" },
            { id: "TIMEOUT", label: "⚠️ Timeout (>7h)" },
            { id: "OPEN", label: "Terbuka (Open)" },
            { id: "FILLED", label: "Terisi (Filled)" },
            { id: "TAKEN_DOWN", label: "Diturunkan" },
            { id: "CLOSED", label: "Ditutup" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-[#4CC9FE] text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:text-[#111827] hover:bg-white/80 border border-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari judul brief atau kreator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderKanban className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada project brief yang cocok</p>
            <p className="text-[11px] text-slate-400 font-normal">Silakan ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/80 bg-white/30">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Judul &amp; Tipe Proyek
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pemilik Brief
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status &amp; Toleransi
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Peran &amp; Pelamar
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Aksi Moderasi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filtered.map((brief) => {
                  const hasTimeout = isTimeoutWarning(brief);

                  return (
                    <tr key={brief.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-[#111827] line-clamp-1">{brief.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500">{brief.projectType}</span>
                            <span className="text-[10px] text-slate-400">• {new Date(brief.createdAt).toLocaleDateString("id-ID")}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-slate-800">{brief.creatorActor.name}</p>
                        <p className="text-[10px] text-slate-400">{brief.creatorActor.sector}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border inline-block ${
                              brief.status === "OPEN"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                                : brief.status === "IN_REVIEW"
                                ? "bg-purple-50 text-purple-700 border-purple-200/70 animate-pulse"
                                : brief.status === "FILLED"
                                ? "bg-sky-50 text-sky-700 border-sky-200/70"
                                : brief.status === "TAKEN_DOWN"
                                ? "bg-rose-50 text-rose-700 border-rose-200/70 font-bold"
                                : "bg-slate-100 text-slate-600 border-slate-200/70"
                            }`}
                          >
                            {brief.status}
                          </span>

                          {hasTimeout && (
                            <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/80">
                              <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span>Inaktif &gt;7 hari ({brief._count.interests} pelamar)</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="text-xs text-slate-700 font-medium">
                          {brief._count.neededRoles} Peran Kru Dibutuhkan
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {brief._count.interests} Kreator Melamar
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            href={`/projects/${brief.id}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 border border-slate-200/60"
                          >
                            <span>Detail</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>

                          {/* Approval for IN_REVIEW */}
                          {brief.status === "IN_REVIEW" && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleApprove(brief)}
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Setujui Brief untuk tayang publik"
                            >
                              <Check className="w-3 h-3" />
                              <span>Setujui</span>
                            </button>
                          )}

                          {/* Timeout Intervention Buttons */}
                          {hasTimeout && (
                            <>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleIntervene(brief.id, "EXTEND")}
                                className="px-2 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 text-[10px] font-semibold transition-colors cursor-pointer"
                                title="Perpanjang batas waktu respon 7 hari"
                              >
                                +7 Hari
                              </button>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleIntervene(brief.id, "CLOSE")}
                                className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 text-[10px] font-semibold transition-colors cursor-pointer"
                                title="Tutup brief karena inaktif"
                              >
                                Tutup
                              </button>
                            </>
                          )}

                          {/* Take Down Button */}
                          {brief.status !== "TAKEN_DOWN" && brief.status !== "CLOSED" && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => {
                                setTakeDownBrief(brief);
                                setTakeDownReason("");
                              }}
                              className="px-2 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Turunkan brief yang melanggar aturan"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Take-Down</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Take Down Reason Modal */}
      {takeDownBrief && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[24px] p-6 shadow-xl border border-white/75 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-[#111827]">
                  Take-Down Project Brief
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTakeDownBrief(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200/70 text-xs text-rose-900 leading-relaxed font-normal">
              Anda akan menurunkan brief: <strong>&ldquo;{takeDownBrief.title}&rdquo;</strong>.
              Brief ini tidak akan lagi tampil di direktori pencarian proyek publik dan pemilik brief akan menerima notifikasi penjelasan.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Alasan Penurunan Proyek (Wajib diisi):
              </label>
              <textarea
                rows={4}
                value={takeDownReason}
                onChange={(e) => setTakeDownReason(e.target.value)}
                placeholder="Contoh: Ditemukan indikasi penipuan, kompensasi tidak wajar, atau brief fiktif tanpa entitas resmi..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakeDownBrief(null)}
                className="px-3.5 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleTakeDownSubmit}
                className="px-3.5 py-2 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
              >
                {isPending ? "Menyimpan..." : "Konfirmasi Take-Down"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
