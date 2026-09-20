"use client";

import { useState } from "react";
import { submitOpportunityFeedbackAction } from "../actions";
import { Star } from "lucide-react";

interface OpportunityFeedbackSectionProps {
  opportunityId: string;
  feedbacks: any[];
  currentActorId: string;
}

export function OpportunityFeedbackSection({
  opportunityId,
  feedbacks,
  currentActorId,
}: OpportunityFeedbackSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [ratings, setRatings] = useState({
    relevanceScore: 5,
    feasibilityScore: 5,
    noveltyScore: 5,
    usefulnessScore: 5,
  });

  let totalScore = 0;
  let scoreCount = 0;
  for (const f of feedbacks) {
    const avg =
      ((f.relevanceScore || 0) +
        (f.feasibilityScore || 0) +
        (f.noveltyScore || 0) +
        (f.usefulnessScore || 0)) /
      4;
    if (avg > 0) {
      totalScore += avg;
      scoreCount++;
    }
  }
  const averageCommunityRating = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("relevanceScore", String(ratings.relevanceScore));
    formData.set("feasibilityScore", String(ratings.feasibilityScore));
    formData.set("noveltyScore", String(ratings.noveltyScore));
    formData.set("usefulnessScore", String(ratings.usefulnessScore));

    try {
      const res = await submitOpportunityFeedbackAction(opportunityId, formData);
      if (res.success) {
        form.reset();
        setMessage("Terima kasih! Evaluasi Anda berhasil dicatat sebagai sinyal pembelajaran kualitas engine.");
      } else {
        setMessage(res.error || "Gagal menyimpan evaluasi.");
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Evaluasi Kualitas Rekomendasi Peluang (Phase 5)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Apakah rekomendasi 12-tahap engine ini relevan dan masuk akal? Berikan umpan balik 4-dimensi untuk melatih kalibrasi bobot dan validitas data ekosistem.
          </p>
        </div>

        {averageCommunityRating && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-amber-300">Skor Komunitas</div>
            <div className="text-2xl font-black text-amber-400">{averageCommunityRating} / 5.0</div>
            <div className="text-[10px] text-slate-400">{feedbacks.length} ulasan pelaku kreatif</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          + Beri Penilaian Kualitas Rekomendasi
        </h3>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold animate-fade-in ${
              message.includes("berhasil")
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-bold text-white block">1. Relevansi Usaha</label>
            <span className="text-[10px] text-slate-400 block">Sesuai visi & target brand</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, relevanceScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.relevanceScore >= star
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-bold text-white block">2. Kelayakan Peran</label>
            <span className="text-[10px] text-slate-400 block">Mudah dieksekusi bersama</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, feasibilityScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.feasibilityScore >= star
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-bold text-white block">3. Kebaruan Solusi</label>
            <span className="text-[10px] text-slate-400 block">Kombinasi unik & segar</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, noveltyScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.noveltyScore >= star
                      ? "bg-purple-500 text-slate-950 shadow-sm shadow-purple-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-bold text-white block">4. Nilai Manfaat</label>
            <span className="text-[10px] text-slate-400 block">Dampak nyata ke bisnis</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, usefulnessScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.usefulnessScore >= star
                      ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Catatan Evaluasi / Rekomendasi Perbaikan Peluang
          </label>
          <textarea
            name="comments"
            rows={2}
            placeholder="Apakah ada peran atau aset pelengkap yang dirasa masih kurang? Berikan catatan kualitatif Anda..."
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Kirim Ulasan Peluang"}
        </button>
      </form>

      {feedbacks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Ulasan dari Pelaku Kreatif ({feedbacks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbacks.map((f: any) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{f.actor?.name || "Aktor Kreatif"}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(f.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  {f.relevanceScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      <span>Relevansi: {f.relevanceScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.feasibilityScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                      <span>Kelayakan: {f.feasibilityScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.noveltyScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                      <span>Kebaruan: {f.noveltyScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.usefulnessScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                      <span>Manfaat: {f.usefulnessScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </div>

                {f.comments && (
                  <p className="text-slate-300 leading-relaxed italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
                    "{f.comments}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
