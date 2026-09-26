"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ConstraintType, ConstraintSeverity } from "@prisma/client";

interface PresetItem {
  id: string;
  label: string;
  tag: string;
  type: ConstraintType;
  value: string;
  unit: string;
  severity: ConstraintSeverity;
  notes: string;
}

const PRESET_TEMPLATES: PresetItem[] = [
  {
    id: "preset-weekend",
    label: "Hanya Akhir Pekan (Weekend Only)",
    tag: "Jadwal",
    type: "AVAILABILITY",
    value: "Hanya Akhir Pekan",
    unit: "",
    severity: "SOFT",
    notes: "Tersedia untuk sesi pemotretan / kolaborasi pada hari Sabtu dan Minggu.",
  },
  {
    id: "preset-jabodetabek",
    label: "Wilayah Jabodetabek Only",
    tag: "Lokasi",
    type: "LOCATION",
    value: "Jabodetabek",
    unit: "Wilayah",
    severity: "HARD",
    notes: "Fokus on-location di wilayah Jakarta, Bogor, Depok, Tangerang, dan Bekasi.",
  },
  {
    id: "preset-contract-nda",
    label: "Wajib Kontrak Tertulis & NDA",
    tag: "Legalitas",
    type: "LEGAL",
    value: "Wajib Perjanjian Tertulis",
    unit: "",
    severity: "HARD",
    notes: "Hak cipta, pembagian hasil, dan kredit publikasi wajib dituangkan dalam kesepakatan tertulis sebelum on-set.",
  },
  {
    id: "preset-deadline-14",
    label: "Deadline Maksimal 14 Hari",
    tag: "Waktu",
    type: "TIME",
    value: "14",
    unit: "Hari",
    severity: "SOFT",
    notes: "Target penyelesaian seluruh deliverables maksimal 14 hari kalender setelah sesi produksi.",
  },
  {
    id: "preset-budget-5jt",
    label: "Rate Min. Rp 5.000.000",
    tag: "Anggaran",
    type: "BUDGET",
    value: "5000000",
    unit: "Rupiah",
    severity: "SOFT",
    notes: "Rate dasar minimum untuk penugasan proyek komersial berbayar.",
  },
  {
    id: "preset-shared-ip",
    label: "Hak Guna Portofolio Bersama",
    tag: "Hak Cipta",
    type: "IP",
    value: "Kredit & Hak Portofolio Bersama",
    unit: "",
    severity: "HARD",
    notes: "Semua kreator yang terlibat berhak memamerkan hasil karya pada portofolio dan media sosial masing-masing.",
  },
];

const DEFAULT_CONSTRAINT_LABELS: Record<ConstraintType, { label: string; placeholder: string }> = {
  BUDGET: { label: "Batas Anggaran (Budget)", placeholder: "5000000 (Rupiah)" },
  AVAILABILITY: { label: "Ketersediaan Jadwal", placeholder: "Hanya Akhir Pekan / Q2 2026" },
  LOCATION: { label: "Jangkauan Wilayah / Kota", placeholder: "Jabodetabek / Bandung" },
  TIME: { label: "Batas Waktu / Deadline", placeholder: "Maksimal 30 hari pengerjaan" },
  LEAD_TIME: { label: "Lead Time Persiapan", placeholder: "7 (hari)" },
  CAPACITY: { label: "Kapasitas Produksi", placeholder: "200 (pcs/bulan)" },
  MINIMUM_ORDER: { label: "Minimum Pemesanan / Order", placeholder: "30 (pcs)" },
  EQUIPMENT: { label: "Peralatan / Spesifikasi Teknis", placeholder: "Daya listrik minimal 11.000 Watt" },
  CAPABILITY: { label: "Batasan Cakupan Keahlian", placeholder: "Tidak menyediakan retouch 3D" },
  LEGAL: { label: "Izin & Legalitas", placeholder: "Wajib NDA / Kontrak Kerja Bersama" },
  IP: { label: "Hak Cipta (HAKI / IP)", placeholder: "Hak guna komersial 1 tahun" },
  MARKET: { label: "Wilayah Pasar", placeholder: "Pasar ritel domestik" },
};

interface ConstraintPresetFormProps {
  action: (formData: FormData) => Promise<void>;
  constraintLabels?: Record<string, { label: string; placeholder: string }>;
}

export function ConstraintPresetForm({ action, constraintLabels = DEFAULT_CONSTRAINT_LABELS }: ConstraintPresetFormProps) {
  const [selectedType, setSelectedType] = useState<ConstraintType>("BUDGET");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [severity, setSeverity] = useState<ConstraintSeverity>("SOFT");
  const [notes, setNotes] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  function applyPreset(preset: PresetItem) {
    setSelectedType(preset.type);
    setValue(preset.value);
    setUnit(preset.unit);
    setSeverity(preset.severity);
    setNotes(preset.notes);
    setActivePresetId(preset.id);
  }

  return (
    <div className="space-y-5">
      {/* 1-Click Quick Presets for Creative Industry */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Pilih Cepat Ketentuan Populer (1-Klik Isi Form):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 cursor-pointer ${
                activePresetId === preset.id
                  ? "bg-amber-100 border-amber-300 text-amber-950 font-bold shadow-2xs"
                  : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700 hover:text-[#1E1B2E]"
              }`}
            >
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white border border-stone-200/80 text-stone-500">
                {preset.tag}
              </span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form action={action} className="space-y-4 pt-2 border-t border-stone-100">
        <input type="hidden" name="returnTo" value="/readiness?tab=constraints" />

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Tipe Ketentuan / Preferensi *</label>
          <select
            name="type"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as ConstraintType);
              setActivePresetId(null);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
          >
            {Object.entries(constraintLabels).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Nilai / Batas Maksimum/Minimum *</label>
          <input
            name="value"
            type="text"
            required
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setActivePresetId(null);
            }}
            placeholder={constraintLabels[selectedType]?.placeholder || "misal: 5000000 atau Jabodetabek atau 14 hari"}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Satuan (Opsional)</label>
          <input
            name="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="misal: Rupiah, Hari, Wilayah"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Sifat Ketentuan *</label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
              severity === "SOFT" ? "border-amber-400 bg-amber-50/50" : "border-stone-200 bg-stone-50"
            }`}>
              <input
                type="radio"
                name="severity"
                value="SOFT"
                checked={severity === "SOFT"}
                onChange={() => setSeverity("SOFT")}
                className="accent-[#1E1B2E]"
              />
              <div>
                <div className="font-bold text-[#1E1B2E]">Fleksibel</div>
                <div className="text-[10px] text-stone-500">Bisa dinegosiasi</div>
              </div>
            </label>
            <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
              severity === "HARD" ? "border-rose-400 bg-rose-50/50" : "border-stone-200 bg-stone-50"
            }`}>
              <input
                type="radio"
                name="severity"
                value="HARD"
                checked={severity === "HARD"}
                onChange={() => setSeverity("HARD")}
                className="accent-rose-600"
              />
              <div>
                <div className="font-bold text-rose-700">Mutlak</div>
                <div className="text-[10px] text-stone-500">Syarat wajib / non-negotiable</div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Catatan Penjelasan (Opsional)</label>
          <textarea
            name="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="misal: Khusus photoshoot hari Sabtu/Minggu saja..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Simpan Ketentuan &amp; Preferensi Kerja</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
