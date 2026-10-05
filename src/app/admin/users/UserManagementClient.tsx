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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: "Semua Akun" },
            { id: "ACTIVE", label: "Aktif" },
            { id: "CURATED", label: "★ Curated Spotlight" },
            { id: "VERIFIED", label: "✓ Terverifikasi" },
            { id: "DRAFT", label: "Draf" },
            { id: "SUSPENDED", label: "Suspended" },
            { id: "BANNED", label: "Banned" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-[#1E1B2E] text-white shadow-xs"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari talenta atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-[#27213D] outline-none bg-transparent placeholder-stone-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-700">Tidak ada profil yang cocok</p>
            <p className="text-[11px] text-stone-400">Silakan ubah filter atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Talenta & Sektor
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Badge & Kurasi
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Status Akun
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Aset & Booking
                  </th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Intervensi Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filtered.map((actor) => (
                  <tr key={actor.id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-black shrink-0">
                          {actor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1E1B2E]">{actor.name}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                              {actor.actorType}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">{actor.sector}</p>
                          {actor.owner?.email && (
                            <p className="text-[10px] text-stone-400">{actor.owner.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Verified & Curated Spotlight */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Verified Badge */}
                        {actor.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Belum Verifikasi</span>
                        )}

                        {/* Curated Spotlight Toggle Button */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleCurated(actor)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            actor.isCurated
                              ? "bg-amber-100 text-amber-800 border-amber-300 shadow-2xs"
                              : "bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-700 hover:bg-stone-100"
                          }`}
                          title={actor.isCurated ? "Hapus dari Curated Spotlight" : "Pajang di Curated Spotlight"}
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${actor.isCurated ? "text-amber-600 fill-amber-500" : ""}`} />
                          <span>{actor.isCurated ? "Spotlight" : "+ Spotlight"}</span>
                        </button>
                      </div>
                    </td>

                    {/* Status Display */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          actor.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : actor.status === "DRAFT"
                            ? "bg-stone-100 text-stone-600 border-stone-200"
                            : actor.status === "PAUSED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : actor.status === "SUSPENDED"
                            ? "bg-amber-50 text-amber-800 border-amber-300 font-extrabold"
                            : "bg-rose-50 text-rose-700 border-rose-300 font-extrabold"
                        }`}
                      >
                        {actor.status}
                      </span>
                    </td>

                    {/* Assets & Bookings */}
                    <td className="px-4 py-4">
                      <p className="text-xs text-stone-600 font-medium">
                        {actor._count.assets} Aset Portofolio
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {actor._count.bookingRequestsReceived} Pesanan Booking
                      </p>
                    </td>

                    {/* Actions: Status Interventions only (No personal data modification) */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/directory/${actor.id}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
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
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-[#1E1B2E]">
                  Pemberian Sanksi Akun: {selectedActor.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedActor(null);
                  setTargetStatus(null);
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              Anda akan mengubah status akun ini menjadi <strong>{targetStatus}</strong>.
              Tindakan ini akan membatasi akses kreator dan tercatat secara permanen di <strong>User Sanction Log</strong> dan <strong>Admin Audit Trail</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Alasan Penangguhan / Pemblokiran (Wajib diisi):
              </label>
              <textarea
                rows={4}
                value={sanctionReason}
                onChange={(e) => setSanctionReason(e.target.value)}
                placeholder="Contoh: Laporan terverifikasi mengenai plagiarisme portofolio atau pelanggaran kontrak komersial..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-[#27213D] focus:border-rose-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedActor(null);
                  setTargetStatus(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSanctionSubmit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
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
