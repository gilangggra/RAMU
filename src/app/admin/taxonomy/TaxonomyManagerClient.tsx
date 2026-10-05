"use client";

import { useState, useTransition } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Check,
  X,
  Power,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";
import {
  createTaxonomySectorAction,
  toggleTaxonomySectorAction,
  deleteTaxonomySectorAction,
  createAestheticTagAction,
  toggleAestheticTagAction,
  deleteAestheticTagAction,
} from "@/app/admin/actions";

interface SectorItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string | Date;
}

interface AestheticItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string | Date;
}

export function TaxonomyManagerClient({
  initialSectors,
  initialAesthetics,
}: {
  initialSectors: SectorItem[];
  initialAesthetics: AestheticItem[];
}) {
  const [sectors, setSectors] = useState<SectorItem[]>(initialSectors);
  const [aesthetics, setAesthetics] = useState<AestheticItem[]>(initialAesthetics);
  const [newSector, setNewSector] = useState("");
  const [newAesthetic, setNewAesthetic] = useState("");
  const [isPending, startTransition] = useTransition();

  // Search filter
  const [sectorSearch, setSectorSearch] = useState("");
  const [aestheticSearch, setAestheticSearch] = useState("");

  const handleAddSector = () => {
    const val = newSector.trim();
    if (!val) return;

    startTransition(async () => {
      const res = await createTaxonomySectorAction(val);
      if (res.success && res.sector) {
        setSectors((prev) => [...prev, res.sector as any]);
        setNewSector("");
      } else {
        alert(res.error || "Gagal menambah sektor.");
      }
    });
  };

  const handleToggleSector = (id: string, currentStatus: boolean) => {
    const nextVal = !currentStatus;
    startTransition(async () => {
      const res = await toggleTaxonomySectorAction(id, nextVal);
      if (res.success) {
        setSectors((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: nextVal } : s))
        );
      } else {
        alert(res.error || "Gagal mengubah status sektor.");
      }
    });
  };

  const handleDeleteSector = (id: string, name: string) => {
    if (!confirm(`Hapus sektor "${name}" dari database permanen?`)) return;

    startTransition(async () => {
      const res = await deleteTaxonomySectorAction(id);
      if (res.success) {
        setSectors((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(res.error || "Gagal menghapus sektor.");
      }
    });
  };

  const handleAddAesthetic = () => {
    const val = newAesthetic.trim();
    if (!val) return;

    startTransition(async () => {
      const res = await createAestheticTagAction(val);
      if (res.success && res.tag) {
        setAesthetics((prev) => [...prev, res.tag as any]);
        setNewAesthetic("");
      } else {
        alert(res.error || "Gagal menambah tag estetika.");
      }
    });
  };

  const handleToggleAesthetic = (id: string, currentStatus: boolean) => {
    const nextVal = !currentStatus;
    startTransition(async () => {
      const res = await toggleAestheticTagAction(id, nextVal);
      if (res.success) {
        setAesthetics((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: nextVal } : a))
        );
      } else {
        alert(res.error || "Gagal mengubah status estetika.");
      }
    });
  };

  const handleDeleteAesthetic = (id: string, name: string) => {
    if (!confirm(`Hapus tag estetika "${name}" dari database permanen?`)) return;

    startTransition(async () => {
      const res = await deleteAestheticTagAction(id);
      if (res.success) {
        setAesthetics((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(res.error || "Gagal menghapus tag estetika.");
      }
    });
  };

  const filteredSectors = sectors.filter((s) =>
    s.name.toLowerCase().includes(sectorSearch.toLowerCase())
  );

  const filteredAesthetics = aesthetics.filter((a) =>
    a.name.toLowerCase().includes(aestheticSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SECTORS CARD */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
        <div>
          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-[#1E1B2E]">
                Sektor Industri Kreatif ({sectors.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Database Sync
            </span>
          </div>

          {/* Add Input */}
          <div className="p-4 border-b border-stone-200 bg-white space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama sektor baru (contoh: Virtual Production)..."
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSector()}
                disabled={isPending}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#27213D] placeholder-stone-400 outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                disabled={isPending || !newSector.trim()}
                onClick={handleAddSector}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-400">
              <Search className="w-3 h-3" />
              <input
                type="text"
                placeholder="Cari sektor tersimpan..."
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                className="w-full text-xs text-stone-700 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* List */}
          <div className="p-4 max-h-[420px] overflow-y-auto space-y-1.5 no-scrollbar">
            {filteredSectors.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">Tidak ada sektor yang cocok.</p>
            ) : (
              filteredSectors.map((sector) => (
                <div
                  key={sector.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    sector.isActive
                      ? "bg-white border-stone-200 hover:border-stone-300"
                      : "bg-stone-50/70 border-dashed border-stone-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        sector.isActive ? "bg-emerald-500" : "bg-stone-300"
                      }`}
                    />
                    <span className="text-xs font-bold text-[#1E1B2E] truncate">
                      {sector.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      #{sector.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleSector(sector.id, sector.isActive)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        sector.isActive
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-stone-400 hover:bg-stone-200"
                      }`}
                      title={sector.isActive ? "Nonaktifkan sektor" : "Aktifkan sektor"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteSector(sector.id, sector.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus permanen dari database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="p-3 border-t border-stone-100 bg-stone-50/50 text-center">
          <p className="text-[10px] text-stone-400">
            Perubahan sektor disimpan langsung ke database dan dicatat di Admin Audit Log.
          </p>
        </div>
      </div>

      {/* AESTHETIC TAGS CARD */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
        <div>
          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-[#1E1B2E]">
                Tag Gaya Estetika ({aesthetics.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Database Sync
            </span>
          </div>

          {/* Add Input */}
          <div className="p-4 border-b border-stone-200 bg-white space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama tag estetika baru (contoh: Vaporwave)..."
                value={newAesthetic}
                onChange={(e) => setNewAesthetic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAesthetic()}
                disabled={isPending}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#27213D] placeholder-stone-400 outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                disabled={isPending || !newAesthetic.trim()}
                onClick={handleAddAesthetic}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-400">
              <Search className="w-3 h-3" />
              <input
                type="text"
                placeholder="Cari estetika tersimpan..."
                value={aestheticSearch}
                onChange={(e) => setAestheticSearch(e.target.value)}
                className="w-full text-xs text-stone-700 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* List */}
          <div className="p-4 max-h-[420px] overflow-y-auto space-y-1.5 no-scrollbar">
            {filteredAesthetics.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">Tidak ada tag estetika yang cocok.</p>
            ) : (
              filteredAesthetics.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    tag.isActive
                      ? "bg-white border-stone-200 hover:border-stone-300"
                      : "bg-stone-50/70 border-dashed border-stone-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        tag.isActive ? "bg-purple-500" : "bg-stone-300"
                      }`}
                    />
                    <span className="text-xs font-bold text-[#1E1B2E] truncate">
                      {tag.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      #{tag.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleAesthetic(tag.id, tag.isActive)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        tag.isActive
                          ? "text-purple-700 hover:bg-purple-50"
                          : "text-stone-400 hover:bg-stone-200"
                      }`}
                      title={tag.isActive ? "Nonaktifkan tag estetika" : "Aktifkan tag estetika"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteAesthetic(tag.id, tag.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus permanen dari database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="p-3 border-t border-stone-100 bg-stone-50/50 text-center">
          <p className="text-[10px] text-stone-400">
            Digunakan oleh Matching Engine AI untuk komparasi gaya estetika kreator &amp; brief.
          </p>
        </div>
      </div>
    </div>
  );
}
