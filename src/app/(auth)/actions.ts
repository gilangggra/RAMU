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
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
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
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password || !displayName) {
    return { error: "Nama, email, dan kata sandi wajib diisi." };
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Format alamat email tidak valid (harus menyertakan domain lengkap, contoh: nama@domain.com)." };
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
      // it is used only to seed actor.sector in our own Prisma DB.
      data: {
        display_name: displayName,
        role: canonicalSector,
        location: location,
      },
    },
  });

  // Periksa apakah user sudah pernah mendaftar tetapi belum terkonfirmasi (Supabase mengembalikan identities kosong atau User already registered)
  const isExistingUnconfirmed =
    (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) ||
    (error && (error.message.includes("User already registered") || error.message.includes("already exists")));

  if (isExistingUnconfirmed) {
    // Coba kirimkan ulang kode OTP pendaftaran untuk akun yang belum terkonfirmasi
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (!resendError) {
      return {
        success: true,
        requiresOtp: true,
        email,
        displayName,
        role: canonicalSector,
        location,
      };
    }

    if (
      resendError.message.toLowerCase().includes("confirmed") ||
      resendError.message.toLowerCase().includes("already")
    ) {
      return {
        error: "Alamat email ini sudah terdaftar dan aktif. Silakan langsung masuk melalui halaman login.",
      };
    }

    return {
      error: "Alamat email ini sudah terdaftar di sistem. Silakan langsung masuk melalui halaman login.",
    };
  }

  if (error) {
    let errorMsg = error.message;
    if (error.message.includes("Password should be at least")) {
      errorMsg = "Kata sandi terlalu pendek. Gunakan minimal 6 karakter.";
    } else if (error.message.includes("Invalid email")) {
      errorMsg = "Format alamat email tidak valid.";
    } else if (
      error.message.toLowerCase().includes("rate limit") ||
      error.message.toLowerCase().includes("over_email_send_rate_limit")
    ) {
      errorMsg = "Batas pengiriman email verifikasi tercapai. Harap tunggu beberapa saat sebelum mencoba mendaftar lagi.";
    } else if (error.message.toLowerCase().includes("error sending confirmation email")) {
      errorMsg = "Gagal mengirimkan email verifikasi. Pastikan konfigurasi SMTP di Supabase sudah benar (Host smtp.gmail.com, Port 587, User & App Password Google).";
    }
    return { error: errorMsg };
  }

  // Jika Supabase mengembalikan session langsung (Confirm Email tidak aktif di Supabase dashboard)
  if (data.session && data.user) {
    try {
      await upsertActorAndProfile({
        userId: data.user.id,
        email: data.user.email ?? email,
        displayName,
        canonicalActorType,
        canonicalSector,
        location,
      });
      revalidatePath("/", "layout");
      redirect(redirectTo);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
        throw e;
      }
      console.error("Gagal sinkronisasi profil saat pendaftaran otomatis:", e);
    }
    revalidatePath("/", "layout");
    redirect(redirectTo);
  }

  // Alur standar aman: Mengharuskan verifikasi kode OTP 6-digit untuk keabsahan identitas SPK
  return {
    success: true,
    requiresOtp: true,
    email,
    displayName,
    role: canonicalSector,
    location,
  };
}

async function upsertActorAndProfile({
  userId,
  email,
  displayName,
  canonicalActorType,
  canonicalSector,
  location,
}: {
  userId: string;
  email: string;
  displayName: string;
  canonicalActorType: "BRAND" | "STUDIO" | "INDIVIDUAL";
  canonicalSector: string;
  location: string;
}) {
  await syncUserProfile(
    userId,
    email,
    displayName,
    null
  );

  const existingActor = await prisma.actor.findFirst({
    where: { ownerUserId: userId },
  });

  if (!existingActor) {
    await prisma.actor.create({
      data: {
        ownerUserId: userId,
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
}

export async function verifyOtpSignup(payload: {
  email: string;
  token: string;
  displayName: string;
  role: string;
  location: string;
  redirectTo?: string;
}) {
  const email = payload.email?.trim();
  const token = payload.token?.trim();
  const displayName = payload.displayName?.trim();
  const role = payload.role?.trim();
  const location = payload.location?.trim() || "Jakarta Selatan, Indonesia";
  const redirectTo = payload.redirectTo || "/dashboard";

  if (!email || !token) {
    return { error: "Email dan 6-digit kode OTP wajib diisi." };
  }

  if (token.length !== 6 || !/^\d{6}$/.test(token)) {
    return { error: "Kode OTP harus berupa 6 digit angka." };
  }

  const ROLE_MAP: Record<string, { sector: string; actorType: "BRAND" | "STUDIO" | "INDIVIDUAL" }> = {
    "Fashion Brand/UMKM": { sector: "Fashion Brand/UMKM", actorType: "BRAND" },
    "Fashion Designer": { sector: "Fashion Brand/UMKM", actorType: "BRAND" },
    "Photographer": { sector: "Photographer", actorType: "INDIVIDUAL" },
    "Model": { sector: "Model", actorType: "INDIVIDUAL" },
    "MUA/Stylist": { sector: "MUA/Stylist", actorType: "INDIVIDUAL" },
    "Studio": { sector: "Studio", actorType: "STUDIO" },
  };

  const matched = ROLE_MAP[role] || { sector: "Photographer", actorType: "INDIVIDUAL" };
  const canonicalSector = matched.sector;
  const canonicalActorType = matched.actorType;

  const supabase = await createClient();

  // Verifikasi token OTP pendaftaran di Supabase
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    let errorMsg = error.message;
    if (
      error.message.toLowerCase().includes("invalid") ||
      error.message.toLowerCase().includes("expired")
    ) {
      errorMsg = "Kode OTP tidak valid atau sudah kadaluarsa. Silakan periksa kotak masuk email Anda atau klik 'Kirim Ulang Kode'.";
    } else if (
      error.message.toLowerCase().includes("rate limit") ||
      error.message.toLowerCase().includes("too many")
    ) {
      errorMsg = "Terlalu banyak percobaan yang salah. Silakan tunggu beberapa saat sebelum mencoba lagi.";
    }
    return { error: errorMsg };
  }

  if (!data.user) {
    return { error: "Verifikasi gagal. Akun pengguna tidak ditemukan. Silakan lakukan pendaftaran ulang." };
  }

  try {
    await upsertActorAndProfile({
      userId: data.user.id,
      email: data.user.email ?? email,
      displayName: displayName || data.user.email?.split("@")[0] || "Kreator RAMU",
      canonicalActorType,
      canonicalSector,
      location,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
      throw e;
    }
    console.error("Gagal menyimpan profil & aktor lokal setelah verifikasi OTP:", e);
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function resendSignupOtp(email: string) {
  const cleanEmail = email?.trim();
  if (!cleanEmail) {
    return { error: "Alamat email wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: cleanEmail,
  });

  if (error) {
    let errorMsg = error.message;
    if (
      error.message.toLowerCase().includes("rate limit") ||
      error.message.toLowerCase().includes("over_email_send_rate_limit")
    ) {
      errorMsg = "Batas frekuensi kirim kode tercapai. Harap tunggu sekitar 60 detik sebelum meminta kode baru.";
    }
    return { error: errorMsg };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
