"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createNotification } from "@/application/notificationService";

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

    // 1. Cek apakah talenta sedang dalam status Sedang Penuh / Cuti
    const targetServiceAsset = await prisma.asset.findFirst({
      where: {
        actorId: data.targetId,
        status: "ACTIVE",
        subtype: "COMMERCIAL_SERVICE_PACKAGES",
      },
      select: { attributes: true },
    });

    if (targetServiceAsset && targetServiceAsset.attributes && typeof targetServiceAsset.attributes === "object") {
      const attrs = targetServiceAsset.attributes as Record<string, any>;
      if (attrs.availability && attrs.availability.isAvailable === false) {
        return {
          success: false,
          error: "Talenta saat ini sedang menandai status 'Sedang Penuh / Cuti'. Pemesanan slot baru dinonaktifkan sementara.",
        };
      }
    }

    // 2. Cek tabrakan jadwal (Schedule Collision Prevention) dengan pesanan berstatus ACCEPTED
    const startRange = new Date(parsedStartDate.getFullYear(), parsedStartDate.getMonth(), parsedStartDate.getDate(), 0, 0, 0);
    const endTarget = parsedEndDate || parsedStartDate;
    const endRange = new Date(endTarget.getFullYear(), endTarget.getMonth(), endTarget.getDate(), 23, 59, 59);

    const collision = await prisma.bookingRequest.findFirst({
      where: {
        targetId: data.targetId,
        status: "ACCEPTED",
        startDate: { lte: endRange },
        OR: [
          { endDate: null, startDate: { gte: startRange } },
          { endDate: { not: null, gte: startRange } },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    if (collision) {
      const collisionDateStr = collision.startDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return {
        success: false,
        error: `Jadwal pada tanggal ${collisionDateStr} telah terisi dan terkonfirmasi untuk proyek lain. Silakan pilih tanggal ketersediaan lain pada kalender.`,
      };
    }

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

    try {
      const targetActor = await prisma.actor.findUnique({
        where: { id: data.targetId },
        select: { name: true, actorType: true, sector: true },
      });

      const isTargetBrand =
        targetActor?.actorType === "BRAND" ||
        (targetActor?.actorType as string) === "MSME" ||
        targetActor?.actorType === "COLLECTIVE" ||
        (targetActor?.sector?.toLowerCase() || "").includes("brand") ||
        (targetActor?.sector?.toLowerCase() || "").includes("label") ||
        Boolean(data.details && typeof data.details === "object" && "collaborationType" in data.details);

      await createNotification({
        actorId: data.targetId,
        title: isTargetBrand ? "Proposal Kolaborasi Baru" : "Permintaan Booking Baru",
        message: isTargetBrand
          ? `${requester.name} mengajukan proposal kemitraan / pitch kolaborasi untuk brand Anda.`
          : `${requester.name} mengirimkan permintaan booking jasa komersial untuk Anda.`,
        type: "BOOKING_RECEIVED",
        link: `/dashboard/bookings/${booking.id}`,
        metadata: { bookingId: booking.id, requesterId: requester.id },
      });
    } catch (e) {
      console.error("Failed to notify target of new booking:", e);
    }

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

    const userActorIds = profile?.actors?.map((a) => a.id) || [];
    if (userActorIds.length === 0) return { success: false, error: "Profil aktor tidak ditemukan." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };
    if (!userActorIds.includes(booking.targetId)) {
      return { success: false, error: "Anda tidak memiliki akses untuk memperbarui pesanan ini." };
    }

    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return { success: false, error: "Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah statusnya." };
    }

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { status }
    });

    try {
      const targetActor = await prisma.actor.findUnique({
        where: { id: booking.targetId },
        select: { name: true, actorType: true, sector: true },
      });

      const bookingDetails =
        booking.details && typeof booking.details === "object"
          ? (booking.details as Record<string, any>)
          : {};
      const isTargetBrand =
        targetActor?.actorType === "BRAND" ||
        (targetActor?.actorType as string) === "MSME" ||
        targetActor?.actorType === "COLLECTIVE" ||
        (targetActor?.sector?.toLowerCase() || "").includes("brand") ||
        (targetActor?.sector?.toLowerCase() || "").includes("label") ||
        Boolean(bookingDetails.collaborationType);

      const notifTitle = isTargetBrand
        ? status === "ACCEPTED" ? "Proposal Kolaborasi Disetujui" : "Proposal Kolaborasi Ditolak"
        : status === "ACCEPTED" ? "Pesanan Booking Diterima" : "Pesanan Booking Ditolak";

      const notifMsg = isTargetBrand
        ? `${targetActor?.name || "Brand"} telah ${status === "ACCEPTED" ? "menyetujui" : "menolak"} proposal kemitraan kolaborasi Anda.`
        : `${targetActor?.name || "Kreator"} telah ${status === "ACCEPTED" ? "menyetujui" : "menolak"} permintaan booking SPK Anda.`;

      await createNotification({
        actorId: booking.requesterId,
        title: notifTitle,
        message: notifMsg,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${bookingId}`,
        metadata: { bookingId, status },
      });
    } catch (e) {
      console.error("Failed to notify requester of booking update:", e);
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Gagal memperbarui status pesanan." };
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
    if (!primaryActor) return { success: false, error: "Profil aktor tidak ditemukan." };
    const userActorIds = profile?.actors?.map((a) => a.id) || [];

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: {
        requester: true,
        target: true,
      },
    });

    if (!booking) return { success: false, error: "Booking tidak ditemukan." };

    if (!userActorIds.includes(booking.targetId) && !userActorIds.includes(booking.requesterId)) {
      return { success: false, error: "Anda tidak memiliki izin untuk mengonversi pesanan ini." };
    }

    if (booking.status !== "ACCEPTED") {
      return { success: false, error: "Pesanan harus berstatus diterima sebelum ruang kolaborasi dibuka." };
    }

    const details = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    if (details.collaborationId) {
      return { success: true, collaborationId: details.collaborationId };
    }

    const title = `Pesanan: ${booking.target.name} × ${booking.requester.name}`;
    const scheduleDate = booking.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const objective = `Eksekusi pesanan terkonfirmasi untuk ${booking.target.sector}. Tanggal: ${scheduleDate}. Anggaran: ${booking.budget || "Sesuai kesepakatan"}.`;

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

    const collaboration = await prisma.collaboration.create({
      data: {
        collaborationPlanId: plan.id,
        title,
        description: objective,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

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

    const updatedDetails = {
      ...details,
      collaborationId: collaboration.id,
    };

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { details: updatedDetails },
    });

    try {
      const partnerId = booking.targetId === primaryActor.id ? booking.requesterId : booking.targetId;
      await createNotification({
        actorId: partnerId,
        title: "Ruang Kolaborasi Dibuka",
        message: `${primaryActor.name} telah mengaktifkan Ruang Kolaborasi untuk pesanan SPK-${booking.id.slice(0, 8).toUpperCase()}. Mulai susun rundown dan penugasan tim.`,
        type: "COLLABORATION_STARTED",
        link: `/collaborations/${collaboration.id}`,
        metadata: { collaborationId: collaboration.id, bookingId },
      });
    } catch (e) {
      console.error("Failed to send collaboration opened notification:", e);
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");

    return { success: true, collaborationId: collaboration.id };
  } catch (error) {
    console.error("Error converting booking to collaboration:", error);
    return { success: false, error: "Gagal mengonversi pesanan ke ruang kolaborasi." };
  }
}

export async function cancelBookingRequestAction(bookingId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { actors: { where: { status: { not: "ARCHIVED" } } } }
    });
    const userActorIds = profile?.actors?.map((a) => a.id) || [];
    const primaryActor = profile?.actors?.[0];
    if (!primaryActor) return { success: false, error: "Profil aktor tidak ditemukan." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: { requester: true, target: true }
    });
    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };

    const isRequester = userActorIds.includes(booking.requesterId);
    const isTarget = userActorIds.includes(booking.targetId);
    if (!isRequester && !isTarget) {
      return { success: false, error: "Anda tidak memiliki akses untuk membatalkan pesanan ini." };
    }

    if (booking.status === "COMPLETED") {
      return { success: false, error: "Pesanan yang sudah selesai tidak dapat dibatalkan." };
    }

    if (booking.status === "CANCELLED") {
      return { success: false, error: "Pesanan ini sudah berstatus dibatalkan." };
    }

    const details = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    if (details.collaborationId) {
      return { success: false, error: "Pesanan yang sudah memiliki ruang kolaborasi aktif tidak dapat dibatalkan secara sepihak." };
    }

    const cancelledBy = isRequester ? booking.requester : booking.target;
    const notifiedPartyId = isRequester ? booking.targetId : booking.requesterId;

    const updatedDetails = {
      ...details,
      cancellation: {
        cancelledByActorId: cancelledBy.id,
        cancelledByName: cancelledBy.name,
        cancelledAt: new Date().toISOString(),
        reason: reason?.trim() || "Dibatalkan oleh pihak pemesan.",
      }
    };

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        details: updatedDetails,
      }
    });

    try {
      await createNotification({
        actorId: notifiedPartyId,
        title: "Pesanan Dibatalkan",
        message: `${cancelledBy.name} telah membatalkan pesanan SPK-RAMU-${bookingId.slice(0, 8).toUpperCase()}.${reason?.trim() ? ` Alasan: "${reason.trim()}"` : ""}`,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${bookingId}`,
        metadata: { bookingId, status: "CANCELLED", reason: reason?.trim() },
      });
    } catch (e) {
      console.error("Failed to send cancellation notification:", e);
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking request:", error);
    return { success: false, error: "Gagal membatalkan pesanan." };
  }
}

