"use client";

import { useState } from "react";
import { submitOpportunityFeedbackAction } from "../actions";
import { Star, MessageSquare } from "lucide-react";

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
    <section className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Evaluasi Kualitas Rekomendasi Peluang
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-normal">
            Bantu kalibrasi Deterministic Engine RAMU dengan menilai kesesuaian rekomendasi sinergi komplementer ini secara objektif.
          </p>
        </div>

        {averageCommunityRating && (
          <div className="p-3.5 px-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Skor Komunitas</div>
            <div className="text-xl font-black text-amber-900">{averageCommunityRating} / 5.0</div>
            <div className="text-[10px] text-amber-700">{feedbacks.length} ulasan pelaku kreatif</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Beri Penilaian Kualitas Rekomendasi
        </h3>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              message.includes("berhasil")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <label className="text-[11px] font-bold text-slate-900 block">1. Relevansi Usaha</label>
            <span className="text-[10px] text-slate-500 block">Sesuai visi & target brand</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, relevanceScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.relevanceScore >= star
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <label className="text-[11px] font-bold text-slate-900 block">2. Kelayakan Peran</label>
            <span className="text-[10px] text-slate-500 block">Mudah dieksekusi bersama</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, feasibilityScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.feasibilityScore >= star
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <label className="text-[11px] font-bold text-slate-900 block">3. Kebaruan Solusi</label>
            <span className="text-[10px] text-slate-500 block">Kombinasi unik & segar</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, noveltyScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.noveltyScore >= star
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <label className="text-[11px] font-bold text-slate-900 block">4. Nilai Manfaat</label>
            <span className="text-[10px] text-slate-500 block">Dampak nyata ke bisnis</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, usefulnessScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.usefulnessScore >= star
                      ? "bg-[#0284c7] text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
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
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Catatan Evaluasi / Rekomendasi Perbaikan Peluang
          </label>
          <textarea
            name="comments"
            rows={2}
            placeholder="Apakah ada peran atau aset pelengkap yang dirasa masih kurang? Berikan catatan kualitatif Anda..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold shadow-md shadow-[#4CC9FE]/25 cursor-pointer text-white disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Kirim Ulasan Peluang"}
        </button>
      </form>

      {feedbacks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Ulasan dari Pelaku Kreatif ({feedbacks.length})</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbacks.map((f: any) => (
              <div
                key={f.id}
                className="p-4 rounded-xl bg-white/70 border border-slate-200/80 space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{f.actor?.name || "Aktor Kreatif"}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(f.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  {f.relevanceScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold">
                      <span>Relevansi: {f.relevanceScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.feasibilityScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
                      <span>Kelayakan: {f.feasibilityScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.noveltyScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60 font-semibold">
                      <span>Kebaruan: {f.noveltyScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.usefulnessScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 font-semibold">
                      <span>Manfaat: {f.usefulnessScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </div>

                {f.comments && (
                  <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100">
                    &quot;{f.comments}&quot;
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
