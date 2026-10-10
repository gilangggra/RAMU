"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedAdmin } from "@/app/admin/actions";
import { ADMIN_NOTIFICATION_KEYS } from "./config";

/**
 * Pengaturan akun admin.
 * Penyimpanan mengikuti skema role umum:
 * - Nama & foto  → Profile.displayName / Profile.avatarUrl (+ Supabase user_metadata)
 * - Kontak       → Actor.contactEmail / Actor.contactPhone / Actor.websiteUrl (Instagram)
 * - Notifikasi   → Asset OPERATIONAL_SETTINGS milik actor → attributes.notificationPreferences
 * Jika akun admin belum memiliki Actor, data kontak & notifikasi disimpan ke
 * Supabase user_metadata sebagai fallback (tanpa membuat Actor baru, agar admin
 * tidak ikut muncul di direktori talenta).
 */

const AVATAR_MAX_BYTES = 4 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Validasi dasar
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const WHATSAPP_REGEX = /^(\+62|62|0)8\d{7,12}$/;
const INSTAGRAM_REGEX = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

function normalizeInstagram(raw: string): string {
  let v = raw.trim();
  const urlMatch = v.match(/instagram\.com\/([^/?#]+)/i);
  if (urlMatch) v = urlMatch[1];
  return v.replace(/^@/, "").replace(/\/$/, "");
}

async function findAdminActor(userId: string) {
  return prisma.actor.findFirst({
    where: { ownerUserId: userId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateAdminProfileAction(formData: FormData) {
  try {
    const { user } = await getAuthenticatedAdmin();
    const supabase = await createClient();

    const name = formData.get("name")?.toString().trim() || "";
    const contactEmail = formData.get("contactEmail")?.toString().trim() || "";
    const rawPhone = formData.get("contactPhone")?.toString().trim() || "";
    const rawInstagram = formData.get("instagram")?.toString().trim() || "";

    if (!name) throw new Error("Nama lengkap wajib diisi.");
    if (name.length > 80) throw new Error("Nama lengkap maksimal 80 karakter.");

    if (contactEmail && !EMAIL_REGEX.test(contactEmail)) {
      throw new Error("Format email publik tidak valid (contoh: nama@domain.com).");
    }

    const contactPhone = rawPhone.replace(/[\s-]/g, "");
    if (contactPhone && !WHATSAPP_REGEX.test(contactPhone)) {
      throw new Error("Format nomor WhatsApp tidak valid (contoh: 081234567890 atau +6281234567890).");
    }

    const instagram = rawInstagram ? normalizeInstagram(rawInstagram) : "";
    if (instagram && !INSTAGRAM_REGEX.test(instagram)) {
      throw new Error("Username Instagram tidak valid. Gunakan huruf, angka, titik, atau garis bawah (maks. 30 karakter).");
    }

    // ── Foto profil ──────────────────────────────────────────────────────────
    const avatarFile = formData.get("avatarFile") as File | null;
    const removeAvatar = formData.get("removeAvatar") === "true";
    let newAvatarUrl: string | null | undefined = undefined;

    const existingProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });
    const previousAvatarUrl = existingProfile?.avatarUrl || null;

    if (avatarFile && avatarFile.size > 0 && typeof avatarFile.arrayBuffer === "function") {
      if (!AVATAR_ALLOWED_TYPES.includes(avatarFile.type)) {
        throw new Error("Format foto profil harus JPG, PNG, atau WebP.");
      }
      if (avatarFile.size > AVATAR_MAX_BYTES) {
        throw new Error("Ukuran foto profil maksimal 4 MB.");
      }
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const ext = AVATAR_EXTENSIONS[avatarFile.type] || "jpg";
      const filename = `${user.id}-${Date.now()}.${ext}`;

      try {
        const { data: storageData, error: storageError } = await supabase.storage
          .from("avatars")
          .upload(filename, buffer, { contentType: avatarFile.type, upsert: true });
        if (!storageError && storageData) {
          const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(storageData.path);
          if (publicUrlData?.publicUrl) newAvatarUrl = publicUrlData.publicUrl;
        }
      } catch (cloudErr) {
        console.warn("Supabase storage avatar upload failed, falling back:", cloudErr);
      }

      if (newAvatarUrl === undefined) {
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, filename), buffer);
          newAvatarUrl = `/uploads/avatars/${filename}`;
        } catch (fsErr) {
          console.warn("Local filesystem write failed (serverless environment):", fsErr);
        }
      }
    } else if (removeAvatar) {
      newAvatarUrl = null;
    }

    // ── Profile (nama & foto) ────────────────────────────────────────────────
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        displayName: name,
        ...(newAvatarUrl !== undefined ? { avatarUrl: newAvatarUrl } : {}),
      },
      create: {
        id: user.id,
        email: user.email || `${user.id}@ramu.id`,
        displayName: name,
        avatarUrl: newAvatarUrl ?? null,
      },
    });

    if (
      newAvatarUrl !== undefined &&
      previousAvatarUrl &&
      previousAvatarUrl !== newAvatarUrl &&
      previousAvatarUrl.startsWith("/uploads/avatars/")
    ) {
      const filepath = path.join(process.cwd(), "public", "uploads", "avatars", path.basename(previousAvatarUrl));
      await unlink(filepath).catch(() => {});
    }

    // ── Kontak ───────────────────────────────────────────────────────────────
    const instagramUrl = instagram ? `https://instagram.com/${instagram}` : null;
    const actor = await findAdminActor(user.id);

    const metadata: Record<string, unknown> = { display_name: name };
    if (newAvatarUrl !== undefined) {
      metadata.avatar_url = newAvatarUrl || null;
      metadata.picture = newAvatarUrl || null;
    }

    if (actor) {
      await prisma.actor.update({
        where: { id: actor.id },
        data: {
          name,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          websiteUrl: instagramUrl,
        },
      });
    } else {
      metadata.admin_contact = {
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        instagram: instagram || null,
      };
    }

    await supabase.auth.updateUser({ data: metadata }).catch(() => {});

    revalidatePath("/admin", "layout");
    revalidatePath("/admin/settings/profile");

    return { success: true, message: "Profil admin berhasil diperbarui.", avatarUrl: newAvatarUrl };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating admin profile:", err);
    return { success: false, error: err?.message || "Terjadi kesalahan saat menyimpan profil." };
  }
}

