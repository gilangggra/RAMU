import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { logout } from "@/app/(auth)/actions";
import { getGlobalLearningSignals } from "@/application/outcomeService";
import {
  Package,
  Megaphone,
  Handshake,
  Globe,
  CircleDollarSign,
  TrendingUp,
  Palette,
  Sparkles,
  BarChart3,
  Star,
  Trophy,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

export default async function EngineInsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const signals = await getGlobalLearningSignals();

  const outcomeTypeLabels: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
    PRODUCT: { label: "Produk Fisik / Digital", icon: <Package className="w-3.5 h-3.5" />, badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    CAMPAIGN: { label: "Kampanye / Pameran", icon: <Megaphone className="w-3.5 h-3.5" />, badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    SERVICE: { label: "Layanan Kolaboratif", icon: <Handshake className="w-3.5 h-3.5" />, badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    MARKET_ACCESS: { label: "Akses Pasar / Ritel", icon: <Globe className="w-3.5 h-3.5" />, badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    REVENUE: { label: "Realisasi Omzet", icon: <CircleDollarSign className="w-3.5 h-3.5" />, badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    AUDIENCE_GROWTH: { label: "Pertumbuhan Audiens", icon: <TrendingUp className="w-3.5 h-3.5" />, badge: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
    CREATIVE_ASSET: { label: "Aset Kreatif / HKI", icon: <Palette className="w-3.5 h-3.5" />, badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    OTHER: { label: "Luaran Lainnya", icon: <Sparkles className="w-3.5 h-3.5" />, badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
                R
              </div>
              <span className="font-bold text-lg tracking-tight text-white">RAMU</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/opportunities" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Peluang
              </Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Proyek (Briefs)
              </Link>
              <Link href="/collaborations" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Kolaborasi
              </Link>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                Engine Insights (Phase 5)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{actor.name}</div>
              <div className="text-[11px] text-slate-400">{actor.sector}</div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-3xl relative z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Phase 5: Closed-Loop Learning Flywheel
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Data Nyata & Transparan (No Fake Precision)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Sinyal Pembelajaran Engine & Validasi Luaran Ekosistem
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Selamat datang di pusat pemantauan efektivitas Creative Opportunity Engine. Phase 5 menutup siklus penuh produk dari analisis komplementaritas deterministik hingga pembuktian realisasi luaran nyata dan kalibrasi umpan balik dari pelaku ekonomi kreatif.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 relative z-10">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Peluang Diramu</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {signals.conversionFunnel.opportunities}
              </div>
              <span className="text-[10px] text-slate-400">Rekomendasi 12-tahap</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Kolaborasi Terbentuk</span>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {signals.conversionFunnel.collaborations}
              </div>
              <span className="text-[10px] text-slate-400">
                Konversi {signals.conversionFunnel.conversionRate}% dari peluang
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Proyek Selesai</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {signals.conversionFunnel.completedCollaborations}
              </div>
              <span className="text-[10px] text-slate-400">
                Rasio tuntas {signals.conversionFunnel.completionRate}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Luaran Terverifikasi</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {signals.conversionFunnel.outcomesAchieved}
              </div>
              <span className="text-[10px] text-slate-400">
                {signals.ecosystemMetrics.totalUnitsProduced > 0
                  ? `${signals.ecosystemMetrics.totalUnitsProduced} unit fisik`
                  : "Hasil riil tercatat"}
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                <span>Evaluasi Kepuasan 4-Dimensi Pelaku Kreatif</span>
              </h2>
              <p className="text-xs text-slate-400">
                Rata-rata ulasan nyata dari kolaborator yang mengeksekusi rekomendasi engine.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Total {signals.averageScores.count} Ulasan Terkumpul
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Relevansi Peluang</span>
                <span className="text-amber-400 font-bold text-xs">
                  {signals.averageScores.relevance > 0 ? `${signals.averageScores.relevance} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(signals.averageScores.relevance / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kecocokan visi brand dan segmentasi pasar antar mitra.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Kelayakan Eksekusi</span>
                <span className="text-emerald-400 font-bold text-xs">
                  {signals.averageScores.feasibility > 0 ? `${signals.averageScores.feasibility} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(signals.averageScores.feasibility / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kemudahan pembagian peran dan kepatuhan terhadap batasan kapasitas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Kebaruan Solusi</span>
                <span className="text-purple-400 font-bold text-xs">
                  {signals.averageScores.novelty > 0 ? `${signals.averageScores.novelty} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${(signals.averageScores.novelty / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Orisinalitas ide produk kolaborasi yang belum terpikirkan sebelumnya.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Kemanfaatan Nyata</span>
                <span className="text-cyan-400 font-bold text-xs">
                  {signals.averageScores.usefulness > 0 ? `${signals.averageScores.usefulness} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(signals.averageScores.usefulness / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pertumbuhan bisnis, perluasan portofolio, dan nilai komersial nyata.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              <span>Matriks Efektivitas Pola Kolaborasi (Pattern Performance)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluasi kinerja 6 pola kolaborasi utama berdasarkan jumlah luaran riil dan kepuasan aktor.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Kode & Nama Pola</th>
                  <th className="p-4">Kategori Subsektor</th>
                  <th className="p-4 text-center">Luaran Riil</th>
                  <th className="p-4 text-center">Jumlah Ulasan</th>
                  <th className="p-4 text-right">Skor Kepuasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {signals.patternPerformance.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category || "Cross-Sector"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-cyan-400">
                      {item.outcomeCount > 0 ? `${item.outcomeCount} Hasil` : "0"}
                    </td>
                    <td className="p-4 text-center text-slate-300">
                      {item.feedbackCount > 0 ? `${item.feedbackCount} feedback` : "-"}
                    </td>
                    <td className="p-4 text-right">
                      {item.averageSatisfaction > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <span>{item.averageSatisfaction} / 5.0</span>
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum diulas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Portofolio Luaran Kolaborasi Terkini</span>
              </h2>
              <p className="text-xs text-slate-400">
                Hasil nyata yang telah direalisasikan oleh jejaring pelaku ekonomi kreatif di platform RAMU.
              </p>
            </div>
            <Link
              href="/collaborations"
              className="text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1.5"
            >
              <span>Lihat Ruang Kolaborasi Anda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {signals.recentOutcomes.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-2">
              <div className="flex justify-center">
                <Package className="w-8 h-8 text-neutral-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">Belum Ada Luaran Ekosistem yang Dicatat</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Buka ruang kerja kolaborasi aktif Anda dan catat luaran pertama melalui tab "Luaran & Evaluasi".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.recentOutcomes.map((item: any) => {
                const typeInfo = outcomeTypeLabels[item.outcomeType] || outcomeTypeLabels.OTHER;
                const metrics = (item.metrics as any) || {};

                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${typeInfo.badge}`}>
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unit Produksi</span>
                        <span className="font-bold text-white">
                          {metrics.unitsProduced ? `${metrics.unitsProduced} Unit` : "Belum dicatat"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nilai Finansial</span>
                        <span className="font-bold text-amber-400">
                          {metrics.revenueAmount || "Belum dicatat"}
                        </span>
                      </div>
                    </div>

                    {item.collaboration && (
                      <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/60">
                        <span>Proyek: <strong className="text-slate-300">{item.collaboration.title}</strong></span>
                        <Link
                          href={`/collaborations/${item.collaboration.id}`}
                          className="text-cyan-400 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <span>Buka Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Bagaimana Flywheel Pembelajaran Deterministik Bekerja?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400">1. Transparan & Terlacak</div>
              <p className="text-slate-400 leading-relaxed">
                Setiap luaran dan feedback disimpan dengan audit trail lengkap. Data tidak diubah oleh black-box realtime untuk menjaga stabilitas pipeline deterministik.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400">2. Validasi Lapangan</div>
              <p className="text-slate-400 leading-relaxed">
                Umpan balik 4-dimensi (Relevansi, Kelayakan, Kebaruan, Manfaat) membuktikan apakah kombinasi aset berhasil dieksekusi oleh pelaku kreatif nyata.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-400">3. Kalibrasi Versi Engine</div>
              <p className="text-slate-400 leading-relaxed">
                Data feedback diagregasi menjadi dataset validasi untuk mengalibrasi bobot 6D scoring dan melahirkan versi engine baru yang semakin presisi.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
