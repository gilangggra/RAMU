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
    <section className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <h2 className="text-lg font-bold text-[#27213D] tracking-tight">
              Evaluasi Kualitas Rekomendasi Peluang (Phase 5)
            </h2>
          </div>
          <p className="text-xs text-[#716B7E] max-w-xl leading-relaxed">
            Apakah rekomendasi 12-tahap engine ini relevan dan masuk akal? Berikan umpan balik 4-dimensi untuk melatih kalibrasi bobot dan validitas data ekosistem.
          </p>
        </div>

        {averageCommunityRating && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Skor Komunitas</div>
            <div className="text-2xl font-black text-amber-900">{averageCommunityRating} / 5.0</div>
            <div className="text-[10px] text-amber-700">{feedbacks.length} ulasan pelaku kreatif</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-5">
        <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
          + Beri Penilaian Kualitas Rekomendasi
        </h3>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold ${
              message.includes("berhasil")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
            <label className="text-[11px] font-bold text-[#27213D] block">1. Relevansi Usaha</label>
            <span className="text-[10px] text-[#716B7E] block">Sesuai visi & target brand</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, relevanceScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.relevanceScore >= star
                      ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
            <label className="text-[11px] font-bold text-[#27213D] block">2. Kelayakan Peran</label>
            <span className="text-[10px] text-[#716B7E] block">Mudah dieksekusi bersama</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, feasibilityScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.feasibilityScore >= star
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
            <label className="text-[11px] font-bold text-[#27213D] block">3. Kebaruan Solusi</label>
            <span className="text-[10px] text-[#716B7E] block">Kombinasi unik & segar</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, noveltyScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.noveltyScore >= star
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
            <label className="text-[11px] font-bold text-[#27213D] block">4. Nilai Manfaat</label>
            <span className="text-[10px] text-[#716B7E] block">Dampak nyata ke bisnis</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings((p) => ({ ...p, usefulnessScore: star }))}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    ratings.usefulnessScore >= star
                      ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
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
          <label className="text-xs font-semibold uppercase tracking-wider text-[#716B7E]">
            Catatan Evaluasi / Rekomendasi Perbaikan Peluang
          </label>
          <textarea
            name="comments"
            rows={2}
            placeholder="Apakah ada peran atau aset pelengkap yang dirasa masih kurang? Berikan catatan kualitatif Anda..."
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200/80 text-sm text-[#27213D] placeholder-[#9E98A8] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Kirim Ulasan Peluang"}
        </button>
      </form>

      {feedbacks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Ulasan dari Pelaku Kreatif ({feedbacks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbacks.map((f: any) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#27213D]">{f.actor?.name || "Aktor Kreatif"}</span>
                  <span className="text-[11px] text-[#716B7E]">
                    {new Date(f.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  {f.relevanceScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-bold">
                      <span>Relevansi: {f.relevanceScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.feasibilityScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold">
                      <span>Kelayakan: {f.feasibilityScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.noveltyScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60 font-bold">
                      <span>Kebaruan: {f.noveltyScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                  {f.usefulnessScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 font-bold">
                      <span>Manfaat: {f.usefulnessScore}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </div>

                {f.comments && (
                  <p className="text-[#27213D] leading-relaxed italic bg-white p-3 rounded-xl border border-stone-200/60">
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
