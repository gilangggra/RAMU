"use client";

import React, { useState, useRef } from "react";
import { updateProfileBasicInfo } from "@/app/settings/actions";
import { Save, Loader2, CheckCircle2, AlertCircle, Camera, Trash2, User } from "lucide-react";
import { parseSocialLinks, InstagramIcon } from "@/lib/socialUtils";

interface ProfileData {
  name: string;
  sector: string;
  description: string | null;
  location: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  avatarUrl?: string | null;
}

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSocials = parseSocialLinks(initialData.websiteUrl);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran foto profil maksimal 5 MB." });
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      setMessage(null);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileBasicInfo(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan." });
    }
    
    setIsPending(false);
  }

  return (
    <div className="bg-white rounded-none border border-stone-200 shadow-xs overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
        <h2 className="text-xl font-bold text-[#1E1B2E]">Profil Dasar</h2>
        <p className="text-sm text-stone-500 mt-1">
          Informasi ini akan ditampilkan secara publik di Direktori dan Showcase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-none flex items-start gap-3 text-sm font-semibold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <p className="mt-0.5">{message.text}</p>
          </div>
        )}

        <div className="p-4 sm:p-5 rounded-none bg-stone-50/80 border border-stone-200/80 flex flex-col sm:flex-row items-center gap-5">
          <input
            type="file"
            name="avatarFile"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleAvatarFile}
          />
          <input
            type="hidden"
            name="removeAvatar"
            value={removeAvatar ? "true" : "false"}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-none overflow-hidden border border-stone-200 bg-white hover:border-[#1E1B2E] transition-all flex items-center justify-center cursor-pointer shrink-0 group relative shadow-2xs"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={initialData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center font-bold text-lg text-[#1E1B2E]">
                {initialData.name ? initialData.name.charAt(0).toUpperCase() : <User className="w-6 h-6 text-stone-400" />}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Ubah Foto
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">Foto Profil</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Format JPG, PNG, atau WebP. Maksimal ukuran 5 MB.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-2xs transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-stone-500" />
                <span>{avatarPreview ? "Ganti Foto" : "Unggah Foto"}</span>
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Nama Lengkap / Stage Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData.name}
              required
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="Misal: Budi Santoso"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sector" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Sektor / Peran Utama <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="sector"
              name="sector"
              defaultValue={initialData.sector}
              required
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="Misal: Fotografer, Model, dsb"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Bio / Deskripsi Singkat
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData.description || ""}
              rows={4}
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm text-stone-800 resize-none"
              placeholder="Ceritakan tentang diri Anda, fokus karya, dan visi kreatif..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="location" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Lokasi / Basis
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={initialData.location || ""}
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="Misal: Jakarta, Indonesia"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contactEmail" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Email Publik
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              defaultValue={initialData.contactEmail || ""}
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="email@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPhone" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              No. WhatsApp / Telepon
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              defaultValue={initialData.contactPhone || ""}
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="+62..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="instagram" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Akun Instagram (Opsional)</span>
            </label>
            <input
              type="text"
              id="instagram"
              name="instagram"
              defaultValue={initialSocials.instagram?.handle || ""}
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="@username atau https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="websiteUrl" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Website / Portofolio Eksternal (Opsional)
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              defaultValue={initialSocials.website?.url || ""}
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="https://portofolioanda.com"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-none bg-[#1E1B2E] text-white font-bold text-sm hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
