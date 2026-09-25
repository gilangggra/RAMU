"use client";

import { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Users,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Share2,
  Camera,
  FileText,
  ClipboardList,
  Tag,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export interface ParticipantCredit {
  id: string;
  actorId?: string;
  role: string;
  name: string;
  handle: string;
  phone?: string;
  isCustom?: boolean;
}

interface SocialCreditGeneratorProps {
  collaborationTitle: string;
  participants: any[];
  plan?: any;
  className?: string;
}

const FASHION_ROLE_PRESETS = [
  "Wardrobe & Fashion Design",
  "Photography & Visual Direction",
  "Fashion Stylist",
  "Makeup & Hair Styling (MUA)",
  "Model / Muse",
  "Videography & Fashion Film",
  "Art Direction & Set Design",
  "Studio & Production Space",
  "Accessories & Footwear",
  "Production Coordinator / Producer",
];

const DEFAULT_HASHTAGS = [
  "IndonesianFashion",
  "FashionEditorial",
  "Lookbook2026",
  "CreativeProduction",
  "LocalFashionBrands",
  "VisualCampaign",
];

function sanitizeHandle(name: string): string {
  if (!name) return "@creative";
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `@${clean || "creative"}`;
}

function inferFashionRole(p: any, planRoles: any[] = []): string {
  const roleDef = planRoles.find((r: any) => r.actorId === p.actorId);
  const textToScan = [
    p.roleCode || "",
    p.actor?.sector || "",
    roleDef?.responsibility || "",
    roleDef?.contribution || "",
    p.actor?.name || "",
  ]
    .join(" ")
    .toUpperCase();

  if (textToScan.includes("DESIGN") || textToScan.includes("WARDROBE") || textToScan.includes("APPAREL") || textToScan.includes("BUSANA") || textToScan.includes("ATELIER") || textToScan.includes("BRAND")) {
    return "Wardrobe & Fashion Design";
  }
  if (textToScan.includes("PHOTO") || textToScan.includes("FOTO") || textToScan.includes("CAMERA") || textToScan.includes("KAMERA") || textToScan.includes("VISUAL")) {
    return "Photography & Visual Direction";
  }
  if (textToScan.includes("STYLE") || textToScan.includes("STYLIST") || textToScan.includes("PENATA BUSANA")) {
    return "Fashion Stylist";
  }
  if (textToScan.includes("MUA") || textToScan.includes("MAKEUP") || textToScan.includes("RIAS") || textToScan.includes("BEAUTY") || textToScan.includes("HAIR")) {
    return "Makeup & Hair Styling (MUA)";
  }
  if (textToScan.includes("MODEL") || textToScan.includes("TALENT") || textToScan.includes("MUSE") || textToScan.includes("PERAGA")) {
    return "Model / Muse";
  }
  if (textToScan.includes("VIDEO") || textToScan.includes("CINEMA") || textToScan.includes("FILM") || textToScan.includes("DOP")) {
    return "Videography & Fashion Film";
  }
  if (textToScan.includes("STUDIO") || textToScan.includes("VENUE") || textToScan.includes("SPACE") || textToScan.includes("LOKASI")) {
    return "Studio & Production Space";
  }
  if (textToScan.includes("PRODUC") || textToScan.includes("PRODUSER") || textToScan.includes("MANAJER")) {
    return "Production Coordinator";
  }
  if (textToScan.includes("ACCESSOR") || textToScan.includes("JEWELRY") || textToScan.includes("SEPATU") || textToScan.includes("TAS")) {
    return "Accessories & Footwear";
  }

  return p.roleCode || "Creative Collaborator";
}

export function SocialCreditGenerator({
  collaborationTitle,
  participants = [],
  plan,
  className = "",
}: SocialCreditGeneratorProps) {
  // 1. Initial Credits Generation
  const initialCredits: ParticipantCredit[] = useMemo(() => {
    return participants.map((p, idx) => ({
      id: p.id || `credit-${idx}`,
      actorId: p.actorId,
      role: inferFashionRole(p, plan?.roles || []),
      name: p.actor?.name || "Kreator RAMU",
      handle: sanitizeHandle(p.actor?.name || ""),
      phone: p.actor?.contactPhone || "",
      isCustom: false,
    }));
  }, [participants, plan]);

  const [credits, setCredits] = useState<ParticipantCredit[]>(initialCredits);
  const [projectTitle, setProjectTitle] = useState<string>(collaborationTitle);
  const [formatType, setFormatType] = useState<"instagram" | "story" | "editorial" | "callsheet">("instagram");
  const [includePlatformTag, setIncludePlatformTag] = useState<boolean>(true);
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [activeHashtags, setActiveHashtags] = useState<string[]>(DEFAULT_HASHTAGS);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Update credits if participants prop changes and local credits are empty
  const resetToDefault = () => {
    setCredits(initialCredits);
    setProjectTitle(collaborationTitle);
    setActiveHashtags(DEFAULT_HASHTAGS);
  };

  // Helper to update a credit item
  const updateCredit = (id: string, field: keyof ParticipantCredit, value: string) => {
    setCredits((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Add custom credit item
  const addCreditItem = () => {
    const newId = `custom-${Date.now()}`;
    setCredits((prev) => [
      ...prev,
      {
        id: newId,
        role: "Creative Contributor",
        name: "",
        handle: "@",
        phone: "",
        isCustom: true,
      },
    ]);
  };

  // Remove credit item
  const removeCreditItem = (id: string) => {
    setCredits((prev) => prev.filter((c) => c.id !== id));
  };

  // Toggle hashtag
  const toggleHashtag = (tag: string) => {
    setActiveHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Add custom hashtag
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().replace(/^#+/, "").replace(/\s+/g, "");
    if (clean && !activeHashtags.includes(clean)) {
      setActiveHashtags((prev) => [...prev, clean]);
      setNewTagInput("");
    }
  };

  // Generate output text based on active format
  const generatedText = useMemo(() => {
    const title = projectTitle || "Fashion Collaboration Project";

    // 1. STORY / REEL MENTION STICKER (Single-line space-separated)
    if (formatType === "story") {
      const handles = credits
        .map((c) => (c.handle.startsWith("@") ? c.handle : `@${c.handle}`))
        .filter((h) => h.length > 1);
      if (includePlatformTag) {
        handles.push("@ramu.ecosystem");
      }
      return handles.join(" ");
    }

    // 2. INSTAGRAM / TIKTOK FEED CAPTION
    if (formatType === "instagram") {
      const lines: string[] = [];
      lines.push(`✨ ${title}`);
      lines.push("");
      lines.push("Creative & Production Team:");

      credits.forEach((c) => {
        const handle = c.handle.startsWith("@") ? c.handle : `@${c.handle}`;
        lines.push(`• ${c.role}: ${handle} (${c.name})`);
      });

      if (includePlatformTag) {
        lines.push("");
        lines.push("Facilitated via @ramu.ecosystem ✨");
      }

      if (includeHashtags && activeHashtags.length > 0) {
        lines.push("");
        const tags = activeHashtags.map((t) => `#${t.replace(/^#+/, "")}`);
        if (includePlatformTag) {
          tags.push("#RAMUecosystem");
        }
        lines.push(tags.join(" "));
      }

      return lines.join("\n");
    }

    // 3. EDITORIAL PRESS / LOOKBOOK (High-fashion standard)
    if (formatType === "editorial") {
      const lines: string[] = [];
      lines.push(`EDITORIAL CREDITS: "${title.toUpperCase()}"`);
      lines.push("━".repeat(48));

      // Calculate max length for aligned colon
      const maxRoleLength = Math.max(...credits.map((c) => c.role.length), 18);

      credits.forEach((c) => {
        const paddedRole = c.role.toUpperCase().padEnd(maxRoleLength, " ");
        const handle = c.handle.startsWith("@") ? c.handle : `@${c.handle}`;
        lines.push(`${paddedRole} : ${c.name.toUpperCase()} (${handle})`);
      });

      lines.push("━".repeat(48));
      if (includePlatformTag) {
        lines.push("FACILITATED BY RAMU CREATIVE PLATFORM (ramu.id)");
      }
      lines.push("ALL RIGHTS RESERVED © 2026");

      return lines.join("\n");
    }

    // 4. CALL SHEET PRODUCTION ROSTER (On-set shooting day)
    if (formatType === "callsheet") {
      const lines: string[] = [];
      lines.push(`PRODUCTION CALL SHEET ROSTER`);
      lines.push(`PROJECT: ${title.toUpperCase()}`);
      lines.push(`GENERATED VIA RAMU WORKSPACE`);
      lines.push("═".repeat(48));

      credits.forEach((c, i) => {
        const handle = c.handle.startsWith("@") ? c.handle : `@${c.handle}`;
        lines.push(`[${i + 1}] ${c.role.toUpperCase()}`);
        lines.push(`    Nama    : ${c.name}`);
        lines.push(`    Akun IG : ${handle}`);
        if (c.phone) {
          lines.push(`    Kontak  : ${c.phone}`);
        }
        lines.push("─".repeat(40));
      });

      return lines.join("\n");
    }

    return "";
  }, [credits, projectTitle, formatType, includePlatformTag, includeHashtags, activeHashtags]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = generatedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy credit text:", err);
    }
  };

  // Download as text file
  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `kredit-${formatType}-${(projectTitle || "proyek")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Count stats
  const charCount = generatedText.length;
  const mentionMatches = generatedText.match(/@[a-zA-Z0-9_.]+/g);
  const mentionCount = mentionMatches ? mentionMatches.length : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#1E1B2E] via-[#2A243D] to-[#1E1B2E] text-white shadow-xl shadow-[#1E1B2E]/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#E66A48]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold tracking-wider uppercase text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Publikasi & Distribusi Karya</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Social Media Credit & Production Tag Generator
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl font-light leading-relaxed">
                Format kredit tim kreatif, akun media sosial, dan roster call sheet satu-klik untuk rilis Instagram Feed, TikTok BTS, Story Sticker, Press Release Lookbook, dan Call Sheet lapangan.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showConfig
                    ? "bg-amber-500 text-[#1E1B2E]"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showConfig ? "Tutup Editor" : "Sesuaikan Akun & Peran"}</span>
              </button>
              <button
                type="button"
                onClick={resetToDefault}
                title="Kembalikan ke data awal partisipan"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white border border-white/15 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Format Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
            {[
              {
                id: "instagram",
                label: "Post Caption",
                sub: "Feed IG & TikTok",
                icon: Camera,
              },
              {
                id: "story",
                label: "Story Sticker",
                sub: "Tag 1 Baris Cepat",
                icon: Tag,
              },
              {
                id: "editorial",
                label: "Press & Lookbook",
                sub: "Format Formal Mode",
                icon: FileText,
              },
              {
                id: "callsheet",
                label: "Call Sheet Roster",
                sub: "Kontak Hari H Shoot",
                icon: ClipboardList,
              },
            ].map((fmt) => {
              const Icon = fmt.icon;
              const isActive = formatType === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormatType(fmt.id as any)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "bg-white text-[#1E1B2E] shadow-lg shadow-black/20 font-bold scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#E66A48]" : "text-stone-400"}`} />
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#E66A48]" />}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold leading-tight">{fmt.label}</div>
                    <div className={`text-[10px] ${isActive ? "text-stone-500" : "text-stone-400"} font-light`}>
                      {fmt.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor Panel: Customize Team Roles & Handles */}
      {showConfig && (
        <div className="p-6 rounded-[28px] bg-white border border-stone-200/90 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Sesuaikan Daftar Kredit & Handle Media Sosial</span>
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Ketik nama akun Instagram/TikTok tim Anda. Live preview di bawah akan langsung terupdate secara real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={addCreditItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>Tambah Kru / Talent Tambahan</span>
            </button>
          </div>

          {/* Project Title Field */}
          <div className="space-y-1.5 max-w-lg">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Judul Proyek / Kampanye
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Contoh: Modest Chic Spring 2026 Lookbook"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white"
            />
          </div>

          {/* List of Team Members */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 hidden sm:grid">
              <div className="col-span-4">Peran Mode / Produksi</div>
              <div className="col-span-4">Nama Kru / Brand / Talent</div>
              <div className="col-span-3">Handle Akun (@...)</div>
              <div className="col-span-1 text-center">Aksi</div>
            </div>

            {credits.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 items-center hover:bg-stone-50 transition-colors"
              >
                {/* Role */}
                <div className="sm:col-span-4">
                  <div className="text-[10px] font-bold text-stone-500 uppercase sm:hidden mb-1">Peran</div>
                  <div className="relative">
                    <input
                      type="text"
                      list="fashion-roles-list"
                      value={item.role}
                      onChange={(e) => updateCredit(item.id, "role", e.target.value)}
                      placeholder="Contoh: Fashion Stylist"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#E66A48]"
                    />
                    <datalist id="fashion-roles-list">
                      {FASHION_ROLE_PRESETS.map((preset) => (
                        <option key={preset} value={preset} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Name */}
                <div className="sm:col-span-4">
                  <div className="text-[10px] font-bold text-stone-500 uppercase sm:hidden mb-1">Nama</div>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateCredit(item.id, "name", e.target.value)}
                    placeholder="Nama talent / label"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48]"
                  />
                </div>

                {/* Handle */}
                <div className="sm:col-span-3">
                  <div className="text-[10px] font-bold text-stone-500 uppercase sm:hidden mb-1">Handle</div>
                  <input
                    type="text"
                    value={item.handle}
                    onChange={(e) => updateCredit(item.id, "handle", e.target.value)}
                    placeholder="@akun_ig"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono text-[#E66A48] focus:outline-none focus:border-[#E66A48]"
                  />
                </div>

                {/* Action */}
                <div className="sm:col-span-1 flex justify-end sm:justify-center">
                  <button
                    type="button"
                    onClick={() => removeCreditItem(item.id)}
                    title="Hapus baris kredit ini"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Hashtag & Platform Tags Configuration */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>Pilih Tagar (Hashtags) Terkurasi</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleHashtag(tag)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    <span>#{tag}</span>
                    <span className="text-amber-500 hover:text-rose-600 text-xs">×</span>
                  </button>
                ))}
              </div>

              {/* Add custom tag */}
              <form onSubmit={handleAddCustomTag} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Tambah tagar baru (tanpa #)..."
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] grow"
                />
                <button
                  type="submit"
                  disabled={!newTagInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Opsi Tambahan
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-[#1E1B2E] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePlatformTag}
                    onChange={(e) => setIncludePlatformTag(e.target.checked)}
                    className="rounded border-stone-300 text-[#E66A48] focus:ring-[#E66A48] w-4 h-4"
                  />
                  <span>Sertakan Tag Platform RAMU (@ramu.ecosystem)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#1E1B2E] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="rounded border-stone-300 text-[#E66A48] focus:ring-[#E66A48] w-4 h-4"
                  />
                  <span>Sertakan Kumpulan Hashtag Mode di Akhir Caption</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview & One-Click Copy Card */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-stone-200/90 shadow-[0_15px_40px_rgba(30,27,46,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight">
                Live Preview Kredit Format{" "}
                <span className="text-[#E66A48] uppercase text-xs font-black px-2 py-0.5 rounded-md bg-[#FFF7ED] border border-[#F9D8C4]">
                  {formatType}
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500 font-light">
              <span>{charCount} Karakter</span>
              <span>•</span>
              <span className={mentionCount > 30 ? "text-rose-600 font-bold" : ""}>
                {mentionCount} Akun / Mention {mentionCount > 30 && "(Maks 30 di Instagram!)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadTxt}
              title="Unduh format teks ini (.txt)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Unduh .txt</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white shadow-emerald-600/30 scale-105"
                  : "bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white shadow-[#E66A48]/25 hover:shadow-lg"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Tersalin ke Clipboard! ✨</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Format {formatType === "story" ? "Story Sticker" : "Kredit"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Preview Box Styled Like High-End Lookbook / Terminal */}
        <div className="relative rounded-2xl bg-[#1E1B2E] text-stone-100 p-5 sm:p-6 border border-stone-800 shadow-inner group">
          {/* Header dots */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-stone-400">format-{formatType}.txt</span>
            </div>
            <div className="text-[10px] text-stone-500 uppercase tracking-widest font-sans font-bold">
              Siap Salin & Tempel
            </div>
          </div>

          <pre className="font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap select-all overflow-x-auto text-stone-200">
            {generatedText}
          </pre>

          {/* Quick Floating Copy button inside box */}
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-md opacity-80 group-hover:opacity-100"
            title="Salin teks"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Tip for creators */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 font-light leading-relaxed">
            <strong className="font-bold text-amber-900">Tips Rilis Editorial:</strong> Di Instagram Stories, pilih opsi{" "}
            <strong>Story Sticker</strong> untuk menyalin seluruh mention dalam 1 baris. Saat menempelkan (paste) ke sticker mention atau teks cerita, Instagram akan otomatis mendeteksi dan memberi notifikasi ke seluruh akun rekan kolaborasi Anda!
          </div>
        </div>
      </div>
    </div>
  );
}
