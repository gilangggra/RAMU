"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

export function AssetUploadField() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Mohon pilih file gambar (JPG, PNG, atau WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran foto maksimal adalah 10 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
          <span>Unggah Foto Bukti Fisik Aset *</span>
        </label>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          Upload Langsung
        </span>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (fileInputRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
            }
            handleFileChange(file);
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer text-center ${
          isDragging
            ? "border-amber-500 bg-amber-50/50 scale-[1.01]"
            : preview
            ? "border-emerald-300 bg-emerald-50/20"
            : "border-stone-300 hover:border-amber-400 bg-stone-50/60 hover:bg-stone-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="imageFile"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {preview ? (
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Foto Siap Diunggah</span>
              </div>
              <p className="text-xs font-bold text-[#1E1B2E] truncate">{fileName}</p>
              <p className="text-[11px] text-stone-500">{fileSize} • Klik untuk mengganti</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              title="Hapus foto"
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E1B2E]">
                Klik untuk memilih foto kamera / lensa / studio
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                atau tarik &amp; lepas file ke area ini (Maks. 10MB • JPG, PNG, WebP)
              </p>
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-stone-400">
        Foto diunggah langsung dari perangkat Anda dan otomatis tersimpan ke server.
      </p>
    </div>
  );
}
