"use client";

import React, { useState, useRef } from "react";
import { updateAdminProfileAction } from "@/app/admin/settings/actions";
import { Save, Loader2, CheckCircle2, AlertCircle, Camera, Trash2, User } from "lucide-react";
import { InstagramIcon } from "@/lib/socialUtils";

export interface AdminProfileData {
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  instagram: string | null;
  avatarUrl?: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const WHATSAPP_REGEX = /^(\+62|62|0)8\d{7,12}$/;
const INSTAGRAM_REGEX = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all text-xs sm:text-sm font-medium text-[#27213D]";

/**
 * Form profil admin. Markup & kelas mengikuti ProfileForm role umum,
 * dengan field yang dibatasi untuk kebutuhan admin.
 */
export function AdminProfileForm({ initialData }: { initialData: AdminProfileData }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran foto profil maksimal 4 MB." });
        e.target.value = "";
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

  function validate(formData: FormData): string | null {
    const name = formData.get("name")?.toString().trim() || "";
    const email = formData.get("contactEmail")?.toString().trim() || "";
    const phone = (formData.get("contactPhone")?.toString() || "").replace(/[\s-]/g, "");
    const igRaw = formData.get("instagram")?.toString().trim() || "";
    const ig = igRaw.replace(/.*instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");

    if (!name) return "Nama lengkap wajib diisi.";
    if (email && !EMAIL_REGEX.test(email)) return "Format email publik tidak valid (contoh: nama@domain.com).";
    if (phone && !WHATSAPP_REGEX.test(phone)) return "Format nomor WhatsApp tidak valid (contoh: 081234567890 atau +6281234567890).";
    if (ig && !INSTAGRAM_REGEX.test(ig)) return "Username Instagram tidak valid. Gunakan huruf, angka, titik, atau garis bawah (maks. 30 karakter).";
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const validationError = validate(formData);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setIsPending(true);
    const result = await updateAdminProfileAction(formData);

    if (result.success) {
      if (result.avatarUrl !== undefined) {
        setAvatarPreview(result.avatarUrl);
        setRemoveAvatar(false);
        window.dispatchEvent(new CustomEvent("ramu:avatar-updated", { detail: { avatarUrl: result.avatarUrl } }));
      }
      setMessage({ type: "success", text: result.message || "Berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan." });
    }

    setIsPending(false);
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-[28px] border border-stone-200/80 shadow-xs overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-[#FAF8F5]/70">
        <h2 className="text-xl font-black text-[#27213D] tracking-tight">Profil Dasar &amp; Identitas</h2>
        <p className="text-xs sm:text-sm text-[#716B7E] mt-1">
          Identitas dan kontak admin yang digunakan untuk komunikasi operasional platform RAMU.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-semibold ${
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

        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex flex-col sm:flex-row items-center gap-5">
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
            className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200 bg-white hover:border-[#4CC9FE] transition-all flex items-center justify-center cursor-pointer shrink-0 group relative shadow-xs"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={initialData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center font-bold text-lg text-stone-700">
                {initialData.name ? initialData.name.charAt(0).toUpperCase() : <User className="w-6 h-6 text-stone-400" />}
              </div>
            )}
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Ubah Foto
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">Foto Profil</h3>
            <p className="text-xs text-[#716B7E] leading-relaxed">
              Format JPG, PNG, atau WebP. Maksimal ukuran 4 MB.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:text-[#27213D] hover:bg-stone-50 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-stone-500" />
                <span>{avatarPreview ? "Ganti Foto" : "Unggah Foto"}</span>
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="admin-name" className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="admin-name"
              name="name"
              defaultValue={initialData.name}
              required
              maxLength={80}
              className={inputClass}
              placeholder="Misal: Bernadya Putri"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-contactEmail" className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
              Email Publik
            </label>
            <input
              type="email"
              id="admin-contactEmail"
              name="contactEmail"
              defaultValue={initialData.contactEmail || ""}
              className={inputClass}
              placeholder="email@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-contactPhone" className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
              No. WhatsApp
            </label>
            <input
              type="tel"
              id="admin-contactPhone"
              name="contactPhone"
              defaultValue={initialData.contactPhone || ""}
              className={inputClass}
              placeholder="081234567890 atau +62..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="admin-instagram" className="text-xs font-bold text-[#27213D] uppercase tracking-wider flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Akun Instagram (Opsional)</span>
            </label>
            <input
              type="text"
              id="admin-instagram"
              name="instagram"
              defaultValue={initialData.instagram || ""}
              className={inputClass}
              placeholder="@username atau https://instagram.com/..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            id="admin-profile-save"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4CC9FE]/25 hover:shadow-lg hover:shadow-[#4CC9FE]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
