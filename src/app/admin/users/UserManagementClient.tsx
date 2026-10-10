"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Ban,
  CheckCircle2,
  X,
  ShieldAlert,
} from "lucide-react";
import { updateActorStatusAction, toggleActorCuratedAction } from "@/app/admin/actions";
import { ActorStatus } from "@prisma/client";

interface ActorItem {
  id: string;
  name: string;
  sector: string;
  actorType: string;
  status: ActorStatus;
  isVerified: boolean;
  isCurated: boolean;
  createdAt: string | Date;
  owner?: { email?: string | null } | null;
  _count: {
    assets: number;
    bookingRequestsReceived: number;
  };
}

export function UserManagementClient({ initialActors }: { initialActors: ActorItem[] }) {
  const [actors, setActors] = useState<ActorItem[]>(initialActors);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sanction Modal State
  const [selectedActor, setSelectedActor] = useState<ActorItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<ActorStatus | null>(null);
  const [sanctionReason, setSanctionReason] = useState("");

  const filtered = actors.filter((actor) => {
    if (filter === "CURATED" && !actor.isCurated) return false;
    if (filter === "VERIFIED" && !actor.isVerified) return false;
    if (filter !== "ALL" && filter !== "CURATED" && filter !== "VERIFIED" && actor.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        actor.name.toLowerCase().includes(q) ||
        actor.sector.toLowerCase().includes(q) ||
        (actor.owner?.email && actor.owner.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggleCurated = (actor: ActorItem) => {
    const nextVal = !actor.isCurated;
    startTransition(async () => {
      const res = await toggleActorCuratedAction(actor.id, nextVal);
      if (res.success) {
        setActors((prev) =>
          prev.map((a) => (a.id === actor.id ? { ...a, isCurated: nextVal } : a))
        );
      } else {
        alert(res.error || "Gagal mengubah status kurasi.");
      }
    });
  };

  const handleStatusChangeRequest = (actor: ActorItem, newStatus: ActorStatus) => {
    if (newStatus === "SUSPENDED" || newStatus === "BANNED") {
      setSelectedActor(actor);
      setTargetStatus(newStatus);
      setSanctionReason("");
    } else {
      // Direct update for ACTIVE or other
      if (!confirm(`Konfirmasi aktifkan kembali akun "${actor.name}"?`)) return;

      startTransition(async () => {
        const formData = new FormData();
        formData.set("actorId", actor.id);
        formData.set("status", newStatus);
        formData.set("reason", "Diaktifkan kembali oleh administrator.");

        const res = await updateActorStatusAction(formData);
        if (res.success) {
          setActors((prev) =>
            prev.map((a) => (a.id === actor.id ? { ...a, status: newStatus } : a))
          );
        } else {
          alert(res.error || "Gagal memperbarui status.");
        }
      });
    }
  };

  const handleSanctionSubmit = () => {
    if (!selectedActor || !targetStatus) return;
    if (!sanctionReason.trim() || sanctionReason.trim().length < 5) {
      alert("Alasan penangguhan/pemblokiran wajib disertakan (minimal 5 karakter).");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("actorId", selectedActor.id);
      formData.set("status", targetStatus);
      formData.set("reason", sanctionReason.trim());

      const res = await updateActorStatusAction(formData);
      if (res.success) {
        setActors((prev) =>
          prev.map((a) => (a.id === selectedActor.id ? { ...a, status: targetStatus } : a))
        );
        setSelectedActor(null);
        setTargetStatus(null);
        setSanctionReason("");
      } else {
        alert(res.error || "Gagal menerapkan sanksi.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: "Semua Akun" },
            { id: "ACTIVE", label: "Aktif" },
            { id: "CURATED", label: "★ Spotlight" },
            { id: "VERIFIED", label: "✓ Terverifikasi" },
            { id: "DRAFT", label: "Draf" },
            { id: "SUSPENDED", label: "Suspended" },
            { id: "BANNED", label: "Banned" },
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
            placeholder="Cari talenta atau email..."
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
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada profil yang cocok</p>
            <p className="text-[11px] text-slate-400 font-normal">Silakan ubah filter atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/80 bg-white/30">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Talenta &amp; Sektor
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Badge &amp; Kurasi
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status Akun
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Aset &amp; Booking
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Intervensi Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filtered.map((actor) => (
                  <tr key={actor.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                          {actor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#111827]">{actor.name}</span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200/60">
                              {actor.actorType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{actor.sector}</p>
                          {actor.owner?.email && (
                            <p className="text-[10px] text-slate-400">{actor.owner.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Verified & Curated Spotlight */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Verified Badge */}
                        {actor.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Belum Verifikasi</span>
                        )}

                        {/* Curated Spotlight Toggle Button */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleCurated(actor)}
                          className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            actor.isCurated
                              ? "bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs"
                              : "bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                          title={actor.isCurated ? "Hapus dari Curated Spotlight" : "Pajang di Curated Spotlight"}
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${actor.isCurated ? "text-amber-600 fill-amber-500" : ""}`} />
                          <span>{actor.isCurated ? "Spotlight" : "+ Spotlight"}</span>
                        </button>
                      </div>
                    </td>

                    {/* Status Display */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          actor.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                            : actor.status === "DRAFT"
                            ? "bg-slate-100 text-slate-600 border-slate-200/70"
                            : actor.status === "PAUSED"
                            ? "bg-sky-50 text-sky-700 border-sky-200/70"
                            : actor.status === "SUSPENDED"
                            ? "bg-amber-50 text-amber-800 border-amber-200/70 font-bold"
                            : "bg-rose-50 text-rose-700 border-rose-200/70 font-bold"
                        }`}
                      >
                        {actor.status}
                      </span>
                    </td>

                    {/* Assets & Bookings */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-700 font-medium">
                        {actor._count.assets} Aset Portofolio
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {actor._count.bookingRequestsReceived} Pesanan Booking
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/directory/${actor.id}`}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 border border-slate-200/60"
                        >
                          <span>Profil</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>

                        {/* Status Toggle Buttons */}
                        {actor.status !== "ACTIVE" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChangeRequest(actor, "ACTIVE")}
                            className="px-2 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Aktifkan Akun"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktifkan</span>
                          </button>
                        )}

                        {actor.status !== "SUSPENDED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChangeRequest(actor, "SUSPENDED")}
                            className="px-2 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Tangguhkan Akun (Suspend)"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        )}

                        {actor.status !== "BANNED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChangeRequest(actor, "BANNED")}
                            className="px-2 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Blokir Akun Permanen (Ban)"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Ban</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mandatory Sanction Reason Modal */}
      {selectedActor && targetStatus && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[24px] p-6 shadow-xl border border-white/75 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-[#111827]">
                  Pemberian Sanksi Akun: {selectedActor.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedActor(null);
                  setTargetStatus(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 leading-relaxed font-normal">
              Anda akan mengubah status akun ini menjadi <strong>{targetStatus}</strong>.
              Tindakan ini akan membatasi akses kreator dan tercatat secara permanen di <strong>User Sanction Log</strong> dan <strong>Admin Audit Trail</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Alasan Penangguhan / Pemblokiran (Wajib diisi):
              </label>
              <textarea
                rows={4}
                value={sanctionReason}
                onChange={(e) => setSanctionReason(e.target.value)}
                placeholder="Contoh: Laporan terverifikasi mengenai plagiarisme portofolio atau pelanggaran kontrak komersial..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedActor(null);
                  setTargetStatus(null);
                }}
                className="px-3.5 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSanctionSubmit}
                className="px-3.5 py-2 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
              >
                {isPending ? "Menyimpan..." : `Konfirmasi ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
