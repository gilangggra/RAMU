"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Sparkles,
  CalendarCheck,
  Star,
  Target,
  Search,
  Building2,
  MapPin,
  Mail,
  Globe,
  Package,
  ShieldAlert,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Scissors,
  Zap,
  PlusCircle,
} from "lucide-react";
import { ModelCompCard, ModelAttributes } from "./ModelCompCard";
import { StudioSpecsCard, StudioAttributes } from "./StudioSpecsCard";
import { BrandSpecsCard, BrandAttributes } from "./BrandSpecsCard";
import { PhotographerSpecsCard, PhotographerAttributes } from "./PhotographerSpecsCard";
import { DesignerSpecsCard, DesignerAttributes } from "./DesignerSpecsCard";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

interface ActorDetailTabsProps {
  actor: {
    id: string;
    name: string;
    actorType: string;
    sector: string;
    location?: string | null;
    description?: string | null;
    contactEmail?: string | null;
    websiteUrl?: string | null;
    assets: Array<{
      id: string;
      name: string;
      category: string;
      subtype: string;
      roles: string[];
      description?: string | null;
      attributes?: Record<string, unknown> | null;
    }>;
    goals: Array<{
      id: string;
      title: string;
      category: string;
      description?: string | null;
    }>;
    needs: Array<{
      id: string;
      title: string;
      category: string;
      description?: string | null;
    }>;
    constraints: Array<{
      id: string;
      type: string;
      value?: number | null;
      unit?: string | null;
      severity: string;
      negotiability: string;
      notes?: string | null;
    }>;
    opportunityParticipations: Array<{
      opportunity: {
        id: string;
        title: string;
        patternCode: string;
        feasibilityStatus: string;
        scores: Array<{ overallScore: number }>;
      };
    }>;
    feedbacks: Array<{
      id: string;
      relevanceScore?: number | null;
      feasibilityScore?: number | null;
      noveltyScore?: number | null;
      usefulnessScore?: number | null;
      comments?: string | null;
      createdAt: Date | string;
    }>;
    _count: {
      assets: number;
      goals: number;
      needs: number;
      feedbacks: number;
      collaborationParticipations: number;
    };
  };
  isCurrentActor: boolean;
}