export interface RescheduleBookingData {
  bookingId: string;
  startDate: string;
  endDate?: string;
  budget?: string;
  notes?: string;
}

export async function rescheduleBookingRequestAction(data: RescheduleBookingData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { actors: { where: { status: { not: "ARCHIVED" } } } }
    });
    const userActorIds = profile?.actors?.map((a) => a.id) || [];
    const primaryActor = profile?.actors?.[0];
    if (!primaryActor) return { success: false, error: "Profil aktor tidak ditemukan." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: data.bookingId },
      include: { requester: true, target: true }
    });
    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };

    const isRequester = userActorIds.includes(booking.requesterId);
    const isTarget = userActorIds.includes(booking.targetId);
    if (!isRequester && !isTarget) {
      return { success: false, error: "Anda tidak memiliki akses untuk mengubah pesanan ini." };
    }

    if (booking.status === "CANCELLED" || booking.status === "DECLINED") {
      return { success: false, error: "Pesanan yang telah dibatalkan atau ditolak tidak dapat di-reschedule." };
    }

    if (booking.status === "COMPLETED") {
      return { success: false, error: "Pesanan yang sudah selesai (COMPLETED) tidak dapat di-reschedule." };
    }

    const currentBookingDetails = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    if (currentBookingDetails.collaborationId) {
      return {
        success: false,
        error: "Pesanan ini sudah memiliki ruang kerja kolaborasi aktif. Jadwal dan timeline dapat diselaraskan langsung di Workspace proyek.",
      };
    }

    if (!data.startDate || typeof data.startDate !== "string" || !data.startDate.trim()) {
      return { success: false, error: "Tanggal mulai pelaksanaan baru wajib diisi." };
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

    const actor = isRequester ? booking.requester : booking.target;
    const notifiedPartyId = isRequester ? booking.targetId : booking.requesterId;

    const details = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    const historyEntry = {
      proposedByActorId: actor.id,
      proposedByName: actor.name,
      proposedAt: new Date().toISOString(),
      oldStartDate: booking.startDate.toISOString(),
      oldEndDate: booking.endDate?.toISOString() || null,
      newStartDate: parsedStartDate.toISOString(),
      newEndDate: parsedEndDate?.toISOString() || null,
      oldBudget: booking.budget,
      newBudget: data.budget?.trim() || booking.budget,
      notes: data.notes?.trim() || "",
    };

    const rescheduleHistory = Array.isArray(details.rescheduleHistory)
      ? [...details.rescheduleHistory, historyEntry]
      : [historyEntry];

    const updatedDetails = {
      ...details,
      rescheduleHistory,
      latestRescheduleNote: data.notes?.trim() || details.latestRescheduleNote,
    };

    await prisma.bookingRequest.update({
      where: { id: data.bookingId },
      data: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        budget: data.budget?.trim() || booking.budget,
        status: "PENDING", // Kembali ke status PENDING agar pihak mitra meninjau & mengonfirmasi jadwal baru
        details: updatedDetails,
      }
    });

    try {
      const scheduleLabel = parsedStartDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      await createNotification({
        actorId: notifiedPartyId,
        title: "Pengajuan Reschedule Jadwal SPK",
        message: `${actor.name} mengajukan perubahan jadwal ke ${scheduleLabel} untuk pesanan SPK-RAMU-${data.bookingId.slice(0, 8).toUpperCase()}.${data.notes?.trim() ? ` Catatan: "${data.notes.trim()}"` : ""}`,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${data.bookingId}`,
        metadata: { bookingId: data.bookingId, status: "PENDING", newDate: parsedStartDate.toISOString() },
      });
    } catch (e) {
      console.error("Failed to send reschedule notification:", e);
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${data.bookingId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error rescheduling booking request:", error);
    return { success: false, error: "Gagal mengajukan perubahan jadwal." };
  }
}

export async function completeBookingRequestAction(bookingId: string, notes?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { actors: { where: { status: { not: "ARCHIVED" } } } },
    });
    const userActorIds = profile?.actors?.map((a) => a.id) || [];
    const primaryActor = profile?.actors?.[0];
    if (!primaryActor) return { success: false, error: "Profil aktor tidak ditemukan." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: { requester: true, target: true },
    });
    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };

    const isRequester = userActorIds.includes(booking.requesterId);
    const isTarget = userActorIds.includes(booking.targetId);
    if (!isRequester && !isTarget) {
      return { success: false, error: "Anda tidak memiliki akses untuk menyelesaikan pesanan ini." };
    }

    if (booking.status !== "ACCEPTED") {
      return { success: false, error: "Hanya pesanan berstatus disetujui (ACCEPTED) yang dapat diselesaikan." };
    }

    const existingDetails = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    const completedBy = isRequester ? booking.requester : booking.target;
    const notifiedPartyId = isRequester ? booking.targetId : booking.requesterId;

    const updatedDetails = {
      ...existingDetails,
      completion: {
        completedByActorId: completedBy.id,
        completedByName: completedBy.name,
        completedAt: new Date().toISOString(),
        notes: notes?.trim() || "Pekerjaan dan deliverables SPK telah diselesaikan tuntas.",
      },
    };

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
        details: updatedDetails,
      },
    });

    try {
      await createNotification({
        actorId: notifiedPartyId,
        title: "Pesanan Selesai (SPK Terpenuhi)",
        message: `${completedBy.name} telah menandai pesanan SPK-${booking.id.slice(0, 8).toUpperCase()} sebagai Selesai. Terima kasih atas kolaborasi profesional Anda.`,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${bookingId}`,
        metadata: { bookingId, status: "COMPLETED" },
      });
    } catch (e) {
      console.error("Failed to send booking completed notification:", e);
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Error completing booking request:", error);
    return { success: false, error: error.message || "Gagal menyelesaikan pesanan." };
  }
}