export async function updateAdminNotificationSettingsAction(formData: FormData) {
  try {
    const { user } = await getAuthenticatedAdmin();

    const prefs: Record<string, boolean | string> = {};
    for (const key of ADMIN_NOTIFICATION_KEYS) {
      prefs[key] = formData.get(key) === "true";
    }
    prefs.updatedAt = new Date().toISOString();

    const actor = await findAdminActor(user.id);

    if (actor) {
      let asset = await prisma.asset.findFirst({
        where: { actorId: actor.id, subtype: "OPERATIONAL_SETTINGS" },
        orderBy: { createdAt: "desc" },
      });

      if (!asset) {
        asset = await prisma.asset.create({
          data: {
            actorId: actor.id,
            category: "SKILL_TALENT",
            subtype: "OPERATIONAL_SETTINGS",
            name: `Layanan & Rekening ${actor.name}`,
            description: `Pengaturan rekening pencairan dan ketersediaan ${actor.name}`,
            roles: ["CAPABILITY"],
            attributes: {},
            sourceType: "SELF_REPORTED",
            confidenceLevel: "HIGH",
            status: "ACTIVE",
          },
        });
      }

      const attrs =
        asset.attributes && typeof asset.attributes === "object"
          ? (asset.attributes as Record<string, unknown>)
          : {};

      const updatedAttrs = {
        ...attrs,
        notificationPreferences: {
          ...(typeof attrs.notificationPreferences === "object" && attrs.notificationPreferences !== null
            ? (attrs.notificationPreferences as Record<string, unknown>)
            : {}),
          ...prefs,
        },
      };

      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          attributes: updatedAttrs as Prisma.InputJsonValue,
        },
      });
    } else {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        data: { admin_notification_preferences: prefs },
      });
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin/settings/notifications");

    return { success: true, message: "Preferensi notifikasi admin berhasil disimpan." };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating admin notification settings:", err);
    return { success: false, error: err?.message || "Gagal menyimpan preferensi notifikasi." };
  }
}
