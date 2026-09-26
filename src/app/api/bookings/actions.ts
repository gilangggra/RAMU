"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export interface BookingFormData {
  targetId: string;
  startDate: string;
  endDate?: string;
  budget?: string;
  details: any;
}

export async function createBookingRequest(data: BookingFormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Get current user's active actor (requester)
    const requester = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "asc" },
    });

    if (!requester) {
      return { success: false, error: "You must complete your profile first." };
    }

    if (requester.id === data.targetId) {
      return { success: false, error: "Anda tidak dapat menyewa profil Anda sendiri." };
    }

    if (!data.startDate || typeof data.startDate !== "string" || !data.startDate.trim()) {
      return { success: false, error: "Tanggal mulai pelaksanaan wajib diisi." };
    }

    const parsedStartDate = new Date(data.startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return { success: false, error: "Format tanggal mulai pelaksanaan tidak valid." };
    }

    let parsedEndDate: Date | null = null;
    if (data.endDate && typeof data.endDate === "string" && data.endDate.trim()) {
      parsedEndDate = new Date(data.endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return { success: false, error: "Format tanggal selesai tidak valid." };
      }
      if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
        return { success: false, error: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." };
      }
    }

    // Create the booking request
    const booking = await prisma.bookingRequest.create({
      data: {
        requesterId: requester.id,
        targetId: data.targetId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        budget: data.budget ? data.budget.trim() : null,
        details: data.details || {},
      },
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Error creating booking request:", error);
    return { success: false, error: "Failed to create booking request. Please try again." };
  }
}

export async function updateBookingStatus(bookingId: string, status: "ACCEPTED" | "DECLINED") {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { actors: { where: { status: { not: "ARCHIVED" } } } }
    });

    const primaryActor = profile?.actors?.[0];
    if (!primaryActor) return { success: false, error: "Profile not found." };

    // Verify ownership of the target actor
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return { success: false, error: "Booking not found." };
    if (booking.targetId !== primaryActor.id) {
      return { success: false, error: "You are not authorized to update this booking." };
    }

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { status }
    });

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function convertBookingToCollaboration(bookingId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { actors: { where: { status: { not: "ARCHIVED" } } } }
    });

    const primaryActor = profile?.actors?.[0];
    if (!primaryActor) return { success: false, error: "Profile not found." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: {
        requester: true,
        target: true,
      },
    });

    if (!booking) return { success: false, error: "Booking tidak ditemukan." };

    // Verify user is either target or requester
    if (booking.targetId !== primaryActor.id && booking.requesterId !== primaryActor.id) {
      return { success: false, error: "Anda tidak memiliki izin untuk mengonversi pesanan ini." };
    }

    if (booking.status !== "ACCEPTED") {
      return { success: false, error: "Pesanan harus berstatus diterima sebelum ruang kolaborasi dibuka." };
    }

    const details = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    // If collaboration already exists, return it
    if (details.collaborationId) {
      return { success: true, collaborationId: details.collaborationId };
    }

    const title = `Pesanan: ${booking.target.name} × ${booking.requester.name}`;
    const scheduleDate = booking.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const objective = `Eksekusi pesanan terkonfirmasi untuk ${booking.target.sector}. Tanggal: ${scheduleDate}. Anggaran: ${booking.budget || "Sesuai kesepakatan"}.`;

    // Create CollaborationPlan
    const plan = await prisma.collaborationPlan.create({
      data: {
        createdByActorId: primaryActor.id,
        title,
        objective,
        expectedOutputs: ["Aset visual / layanan hasil produksi terverifikasi"],
        budget: {
          estimatedTotal: booking.budget || "Sesuai kesepakatan",
          costSharingModel: "Layanan Komersial / Booking Langsung",
        },
        timeline: {
          estimatedDuration: "Sesuai sesi pesanan",
          targetLaunch: booking.startDate.toISOString().split("T")[0],
          projectLinks: {},
        },
        revenueModel: {
          modelType: "DIRECT_FEE",
          description: "Pembayaran fee booking / sewa terkonfirmasi",
        },
        ownershipRules: {
          brandModel: "Sesuai hak cipta & lisensi standar industri visual",
        },
        ipRules: {
          originalIp: "Hak guna foto/aset disepakati bersama oleh klien dan penyedia jasa.",
        },
        status: "PROPOSED",
      },
    });

    // Create CollaborationRoles
    await prisma.collaborationRole.create({
      data: {
        collaborationPlanId: plan.id,
        actorId: booking.targetId,
        roleCode: "PROVIDER",
        responsibility: `Penyedia Layanan / Fasilitas (${booking.target.sector})`,
        contribution: "Menyediakan layanan teknis, studio, atau talenta visual sesuai booking",
        status: "ACCEPTED",
      },
    });

    await prisma.collaborationRole.create({
      data: {
        collaborationPlanId: plan.id,
        actorId: booking.requesterId,
        roleCode: "CLIENT",
        responsibility: "Klien / Pemesan",
        contribution: "Arahan konsep, spesifikasi pesanan, dan pembiayaan",
        status: "ACCEPTED",
      },
    });

    // Create Collaboration
    const collaboration = await prisma.collaboration.create({
      data: {
        collaborationPlanId: plan.id,
        title,
        description: objective,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    // Add Participants
    await prisma.collaborationParticipant.createMany({
      data: [
        {
          collaborationId: collaboration.id,
          actorId: booking.targetId,
          roleCode: "PROVIDER",
          status: "ACTIVE",
        },
        {
          collaborationId: collaboration.id,
          actorId: booking.requesterId,
          roleCode: "CLIENT",
          status: "ACTIVE",
        },
      ],
    });

    // Create starter tasks
    await prisma.task.createMany({
      data: [
        {
          collaborationId: collaboration.id,
          title: "Penyelarasan Call Sheet & Waktu Kehadiran",
          description: `Koordinasikan kedatangan ke lokasi untuk jadwal ${scheduleDate}.`,
          priority: "HIGH",
          status: "TODO",
          assignedActorId: primaryActor.id,
        },
        {
          collaborationId: collaboration.id,
          title: "Sesi Eksekusi / Pemotretan",
          description: "Pelaksanaan sesi kerja sesuai rincian booking.",
          priority: "HIGH",
          status: "TODO",
          assignedActorId: booking.targetId,
        },
        {
          collaborationId: collaboration.id,
          title: "Penyerahan File Master & Verifikasi Luaran",
          description: "Pengiriman link Google Drive master hasil foto/video untuk disetujui klien.",
          priority: "MEDIUM",
          status: "TODO",
          assignedActorId: booking.targetId,
        },
      ],
    });

    // Update booking details with collaborationId
    const updatedDetails = {
      ...details,
      collaborationId: collaboration.id,
    };

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { details: updatedDetails },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");

    return { success: true, collaborationId: collaboration.id };
  } catch (error) {
    console.error("Error converting booking to collaboration:", error);
    return { success: false, error: "Gagal mengonversi pesanan ke ruang kolaborasi." };
  }
}