export interface ReportBookingDisputeInput {
  bookingId: string;
  category: string;
  reason: string;
  requestedResolution?: string;
}

export async function reportBookingDisputeAction(input: ReportBookingDisputeInput) {
  try {
    const { bookingId, category, reason, requestedResolution } = input;
    if (!bookingId || !reason || !reason.trim()) {
      return { success: false, error: "Alasan pengajuan mediasi wajib diisi." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { actors: { where: { status: { not: "ARCHIVED" } } } },
    });
    const userActorIds = profile?.actors?.map((a) => a.id) || [];
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: { requester: true, target: true },
    });
    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };

    const isRequester = userActorIds.includes(booking.requesterId);
    const isTarget = userActorIds.includes(booking.targetId);
    if (!isRequester && !isTarget) {
      return { success: false, error: "Anda tidak memiliki wewenang pada pesanan ini." };
    }

    const reporter = isRequester ? booking.requester : booking.target;
    const opponent = isRequester ? booking.target : booking.requester;

    const existingDetails = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    const disputeRecord = {
      reportedByActorId: reporter.id,
      reportedByName: reporter.name,
      reportedAt: new Date().toISOString(),
      category: category || "GENERAL_DISPUTE",
      reason: reason.trim(),
      requestedResolution: requestedResolution?.trim() || "Mediasi musyawarah resmi RAMU",
      status: "OPEN_MEDIATION",
    };

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        details: {
          ...existingDetails,
          dispute: disputeRecord,
        },
      },
    });

    try {
      await createNotification({
        actorId: opponent.id,
        title: "Permintaan Mediasi SPK Diajukan",
        message: `${reporter.name} telah mengajukan permintaan mediasi sengketa untuk SPK-${booking.id.slice(0, 8).toUpperCase()}. Tim Kepatuhan RAMU mengawasi penyelesaian ini.`,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${bookingId}`,
        metadata: { bookingId, disputeCategory: category },
      });
    } catch (e) {
      console.error("Failed to notify dispute:", e);
    }

    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error reporting booking dispute:", error);
    return { success: false, error: error.message || "Gagal mengajukan mediasi." };
  }
}

export async function getActorBookedDatesAction(actorId: string): Promise<string[]> {
  try {
    const acceptedBookings = await prisma.bookingRequest.findMany({
      where: {
        targetId: actorId,
        status: "ACCEPTED",
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    const datesSet = new Set<string>();
    for (const b of acceptedBookings) {
      const cur = new Date(b.startDate);
      const end = b.endDate ? new Date(b.endDate) : new Date(b.startDate);
      while (cur <= end) {
        datesSet.add(cur.toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return Array.from(datesSet);
  } catch (err) {
    console.error("Error fetching actor booked dates:", err);
    return [];
  }
}

export interface PaymentSlipPayload {
  bookingId: string;
  stage: "DP" | "PELUNASAN";
  amount: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  referenceNumber: string;
  slipUrl?: string;
  notes?: string;
}

export async function submitPaymentSlipAction(payload: PaymentSlipPayload) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) return { success: false, error: "Profil tidak ditemukan." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: payload.bookingId },
      include: { requester: true, target: true },
    });
    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };

    if (booking.requesterId !== actor.id && booking.targetId !== actor.id) {
      return { success: false, error: "Anda tidak berhak memperbarui pesanan ini." };
    }

    const existingDetails = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    const existingSlips: any[] = Array.isArray(existingDetails.paymentSlips) ? existingDetails.paymentSlips : [];

    const newSlip = {
      id: `slip-${Date.now()}`,
      stage: payload.stage,
      amount: payload.amount,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      accountHolder: payload.accountHolder,
      referenceNumber: payload.referenceNumber,
      slipUrl: payload.slipUrl || null,
      notes: payload.notes || "",
      submittedByActorId: actor.id,
      submittedAt: new Date().toISOString(),
      status: "PENDING_VERIFICATION",
    };

    const updatedDetails = {
      ...existingDetails,
      paymentSlips: [...existingSlips, newSlip],
      latestPaymentStatus: `PENDING_${payload.stage}_VERIFICATION`,
    };

    await prisma.bookingRequest.update({
      where: { id: payload.bookingId },
      data: { details: updatedDetails },
    });

    const opponentId = booking.requesterId === actor.id ? booking.targetId : booking.requesterId;
    try {
      await createNotification({
        actorId: opponentId,
        title: `Bukti Transfer Pembayaran ${payload.stage} Masuk`,
        message: `${actor.name} telah mengirimkan bukti transfer ${payload.stage} sebesar ${payload.amount} (Ref: ${payload.referenceNumber}). Mohon periksa mutasi rekening Anda.`,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${payload.bookingId}`,
        metadata: { bookingId: payload.bookingId, stage: payload.stage },
      });
    } catch (e) {
      console.error("Gagal mengirim notifikasi slip:", e);
    }

    revalidatePath(`/dashboard/bookings/${payload.bookingId}`);
    revalidatePath("/dashboard/bookings");
    return { success: true, slip: newSlip };
  } catch (error: any) {
    console.error("Error submitting payment slip:", error);
    return { success: false, error: error.message || "Gagal mengunggah bukti transfer." };
  }
}

