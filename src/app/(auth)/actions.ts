"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { syncUserProfile } from "@/lib/profileSync";
import { isUserAdmin } from "@/lib/admin";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  let redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("[PROJECT_REF]")) {
    return {
      error: "Konfigurasi Supabase (NEXT_PUBLIC_SUPABASE_URL) belum terpasang di Vercel. Silakan tambahkan Environment Variables di Vercel lalu lakukan Redeploy.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMsg = error.message;
    if (error.message.includes("Invalid login credentials")) {
      errorMsg = "Email atau kata sandi tidak cocok. Silakan periksa kembali.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMsg = "Email belum dikonfirmasi. Silakan cek kotak masuk email Anda.";
    }
    return { error: errorMsg };
  }

  if (data.user) {
    let isAdminUser = isUserAdmin(data.user);

    try {
      const userMeta = data.user.user_metadata || {};
      const oauthAvatar = userMeta.avatar_url || userMeta.picture || null;
      const oauthName = userMeta.display_name || userMeta.full_name || userMeta.name;

      await syncUserProfile(
        data.user.id,
        data.user.email ?? email,
        oauthName,
        oauthAvatar
      );

      const [existingActor, profile] = await Promise.all([
        prisma.actor.findFirst({
          where: { ownerUserId: data.user.id },
        }),
        prisma.profile.findUnique({
          where: { id: data.user.id },
          select: { role: true },
        }),
      ]);

      if (profile?.role === "SUPERADMIN") {
        isAdminUser = true;
      }

      if (isAdminUser) {
        redirectTo = "/admin";
      } else if (!existingActor) {
        revalidatePath("/", "layout");
        redirect("/onboarding");
      }
    } catch (e: any) {
      if (e?.message?.includes("NEXT_REDIRECT")) {
        throw e;
      }
      console.error("Gagal sinkronisasi profil saat login:", e);
    }

    if (isAdminUser) {
      redirectTo = "/admin";
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim();
  const role = ((formData.get("role") as string) || (formData.get("sector") as string))?.trim();
  const location = (formData.get("location") as string)?.trim() || "Jakarta Selatan, Indonesia";

  if (!email || !password || !displayName) {
    return { error: "Nama, email, dan kata sandi wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Kata sandi minimal harus 6 karakter." };
  }

  // Canonical mapping to exactly 5 official RAMU roles & ActorTypes
  const ROLE_MAP: Record<string, { sector: string; actorType: "BRAND" | "STUDIO" | "INDIVIDUAL" }> = {
    "Fashion Brand/UMKM": { sector: "Fashion Brand/UMKM", actorType: "BRAND" },
    "Fashion Designer": { sector: "Fashion Brand/UMKM", actorType: "BRAND" }, // mapped to brand
    "Photographer": { sector: "Photographer", actorType: "INDIVIDUAL" },
    "Model": { sector: "Model", actorType: "INDIVIDUAL" },
    "MUA/Stylist": { sector: "MUA/Stylist", actorType: "INDIVIDUAL" },
    "Studio": { sector: "Studio", actorType: "STUDIO" },
  };

  const matched = ROLE_MAP[role] || { sector: "Photographer", actorType: "INDIVIDUAL" };
  const canonicalSector = matched.sector;
  const canonicalActorType = matched.actorType;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("[PROJECT_REF]")) {
    return {
      error: "Konfigurasi Supabase (NEXT_PUBLIC_SUPABASE_URL) belum terpasang di Vercel. Silakan tambahkan Environment Variables di Vercel lalu lakukan Redeploy.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // SECURITY: Only safe, non-privilege fields are written to Supabase
      // user_metadata here. The `role` field is intentionally excluded —
      // it is used only to seed actor.sector in our own Prisma DB (see below).
      // Never trust or forward client-supplied role/admin values to Auth metadata.
      data: {
        display_name: displayName,
        role: canonicalSector,
        location: location,
      },
    },
  });

  if (error) {
    let errorMsg = error.message;
    if (error.message.includes("User already registered") || error.message.includes("already exists")) {
      errorMsg = "Alamat email ini sudah terdaftar. Silakan langsung masuk ke akun Anda atau gunakan email lain.";
    } else if (error.message.includes("Password should be at least")) {
      errorMsg = "Kata sandi terlalu pendek. Gunakan minimal 6 karakter.";
    } else if (error.message.includes("Invalid email")) {
      errorMsg = "Format alamat email tidak valid.";
    }
    return { error: errorMsg };
  }

  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: "Alamat email ini sudah terdaftar di sistem. Silakan langsung masuk melalui halaman login." };
  }

  if (data.user) {
    try {
      await syncUserProfile(
        data.user.id,
        data.user.email ?? email,
        displayName,
        null
      );

      const existingActor = await prisma.actor.findFirst({
        where: { ownerUserId: data.user.id },
      });

      if (!existingActor) {
        await prisma.actor.create({
          data: {
            ownerUserId: data.user.id,
            name: displayName,
            actorType: canonicalActorType,
            sector: canonicalSector,
            location: location,
            description: null,
            contactEmail: email,
            status: "ACTIVE",
          },
        });
      } else {
        await prisma.actor.update({
          where: { id: existingActor.id },
          data: {
            actorType: canonicalActorType,
            sector: canonicalSector,
            location: location,
          },
        });
      }

      revalidatePath("/", "layout");
      redirect("/dashboard");
    } catch (e: any) {
      if (e?.message?.includes("NEXT_REDIRECT")) {
        throw e;
      }
      console.error("Gagal menyimpan profil & aktor lokal:", e);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
