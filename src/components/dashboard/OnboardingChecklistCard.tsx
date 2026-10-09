"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  User,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  Check,
  Briefcase,
} from "lucide-react";

interface OnboardingChecklistCardProps {
  actorName: string;
  actorSector: string;
  isBrand: boolean;
  hasAvatar: boolean;
  hasBio: boolean;
  hasCommercialReadiness: boolean;
  hasSpecs: boolean;
  hasPortfolio: boolean;
  hasPortfolioOrBrief?: boolean;
  readinessScore: number;
}

export function OnboardingChecklistCard({
  actorName,
  actorSector,
  isBrand,
  hasAvatar,
  hasBio,
  hasCommercialReadiness,
  hasSpecs,
  hasPortfolio,
  hasPortfolioOrBrief,
  readinessScore,
}: OnboardingChecklistCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ramu_dashboard_onboarding_collapsed");
      if (saved === "true") setCollapsed(true);
      const isDismissed = localStorage.getItem("ramu_dashboard_onboarding_dismissed");
      if (isDismissed === "true" && readinessScore === 100) setDismissed(true);
    } catch {}
  }, [readinessScore]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("ramu_dashboard_onboarding_collapsed", String(next));
    } catch {}
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("ramu_dashboard_onboarding_dismissed", "true");
    } catch {}
  };

  if (dismissed && readinessScore === 100) {
    return null;
  }

  // 4 Core Checklist Tasks
  const tasks = [
    {
      id: "profile",
      title: "Foto Profil & Deskripsi Karya",
      desc: isBrand
        ? "Unggah logo brand dan visi koleksi agar mudah dikenali talenta."
        : "Pasang foto profil wajah/studio dan ceritakan estetika karya Anda.",
      isDone: hasAvatar && hasBio,
      href: "/settings/profile",
      cta: hasAvatar && hasBio ? "Ubah Profil" : "Lengkapi Profil",
      icon: User,
      badge: "+25% Kesiapan",
    },
    {
      id: "commercial",
      title: isBrand ? "Preferensi & Model Kompensasi" : "Paket Tarif Kolaborasi",
      desc: isBrand
        ? "Tentukan rentang budget dan model kompensasi untuk brief proyek."
        : "Pasang paket tarif (Starter, Campaign, Commercial) untuk disewa brand.",
      isDone: hasCommercialReadiness,
      href: isBrand ? "/settings/preferences" : "/settings/rates",
      cta: hasCommercialReadiness
        ? (isBrand ? "Kelola Preferensi" : "Kelola Tarif")
        : (isBrand ? "Atur Preferensi" : "Atur Paket Tarif"),
      icon: CreditCard,
      badge: "+25% Kesiapan",
    },
    {
      id: "resources",
      title: "Spesifikasi Alat & Kapasitas Kerja",
      desc: isBrand
        ? "Lengkapi spesifikasi koleksi brand, ukuran sampel busana, atau kuota produksi."
        : "Lengkapi spesifikasi kamera, lighting kit studio, atau keahlian teknis Anda.",
      isDone: hasSpecs,
      href: "/settings/specs",
      cta: hasSpecs ? "Ubah Spesifikasi" : "Lengkapi Spesifikasi",
      icon: Layers,
      badge: "+25% Profil",
    },
    {
      id: "portfolio",
      title: isBrand ? "Inisiasi Brief Proyek Pertama" : "Unggah Portofolio & Tear-Sheet",
      desc: isBrand
        ? "Buat brief pencarian fotografer, model, stylist, atau studio foto."
        : "Unggah karya visual terbaik dan klaim co-credit dengan kolaborator.",
      isDone: hasPortfolioOrBrief ?? hasPortfolio,
      href: isBrand ? "/projects/new" : "/showcase",
      cta: (hasPortfolioOrBrief ?? hasPortfolio)
        ? (isBrand ? "Kelola Brief" : "Kelola Portofolio")
        : (isBrand ? "Buat Brief" : "Unggah Karya"),
      icon: Briefcase,
      badge: "+25% Kesiapan",
    },
  ];

  const completedCount = tasks.filter((t) => t.isDone).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const isAllDone = completedCount === tasks.length;

  return (
    <section className="w-full rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] relative overflow-hidden text-[#0f172a]">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shrink-0 border border-white/80 shadow-2xs">
            {isAllDone ? <ShieldCheck className="w-4 h-4 text-[#0284c7]" /> : <Layers className="w-4 h-4 text-slate-700" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                {isAllDone ? "Profil Terverifikasi" : "Panduan Profil"}
              </span>
              <span className="text-xs text-[#475569] font-medium">
                {completedCount} dari {tasks.length} Selesai ({progressPercent}%)
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-semibold text-[#0f172a] tracking-tight mt-1">
              {isAllDone
                ? `Profil ${actorName} sudah lengkap dan siap berkolaborasi`
                : `Lengkapi profil untuk memaksimalkan peluang kerja sama`}
            </h2>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={toggleCollapse}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#0f172a] border border-white/80 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title={collapsed ? "Tampilkan daftar tugas" : "Ciutkan"}
          >
            {collapsed ? (
              <>
                <span>Lihat Panduan</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Ciutkan</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
          {isAllDone && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
              title="Tutup panduan ini"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100/80 overflow-hidden">
        <div
          className="h-full bg-[#4CC9FE] rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Expandable Task Grid */}
      {!collapsed && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {tasks.map((task) => {
              const Icon = task.icon;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-[20px] border transition-all flex flex-col justify-between group ${
                    task.isDone
                      ? "bg-white/40 border-white/60"
                      : "bg-white/75 hover:bg-white/95 border-white/90 hover:border-white shadow-xs"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header Item */}
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-white/95 text-slate-700 flex items-center justify-center border border-white/80 shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {task.isDone ? (
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Belum
                          </span>
                        )}
                      </div>
                    </div>

                    <h3
                      className={`text-xs font-semibold leading-tight ${
                        task.isDone ? "text-slate-400 line-through" : "text-[#0f172a] group-hover:text-[#0284c7]"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {task.desc}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={task.href}
                      className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                        task.isDone
                          ? "text-slate-400 hover:text-slate-600"
                          : "text-[#0284c7] hover:text-[#0369a1]"
                      }`}
                    >
                      <span>{task.cta}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