export async function verifyPaymentSlipAction(
  bookingId: string,
  slipId: string,
  isApproved: boolean,
  rejectionReason?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) return { success: false, error: "Profil tidak ditemukan." };

    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: { requester: true, target: true },
    });
    if (!booking) return { success: false, error: "Pesanan tidak ditemukan." };

    const existingDetails = (typeof booking.details === "object" && booking.details !== null)
      ? (booking.details as Record<string, any>)
      : {};

    const existingSlips: any[] = Array.isArray(existingDetails.paymentSlips) ? existingDetails.paymentSlips : [];
    const slipIdx = existingSlips.findIndex((s) => s.id === slipId);
    if (slipIdx === -1) return { success: false, error: "Bukti transfer tidak ditemukan." };

    const targetSlip = existingSlips[slipIdx];
    targetSlip.status = isApproved ? "VERIFIED" : "REJECTED";
    targetSlip.verifiedAt = new Date().toISOString();
    targetSlip.verifiedByActorId = actor.id;
    if (!isApproved && rejectionReason) {
      targetSlip.rejectionReason = rejectionReason;
    }

    existingSlips[slipIdx] = targetSlip;

    let overallPaymentStatus = existingDetails.paymentStatus || "UNPAID";
    if (isApproved) {
      overallPaymentStatus = targetSlip.stage === "PELUNASAN" ? "PAID_IN_FULL" : "DP_VERIFIED";
    }

    const updatedDetails = {
      ...existingDetails,
      paymentSlips: existingSlips,
      paymentStatus: overallPaymentStatus,
      latestPaymentStatus: isApproved ? `${targetSlip.stage}_VERIFIED` : `${targetSlip.stage}_REJECTED`,
    };

    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { details: updatedDetails },
    });

    const recipientId = booking.requesterId === actor.id ? booking.targetId : booking.requesterId;
    try {
      await createNotification({
        actorId: recipientId,
        title: isApproved ? `Pembayaran ${targetSlip.stage} Dikonfirmasi Lunas` : `Verifikasi Pembayaran ${targetSlip.stage} Memerlukan Koreksi`,
        message: isApproved
          ? `${actor.name} telah mengonfirmasi bahwa dana transfer ${targetSlip.stage} telah masuk ke rekening secara sah.`
          : `${actor.name} menandai bahwa dana transfer belum terverifikasi mutasi: "${rejectionReason || "Dana belum masuk rekening"}"`,
        type: "BOOKING_UPDATE",
        link: `/dashboard/bookings/${bookingId}`,
        metadata: { bookingId, slipId, isApproved },
      });
    } catch (e) {
      console.error("Gagal mengirim notifikasi verifikasi slip:", e);
    }

    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error verifying payment slip:", error);
    return { success: false, error: error.message || "Gagal memverifikasi bukti pembayaran." };
  }
}

