"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

import { syncUserProfile } from "@/lib/profileSync";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email dan password wajib diisi")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    // Pastikan profile sinkron di database Prisma (migrasikan kepemilikan aktor jika dari seeding)
    await syncUserProfile(
      data.user.id,
      data.user.email ?? email,
      data.user.user_metadata?.display_name
    );

    // Cek apakah user sudah memiliki Actor profile
    const existingActor = await prisma.actor.findFirst({
      where: { ownerUserId: data.user.id },
    });

    if (!existingActor) {
      revalidatePath("/", "layout");
      redirect("/onboarding");
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
  const location = (formData.get("location") as string)?.trim();

  // Extended onboarding inputs
  const bio = (formData.get("bio") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const skillsRaw = formData.get("skills") as string;
  const website = (formData.get("website") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const receiveNotifications = formData.get("receiveNotifications") === "true";

  let parsedSkills: string[] = [];
  try {
    if (skillsRaw) {
      parsedSkills = JSON.parse(skillsRaw);
    }
  } catch {
    parsedSkills = skillsRaw ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }

  if (!email || !password || !displayName) {
    redirect(`/register?error=${encodeURIComponent("Nama, email, dan kata sandi wajib diisi.")}`);
  }

  if (password.length < 6) {
    redirect(`/register?error=${encodeURIComponent("Kata sandi minimal harus 6 karakter.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: role || undefined,
        location: location || undefined,
        bio: bio || undefined,
        skills: parsedSkills,
        website: website || undefined,
        phone: phone || undefined,
        notifications_enabled: receiveNotifications,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    // Buat/sinkron profil pengguna awal di database aplikasi
    try {
      await syncUserProfile(data.user.id, data.user.email ?? email, displayName);

      // Update bio di profil jika ada
      if (bio) {
        await prisma.profile.update({
          where: { id: data.user.id },
          data: { bio },
        }).catch(() => {});
      }

      // Gabungkan lokasi kota dan detail alamat jika ada
      const fullLocation = address ? `${address}, ${location}` : location;

      // Buat profil aktor utama
      const existingActor = await prisma.actor.findFirst({
        where: { ownerUserId: data.user.id },
      });

      let actorId = existingActor?.id;

      if (!existingActor) {
        const newActor = await prisma.actor.create({
          data: {
            ownerUserId: data.user.id,
            name: displayName,
            actorType: "STUDIO",
            sector: role || "Kriya & Kreatif",
            location: fullLocation || "Indonesia",
            description: bio || null,
            websiteUrl: website || null,
            contactPhone: phone || null,
            contactEmail: email,
            status: "ACTIVE",
          },
        });
        actorId = newActor.id;
      } else {
        await prisma.actor.update({
          where: { id: existingActor.id },
          data: {
            sector: role || existingActor.sector,
            location: fullLocation || existingActor.location,
            description: bio || existingActor.description,
            websiteUrl: website || existingActor.websiteUrl,
            contactPhone: phone || existingActor.contactPhone,
          },
        });
      }

      // Jika ada keahlian/spesialisasi yang diinput, daftarkan otomatis sebagai Asset berkategori CAPABILITY
      if (actorId && parsedSkills.length > 0) {
        for (const skill of parsedSkills) {
          const existingAsset = await prisma.asset.findFirst({
            where: {
              actorId: actorId,
              name: skill,
            },
          });

          if (!existingAsset) {
            await prisma.asset.create({
              data: {
                actorId: actorId,
                category: "CAPABILITY",
                subtype: "Keahlian Spesifik",
                name: skill,
                roles: ["CAPABILITY"],
                sourceType: "SELF_REPORTED",
                confidenceLevel: "HIGH",
                status: "ACTIVE",
                attributes: {
                  tags: ["Onboarding", "Skill"],
                  selfReported: true,
                },
              },
            }).catch(() => {});
          }
        }
      }

      revalidatePath("/", "layout");
      redirect("/dashboard");
    } catch (e: any) {
      // Jika ini adalah redirect Next.js, biarkan melempar
      if (e?.message?.includes("NEXT_REDIRECT")) {
        throw e;
      }
      console.error("Gagal menyimpan profil & aset lokal:", e);
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
