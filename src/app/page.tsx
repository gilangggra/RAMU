import React from "react";

export default function Home() {
  const dimensions = [
    { name: "Complementarity", desc: "Kekuatan sinergi antar-aset & kapabilitas", score: "High", badge: "Core Engine" },
    { name: "Goal Alignment", desc: "Kesesuaian dengan arah & target aktor", score: "94%", badge: "Alignment" },
    { name: "Need Coverage", desc: "Penyelesaian gap & kebutuhan kolaborator", score: "88%", badge: "Problem Solving" },
    { name: "Asset Utilization", desc: "Optimalisasi utilisasi sumber daya idle", score: "92%", badge: "Efficiency" },
    { name: "Feasibility", desc: "Kesesuaian constraint waktu, lokasi & kapasitas", score: "Promising", badge: "Constraint" },
    { name: "Actionability", desc: "Kejelasan roadmap & langkah eksekusi bersama", score: "High", badge: "Execution" },
  ];

  const layers = [
    { title: "Presentation Layer", path: "src/app/ & src/components/", desc: "Next.js App Router, responsive UI & state" },
    { title: "Application Layer", path: "src/application/", desc: "Use cases orchestration, commands & queries" },
    { title: "Domain Layer", path: "src/domain/", desc: "Entities, Value Objects & Domain Rules murni" },
    { title: "Deterministic Engine", path: "src/engine/", desc: "12-stage pipeline matching, constraints & scoring" },
    { title: "Infrastructure Layer", path: "src/infrastructure/", desc: "Database, Repositories, AI Provider adapter" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-indigo-600/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Header / Brand */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg shadow-amber-500/20">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">RAMU</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  v0.1.0 • Phase 1
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium">Creative Opportunity Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Project Setup Ready
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-amber-400">⚡</span>
            <span>Bukan sekadar pencarian partner — pembentuk peluang kolaborasi terstruktur</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-tight">
            Meramu Peluang Ekonomi Kreatif Secara Cerdas & Terukur
          </h2>

          <p className="text-base md:text-lg text-slate-400 leading-relaxed">
            Menganalisis komplementaritas aset, kapabilitas, kebutuhan, dan batasan pelaku ekonomi kreatif melalui mesin evaluasi deterministik yang objektif dan transparan.
          </p>
        </section>

        {/* 6 Scoring Dimensions Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">6 Dimensi Standar Scoring</h3>
              <p className="text-sm text-slate-400">Formula evaluasi komprehensif mengacu pada <code className="text-amber-400 font-mono text-xs">docs/SCORING_MODEL.md</code></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dimensions.map((dim) => (
              <div
                key={dim.name}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                    {dim.badge}
                  </span>
                  <span className="text-sm font-bold text-amber-400">{dim.score}</span>
                </div>
                <h4 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {dim.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dim.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Layout Highlights */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Arsitektur Modular Berlapis</h3>
              <p className="text-sm text-slate-400">Sesuai blueprint <code className="text-amber-400 font-mono text-xs">docs/MVP_SCOPE.md</code> Section 60</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layers.map((layer) => (
              <div
                key={layer.title}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2"
              >
                <div className="text-xs font-mono text-amber-400/90">{layer.path}</div>
                <h4 className="font-semibold text-white text-sm">{layer.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Documentation Portal Callout */}
        <section className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Spesifikasi Lengkap</span>
              <h3 className="text-2xl font-bold text-white">17 Dokumen Teknis & ADR Telah Tersusun di <code className="text-amber-300 font-mono">docs/</code></h3>
              <p className="text-sm text-slate-400 max-w-2xl">
                Seluruh kebutuhan PRD, System Architecture, 12-Stage Engine, PostgreSQL Data Model, hingga Katalog Pattern telah tertata rapi dengan katalog panduan di <code className="text-slate-300">docs/README.md</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>RAMU • Creative Opportunity Engine for Web Development Competition</div>
          <div>Next.js 15 • TypeScript • Tailwind CSS • Modular Architecture</div>
        </footer>
      </div>
    </main>
  );
}