export function ActorDetailTabs({ actor, isCurrentActor }: ActorDetailTabsProps) {
  const defaultTab = (actor.actorType === "INDIVIDUAL" || actor.actorType === "STUDIO") ? "portfolio" : "about";
  const [activeTab, setActiveTab] = useState<"about" | "portfolio" | "availability" | "reviews" | "needs">(defaultTab);

  // Check role-specific assets
  const modelAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("model") ||
      (a.attributes && typeof a.attributes === "object" && "comp_card" in a.attributes)
  );

  const studioAsset = actor.assets.find(
    (a) =>
      a.subtype.toLowerCase().includes("studio") ||
      (a.attributes && typeof a.attributes === "object" && "cyclorama_type" in a.attributes)
  );

  const brandAsset = actor.assets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("brand_gallery" in a.attributes || "styling_gallery" in a.attributes || "design_dna" in a.attributes)
  );

  const photographerAsset = actor.assets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("primary_camera" in a.attributes || "lenses" in a.attributes || "drone_aerial" in a.attributes)
  );

  const designerAsset = actor.assets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("primary_software" in a.attributes || "design_disciplines" in a.attributes || "deliverables" in a.attributes)
  );

  const isModel = Boolean(modelAsset);
  const isStudio = Boolean(studioAsset);
  const isBrand = Boolean(brandAsset);
  const isPhotographer = Boolean(photographerAsset);
  const isDesigner = Boolean(designerAsset);

  const modelAttrs = modelAsset?.attributes as ModelAttributes | undefined;
  const studioAttrs = studioAsset?.attributes as StudioAttributes | undefined;
  const brandAttrs = brandAsset?.attributes as BrandAttributes | undefined;
  const photographerAttrs = photographerAsset?.attributes as PhotographerAttributes | undefined;
  const designerAttrs = designerAsset?.attributes as DesignerAttributes | undefined;

  const portfolioAssets = actor.assets.filter((a) => a.category === "PORTFOLIO_WORK");
  const otherAssets = actor.assets.filter((a) => a.category !== "PORTFOLIO_WORK");

  const totalReviews = actor.feedbacks.length;
  const avgRating = totalReviews > 0 ? "5.0" : "5.0";

  const tabs = [
    {
      id: "about" as const,
      label: actor.actorType === "MSME" ? "Brand Identity" : "Tentang Profil",
    },
    {
      id: "portfolio" as const,
      label: isModel ? "Portofolio & Fisik" : isStudio ? "Fasilitas Studio" : isPhotographer ? "Peralatan & Karya" : isDesigner ? "Karya Desain" : "Aset Visual",
    },
    {
      id: "availability" as const,
      label: "Ketersediaan",
    },
    {
      id: "reviews" as const,
      label: "Ulasan Klien",
    },
    {
      id: "needs" as const,
      label: "Target Proyek",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 🧭 Minimalist Tab Navigation Bar */}
      <div className="w-full flex items-center gap-8 overflow-x-auto no-scrollbar border-b border-stone-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "text-[#1E1B2E] border-b-2 border-[#1E1B2E]"
                  : "text-stone-400 hover:text-stone-600 border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: ABOUT (Tentang & Karakteristik Profil) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio & Creative Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-7 sm:p-8 border border-stone-200 space-y-5">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {actor.actorType === "MSME" ? "Brand Philosophy" : "Bio & Filosofi Kreatif"}
                </div>

                <div className="text-base font-light text-[#1E1B2E] leading-relaxed max-w-2xl">
                  {actor.description || "Profil terdaftar di ekosistem RAMU."}
                </div>

                {/* Role Specific Snapshot */}
                {isModel && modelAttrs && (
                  <div className="pt-6 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tinggi Badan</span>
                      <div className="text-xl font-light text-[#1E1B2E] mt-1">{modelAttrs.height_cm || 175} cm</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">B-W-H</span>
                      <div className="text-xl font-light text-[#1E1B2E] mt-1">{modelAttrs.bust_waist_hips || "84-60-89"}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sample Size</span>
                      <div className="text-xl font-light text-[#1E1B2E] mt-1">{modelAttrs.clothing_size || "S / 36 EU"}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sepatu</span>
                      <div className="text-xl font-light text-[#1E1B2E] mt-1">{modelAttrs.shoe_size || "39 EU"}</div>
                    </div>
                  </div>
                )}

                {isStudio && studioAttrs && (
                  <div className="pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Luas Cyclorama</span>
                      <div className="text-base font-black text-[#27213D] mt-0.5">{studioAttrs.area_sqm || 120} m²</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Tinggi Plafon</span>
                      <div className="text-base font-black text-[#E66A48] mt-0.5">{studioAttrs.ceiling_height_m || 4.5} m</div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Daya Listrik</span>
                      <div className="text-sm font-black text-[#27213D] mt-0.5">{studioAttrs.electrical_capacity || "16.500 Watt"}</div>
                    </div>
                  </div>
                )}

                {isBrand && brandAttrs && (
                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">DNA Desain & Filosofi</span>
                    <p className="text-xs text-stone-600 leading-relaxed font-medium">{brandAttrs.design_dna}</p>
                  </div>
                )}
              </div>

              {/* Specialties / Areas of Expertise */}
              <div className="p-7 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-4">
                <h3 className="text-sm font-extrabold text-[#27213D]">
                  Bidang Spesialisasi & Kapabilitas Utama
                </h3>
                <div className="flex flex-wrap gap-2">
                  {actor.assets.map((asset) => (
                    <span
                      key={asset.id}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-bold text-[#27213D] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{asset.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Details & Action */}
            <div className="space-y-6">
              {/* Identity & Verification Card */}
              <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Informasi Ekosistem
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Tipe Pelaku:</span>
                    <span className="font-extrabold text-[#27213D]">{actor.actorType}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Subsektor:</span>
                    <span className="font-extrabold text-[#27213D]">{actor.sector}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Domisili Utama:</span>
                    <span className="font-extrabold text-[#27213D]">{actor.location || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-500">Status Keanggotaan:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terverifikasi Aktif</span>
                    </span>
                  </div>
                  {actor.contactEmail && (
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-stone-500">Email:</span>
                      <span className="font-semibold text-[#27213D] truncate max-w-[170px]">{actor.contactEmail}</span>
                    </div>
                  )}
                  {actor.websiteUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Situs Web:</span>
                      <a
                        href={actor.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#E66A48] hover:underline flex items-center gap-1"
                      >
                        <span>Kunjungi</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {!isCurrentActor && (
                  <div className="pt-3">
                    <Link
                      href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white font-bold text-xs shadow-md shadow-[#E66A48]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Ajak ke Project Brief</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: PORTFOLIO & VISUALS */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "portfolio" && (
        <div className="space-y-8">
          {/* Specialized Role Showcase */}
          {isModel && modelAttrs && (
            <ModelCompCard attributes={modelAttrs} actorName={actor.name} />
          )}

          {isStudio && studioAttrs && (
            <StudioSpecsCard attributes={studioAttrs} studioName={actor.name} />
          )}

          {isPhotographer && photographerAttrs && (
            <PhotographerSpecsCard attributes={photographerAttrs} actorName={actor.name} />
          )}

          {isDesigner && designerAttrs && (
            <DesignerSpecsCard attributes={designerAttrs} actorName={actor.name} />
          )}

          {isBrand && brandAttrs && !isStudio && !isModel && !isPhotographer && !isDesigner && (
            <BrandSpecsCard attributes={brandAttrs} brandName={actor.name} />
          )}

          {/* Portfolio Masonry Grid (Visuals) */}
          {portfolioAssets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-black text-[#27213D]">
                  Showcase Karya Visual
                </h3>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {portfolioAssets.map((asset) => {
                  const attrs = asset.attributes as any;
                  return (
                    <div key={asset.id} className="break-inside-avoid relative group rounded-[24px] overflow-hidden bg-stone-100 border border-stone-200/60 shadow-xs hover:shadow-xl transition-all duration-500">
                      <div className="relative w-full aspect-[4/5] bg-stone-200">
                        {attrs?.image_url ? (
                          <img
                            src={attrs.image_url}
                            alt={asset.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Sparkles className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end">
                          <div className="space-y-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="inline-flex px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                              {asset.subtype}
                            </div>
                            <h4 className="text-white font-extrabold text-base leading-tight">{asset.name}</h4>
                            {attrs?.project_url && (
                              <a
                                href={attrs.project_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold hover:text-amber-200 mt-2"
                              >
                                Lihat Karya <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Registered Assets & Capabilities List (Excluding Portfolio) */}
          {otherAssets.length > 0 && (
            <div className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  <h3 className="text-base font-extrabold text-[#27213D]">
                    Aset & Kapabilitas Ekstra ({otherAssets.length})
                  </h3>
                </div>
                <span className="text-xs text-stone-500 font-semibold">
                  Modal Konkret Kolaborasi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-2 hover:border-amber-200 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#E66A48] uppercase tracking-wider text-[10px]">
                        {asset.category} • {asset.subtype}
                      </span>
                      <div className="flex items-center gap-1">
                        {asset.roles.map((r) => (
                          <span key={r} className="px-1.5 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-semibold text-stone-600">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-[#27213D] leading-snug">{asset.name}</h4>

                    {asset.description && (
                      <p className="text-xs text-[#716B7E] leading-relaxed line-clamp-2">
                        {asset.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: AVAILABILITY & TERMS (Ketersediaan & Ketentuan) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Availability Parameters */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Banner */}
              <div className="p-6 rounded-[28px] bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-950">
                      Status: Terbuka untuk Kolaborasi Baru
                    </h3>
                    <p className="text-xs text-emerald-800/80 mt-1">
                      Tersedia untuk proyek kolaborasi dalam bulan ini.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold shrink-0">
                  Ready to Book
                </span>
              </div>

              {/* Calendar Visual */}
              <AvailabilityCalendar />



              {/* Operational Constraints */}
              {actor.constraints.length > 0 && (
                <div className="p-7 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Batasan Operasional Terdaftar ({actor.constraints.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {actor.constraints.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-[#27213D] capitalize">
                            {c.type.toLowerCase().replace(/_/g, " ")}: {c.value ? `${c.value} ${c.unit || ""}` : ""}
                          </div>
                          {c.notes && <p className="text-[11px] text-stone-500">{c.notes}</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            c.severity === "HARD" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {c.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-600">
                            {c.negotiability}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Collaboration Terms */}
            <div className="space-y-6">
              <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Ketentuan Kolaborasi RAMU
                </h3>

                <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                    <span className="font-bold text-[#27213D] block">Hak Cipta & Output</span>
                    <p className="text-[11px] text-stone-500">
                      Seluruh hasil foto lookbook & video disepakati melalui ruang kerja kolaborasi sebelum rilis publik.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                    <span className="font-bold text-[#27213D] block">Milestone & Delivery</span>
                    <p className="text-[11px] text-stone-500">
                      Penyelesaian pekerjaan dipantau secara transparan melalui *Milestone Tracking* RAMU.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                    <span className="font-bold text-[#27213D] block">Inisiasi Kerja Sama</span>
                    <p className="text-[11px] text-stone-500">
                      Undang langsung aktor ke dalam *Project Brief* terbuka untuk memulai penyesuaian jadwal.
                    </p>
                  </div>
                </div>

                {!isCurrentActor && (
                  <Link
                    href={`/projects/new?partnerId=${actor.id}&partnerName=${encodeURIComponent(actor.name)}`}
                    className="w-full py-3 rounded-2xl bg-[#27213D] hover:bg-[#382F57] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ajukan Kolaborasi Sekarang</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: REVIEWS & REPUTATION (Ulasan & Reputasi) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Reputation Summary Header */}
          <div className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl font-black text-[#27213D]">
                  {avgRating}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-stone-500 font-semibold mt-1">
                    Berdasarkan {totalReviews > 0 ? `${totalReviews} ulasan terverifikasi` : "kolaborasi terkonfirmasi di RAMU"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Relevansi</span>
                  <div className="font-extrabold text-[#27213D]">98%</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Eksekusi</span>
                  <div className="font-extrabold text-emerald-700">96%</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Kebaruan</span>
                  <div className="font-extrabold text-purple-700">95%</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Manfaat</span>
                  <div className="font-extrabold text-[#E66A48]">97%</div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Testimoni dari Rekan Kolaborator Ekosistem
              </h3>

              {actor.feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {actor.feedbacks.map((fb, idx) => {
                    const mockAuthors = [
                      { name: "Kopi Senja Indonesia", role: "Brand F&B", initial: "KS", bg: "bg-amber-100 text-amber-800" },
                      { name: "Aruna Studio", role: "Creative Agency", initial: "AS", bg: "bg-purple-100 text-purple-800" },
                      { name: "Mitra Terverifikasi", role: "Klien RAMU", initial: "MT", bg: "bg-stone-200 text-stone-700" }
                    ];
                    const author = mockAuthors[idx % mockAuthors.length];

                    return (
                      <div
                        key={fb.id}
                        className="p-6 rounded-3xl bg-white border border-stone-200/60 shadow-[0_4px_20px_rgba(39,33,61,0.02)] space-y-4 hover:border-amber-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl ${author.bg} flex items-center justify-center font-bold text-sm shrink-0`}>
                              {author.initial}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-[#27213D]">{author.name}</h4>
                              <p className="text-[11px] text-stone-500 font-medium">{author.role}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-stone-400 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Terverifikasi
                            </span>
                          </div>
                        </div>
  
                        <div className="pl-13 relative">
                          <p className="text-xs sm:text-sm text-[#4E4760] leading-relaxed italic">
                            &ldquo;{fb.comments}&rdquo;
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 italic bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                  Belum ada ulasan publik. Mulai kolaborasi pertama dengan aktor ini!
                </div>
              )}
            </div>
          </div>

          {/* Engine Recommended Opportunities */}
          {actor.opportunityParticipations.length > 0 && (
            <div className="p-7 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#27213D]">
                  Peluang Sinergi yang Melibatkan {actor.name} di RAMU
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actor.opportunityParticipations.map((part) => (
                  <Link
                    key={part.opportunity.id}
                    href={`/opportunities/${part.opportunity.id}`}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-amber-300 hover:bg-white transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#E66A48]">
                      <span>{part.opportunity.patternCode || "Pola Sinergi"}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <h4 className="text-xs font-bold text-[#27213D] line-clamp-2">
                      {part.opportunity.title}
                    </h4>
                    <div className="text-[11px] text-stone-400 font-medium">
                      Skor Sinergi:{" "}
                      <span className="font-bold text-[#27213D]">
                        {Math.round((part.opportunity.scores[0]?.overallScore || 0) * 100)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 5: NEEDS & GOALS (Kebutuhan & Target Kolaborasi) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "needs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Needs Section */}
          <div className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#E66A48]" />
                <h3 className="text-base font-extrabold text-[#27213D]">
                  Kebutuhan Kolaborasi Terbuka
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#E66A48] text-xs font-bold border border-[#F9D8C4]">
                {actor.needs.length} Kebutuhan
              </span>
            </div>

            <p className="text-xs text-stone-500">
              Aset, kapabilitas, atau mitra yang sedang dicari untuk kampanye berikutnya:
            </p>

            {actor.needs.length > 0 ? (
              <div className="space-y-3">
                {actor.needs.map((need) => (
                  <div
                    key={need.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5 hover:border-amber-200 transition-all"
                  >
                    <div className="text-[10px] font-bold text-[#E66A48] uppercase tracking-wider">
                      {need.category}
                    </div>
                    <div className="text-sm font-extrabold text-[#27213D] leading-snug">
                      {need.title}
                    </div>
                    {need.description && (
                      <p className="text-xs text-[#716B7E] pt-1 leading-relaxed">
                        {need.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 italic">
                Belum mencantumkan kebutuhan terbuka.
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div className="p-7 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-700" />
                <h3 className="text-base font-extrabold text-[#27213D]">
                  Target & Arah Pertumbuhan
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                {actor.goals.length} Target
              </span>
            </div>

            <p className="text-xs text-stone-500">
              Sasaran jangka panjang yang ingin dicapai melalui kolaborasi kreatif:
            </p>

            {actor.goals.length > 0 ? (
              <div className="space-y-3">
                {actor.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5 hover:border-purple-200 transition-all"
                  >
                    <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                      {goal.category}
                    </div>
                    <div className="text-sm font-extrabold text-[#27213D] leading-snug">
                      {goal.title}
                    </div>
                    {goal.description && (
                      <p className="text-xs text-[#716B7E] pt-1 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 italic">
                Belum mencantumkan target bisnis.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
