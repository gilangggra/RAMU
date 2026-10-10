"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { isUserAdmin } from "@/lib/admin";
import { createNotification } from "@/application/notificationService";
import { ActorStatus, VerificationStatus, SanctionAction, DisputeStatus, ProjectBriefStatus } from "@prisma/client";

// Helper: Ensure the caller is an authenticated administrator
export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isUserAdmin(user)) {
    throw new Error("Akses ditolak: Anda tidak memiliki wewenang administrator.");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, displayName: true, email: true },
  });

  return {
    user,
    profile,
    adminId: user.id,
    adminName: profile?.displayName || user.email || "Administrator",
  };
}

// Helper: Append an entry to AdminAuditLog
export async function logAdminAudit(params: {
  adminId: string;
  adminName: string;
  actionType: string;
  targetEntity: string;
  targetId?: string | null;
  details?: Record<string, any>;
}) {
  try {
    return await prisma.adminAuditLog.create({
      data: {
        adminId: params.adminId,
        adminName: params.adminName,
        actionType: params.actionType,
        targetEntity: params.targetEntity,
        targetId: params.targetId || null,
        detailsJson: params.details || {},
      },
    });
  } catch (err) {
    console.error("Failed to write to admin audit log:", err);
    return null;
  }
}

// =============================================================================
// TRUST & SAFETY: USER STATUS & SANCTION LOGS
// =============================================================================

export async function updateActorStatusAction(formData: FormData) {
  try {
    const admin = await getAuthenticatedAdmin();
    const actorId = formData.get("actorId")?.toString();
    const status = formData.get("status")?.toString() as ActorStatus;
    const reason = formData.get("reason")?.toString()?.trim();

    if (!actorId || !status) {
      return { success: false, error: "Actor ID dan Status wajib diisi." };
    }

    if ((status === "SUSPENDED" || status === "BANNED") && (!reason || reason.length < 5)) {
      return { success: false, error: "Alasan penangguhan/pemblokiran wajib disertakan (minimal 5 karakter)." };
    }

    const previousActor = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, status: true },
    });

    if (!previousActor) {
      return { success: false, error: "Aktor tidak ditemukan." };
    }

    // 1. Update Actor Status
    const updatedActor = await prisma.actor.update({
      where: { id: actorId },
      data: { status },
    });

    // 2. Determine sanction action
    let sanctionAction: SanctionAction = SanctionAction.WARN;
    if (status === "SUSPENDED") sanctionAction = SanctionAction.SUSPEND;
    else if (status === "BANNED") sanctionAction = SanctionAction.BAN;
    else if (status === "ACTIVE") sanctionAction = SanctionAction.RESTORE;

    // 3. Record Sanction Log
    await prisma.userSanctionLog.create({
      data: {
        actorId,
        adminId: admin.adminId,
        action: sanctionAction,
        reason: reason || `Status diubah dari ${previousActor.status} ke ${status} oleh admin.`,
      },
    });

    // 4. Log to Admin Audit
    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: `ACTOR_${sanctionAction}`,
      targetEntity: "Actor",
      targetId: actorId,
      details: {
        actorName: previousActor.name,
        previousStatus: previousActor.status,
        newStatus: status,
        reason: reason || null,
      },
    });

    // 5. Notify the Creator
    await createNotification({
      actorId,
      title: status === "ACTIVE" ? "Akun Anda Telah Diaktifkan Kembali" : "Pemberitahuan Status Akun",
      message:
        status === "ACTIVE"
          ? "Akun Anda telah diaktifkan kembali oleh tim kepatuhan RAMU."
          : `Akun Anda telah berstatus ${status}. Alasan: ${reason || "Pelanggaran pedoman komunitas."}`,
      type: "INFO",
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true, updatedStatus: updatedActor.status };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah status user." };
  }
}

// Toggle Curated Spotlight (Editor's Pick)
export async function toggleActorCuratedAction(actorId: string, isCurated: boolean) {
  try {
    const admin = await getAuthenticatedAdmin();

    const actor = await prisma.actor.update({
      where: { id: actorId },
      data: { isCurated },
      select: { id: true, name: true, isCurated: true },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: isCurated ? "SPOTLIGHT_ADDED" : "SPOTLIGHT_REMOVED",
      targetEntity: "Actor",
      targetId: actorId,
      details: { actorName: actor.name, isCurated },
    });

    revalidatePath("/admin/users");
    revalidatePath("/directory");
    return { success: true, isCurated: actor.isCurated };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah status kurasi." };
  }
}

// =============================================================================
// VERIFICATION QUEUE: REVIEW PROFILES & GEAR PROOFS
// =============================================================================

export async function reviewVerificationRequestAction(formData: FormData) {
  try {
    const admin = await getAuthenticatedAdmin();
    const requestId = formData.get("requestId")?.toString();
    const actorId = formData.get("actorId")?.toString();
    const status = formData.get("status")?.toString() as VerificationStatus;
    const notes = formData.get("notes")?.toString()?.trim();
    const rejectionReason = formData.get("rejectionReason")?.toString()?.trim();

    if (!requestId || !actorId || !status) {
      return { success: false, error: "Data permintaan verifikasi tidak lengkap." };
    }

    // 1. Update Verification Request
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status,
        notes: notes || null,
        rejectionReason: rejectionReason || null,
        reviewedBy: admin.adminId,
      },
    });

    // 2. If APPROVED, grant Verified Badge on Actor
    if (status === "APPROVED") {
      await prisma.actor.update({
        where: { id: actorId },
        data: {
          isVerified: true,
          verifiedBadgeAt: new Date(),
        },
      });
    } else if (status === "REJECTED") {
      await prisma.actor.update({
        where: { id: actorId },
        data: { isVerified: false },
      });
    }

    // 3. Log Audit
    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: `VERIFICATION_${status}`,
      targetEntity: "VerificationRequest",
      targetId: requestId,
      details: {
        actorId,
        status,
        notes,
        rejectionReason,
      },
    });

    // 4. Notify Actor
    const notifyTitle =
      status === "APPROVED"
        ? "Selamat! Akun Anda Telah Terverifikasi"
        : status === "REVISION_REQUESTED"
        ? "Pembaruan: Pengajuan Verifikasi Memerlukan Revisi"
        : "Pemberitahuan Hasil Verifikasi Akun";

    const notifyMsg =
      status === "APPROVED"
        ? "Lencana Terverifikasi (Verified Badge) telah disematkan pada profil dan gear Anda."
        : status === "REVISION_REQUESTED"
        ? `Tim kurasi meminta revisi dokumen: ${notes || "Silakan periksa kelengkapan bukti alat kerja."}`
        : `Pengajuan verifikasi belum dapat disetujui. Alasan: ${rejectionReason || "Bukti belum memenuhi kriteria."}`;

    await createNotification({
      actorId,
      title: notifyTitle,
      message: notifyMsg,
      link: "/readiness",
      type: status === "APPROVED" ? "INTEREST_ACCEPTED" : "INFO",
    });

    revalidatePath("/admin");
    revalidatePath("/admin/verification");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal meninjau verifikasi." };
  }
}

// =============================================================================
// PROJECT MODERATION: APPROVAL, TAKE-DOWN & TIMEOUT INTERVENTION
// =============================================================================

export async function approveProjectBriefAction(briefId: string) {
  try {
    const admin = await getAuthenticatedAdmin();

    const brief = await prisma.projectBrief.update({
      where: { id: briefId },
      data: { status: "OPEN" },
      include: { creatorActor: { select: { id: true, name: true } } },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "BRIEF_APPROVED",
      targetEntity: "ProjectBrief",
      targetId: briefId,
      details: { title: brief.title, creatorName: brief.creatorActor.name },
    });

    await createNotification({
      actorId: brief.creatorActor.id,
      title: "Project Brief Telah Disetujui",
      message: `Brief "${brief.title}" kini telah resmi dipublikasikan dan terbuka untuk pelamar.`,
      link: `/projects/${briefId}`,
      type: "INTEREST_ACCEPTED",
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyetujui brief." };
  }
}

export async function takeDownProjectBriefAction(formData: FormData) {
  try {
    const admin = await getAuthenticatedAdmin();
    const briefId = formData.get("briefId")?.toString();
    const reason = formData.get("reason")?.toString()?.trim();

    if (!briefId || !reason) {
      return { success: false, error: "Brief ID dan Alasan penurunan wajib diisi." };
    }

    const brief = await prisma.projectBrief.update({
      where: { id: briefId },
      data: { status: "TAKEN_DOWN" },
      include: { creatorActor: { select: { id: true, name: true } } },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "BRIEF_TAKEN_DOWN",
      targetEntity: "ProjectBrief",
      targetId: briefId,
      details: { title: brief.title, reason, creatorName: brief.creatorActor.name },
    });

    await createNotification({
      actorId: brief.creatorActor.id,
      title: "Pemberitahuan Moderasi: Project Brief Diturunkan",
      message: `Brief "${brief.title}" telah diturunkan oleh moderator platform. Alasan: ${reason}`,
      link: `/projects`,
      type: "INTEREST_DECLINED",
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menurunkan brief." };
  }
}

export async function interveneTimeoutBriefAction(briefId: string, action: "CLOSE" | "EXTEND", days: number = 7) {
  try {
    const admin = await getAuthenticatedAdmin();

    const brief = await prisma.projectBrief.findUnique({
      where: { id: briefId },
      include: { creatorActor: { select: { id: true, name: true } } },
    });

    if (!brief) return { success: false, error: "Brief tidak ditemukan." };

    if (action === "CLOSE") {
      await prisma.projectBrief.update({
        where: { id: briefId },
        data: { status: "CLOSED", closedAt: new Date() },
      });

      await logAdminAudit({
        adminId: admin.adminId,
        adminName: admin.adminName,
        actionType: "BRIEF_TIMEOUT_CLOSED",
        targetEntity: "ProjectBrief",
        targetId: briefId,
        details: { title: brief.title, reason: "Inaktivitas melebihi batas toleransi." },
      });

      await createNotification({
        actorId: brief.creatorActor.id,
        title: "Project Brief Ditutup Karena Melebihi Batas Waktu",
        message: `Brief "${brief.title}" telah ditutup otomatis oleh sistem karena tidak ada respon terhadap pelamar.`,
        type: "INFO",
      });
    } else {
      // Extend timeline
      const currentTimeline = (brief.timeline as any) || {};
      const newTimeline = {
        ...currentTimeline,
        extendedByAdmin: true,
        extendedDays: (currentTimeline.extendedDays || 0) + days,
      };

      await prisma.projectBrief.update({
        where: { id: briefId },
        data: { timeline: newTimeline },
      });

      await logAdminAudit({
        adminId: admin.adminId,
        adminName: admin.adminName,
        actionType: "BRIEF_TIMEOUT_EXTENDED",
        targetEntity: "ProjectBrief",
        targetId: briefId,
        details: { title: brief.title, extendedDays: days },
      });
    }

    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal melakukan intervensi brief." };
  }
}

// =============================================================================
// DISPUTE RESOLUTION CENTER
// =============================================================================

export async function resolveDisputeAction(formData: FormData) {
  try {
    const admin = await getAuthenticatedAdmin();
    const disputeId = formData.get("disputeId")?.toString();
    const status = formData.get("status")?.toString() as DisputeStatus;
    const resolutionNotes = formData.get("resolutionNotes")?.toString()?.trim();

    if (!disputeId || !status || !resolutionNotes) {
      return { success: false, error: "Dispute ID, Status, dan Catatan Resolusi wajib diisi." };
    }

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolutionNotes,
        adminId: admin.adminId,
      },
      include: {
        reporter: { select: { id: true, name: true } },
        booking: {
          select: {
            id: true,
            requesterId: true,
            targetId: true,
            requester: { select: { name: true } },
            target: { select: { name: true } },
          },
        },
      },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: `DISPUTE_${status}`,
      targetEntity: "Dispute",
      targetId: disputeId,
      details: {
        reporterName: dispute.reporter.name,
        bookingId: dispute.bookingId,
        resolutionNotes,
      },
    });

    // Notify parties
    const notifyMsg = `Mediasi sengketa telah berstatus "${status}". Catatan: ${resolutionNotes}`;
    await createNotification({
      actorId: dispute.reporterId,
      title: "Pembaruan Kasus Sengketa Platform",
      message: notifyMsg,
      type: "INFO",
    });

    if (dispute.booking) {
      const otherActorId = dispute.booking.requesterId === dispute.reporterId
        ? dispute.booking.targetId
        : dispute.booking.requesterId;

      await createNotification({
        actorId: otherActorId,
        title: "Pembaruan Mediasi Sengketa Proyek",
        message: notifyMsg,
        type: "INFO",
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/disputes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui sengketa." };
  }
}

// =============================================================================
// DYNAMIC TAXONOMY: SECTORS & AESTHETIC TAGS
// =============================================================================

export async function createTaxonomySectorAction(name: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    const cleanName = name.trim();
    if (!cleanName) return { success: false, error: "Nama sektor tidak boleh kosong." };

    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const sector = await prisma.taxonomySector.create({
      data: { name: cleanName, slug, isActive: true },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "TAXONOMY_SECTOR_CREATED",
      targetEntity: "TaxonomySector",
      targetId: sector.id,
      details: { name: cleanName, slug },
    });

    revalidatePath("/admin/taxonomy");
    return { success: true, sector };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat sektor baru." };
  }
}

export async function toggleTaxonomySectorAction(id: string, isActive: boolean) {
  try {
    const admin = await getAuthenticatedAdmin();
    const sector = await prisma.taxonomySector.update({
      where: { id },
      data: { isActive },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: isActive ? "TAXONOMY_SECTOR_ENABLED" : "TAXONOMY_SECTOR_DISABLED",
      targetEntity: "TaxonomySector",
      targetId: id,
      details: { name: sector.name, isActive },
    });

    revalidatePath("/admin/taxonomy");
    return { success: true, sector };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah status sektor." };
  }
}

export async function deleteTaxonomySectorAction(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    const sector = await prisma.taxonomySector.delete({ where: { id } });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "TAXONOMY_SECTOR_DELETED",
      targetEntity: "TaxonomySector",
      targetId: id,
      details: { name: sector.name },
    });

    revalidatePath("/admin/taxonomy");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus sektor." };
  }
}

export async function createAestheticTagAction(name: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    const cleanName = name.trim();
    if (!cleanName) return { success: false, error: "Nama tag estetika tidak boleh kosong." };

    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const tag = await prisma.aestheticTag.create({
      data: { name: cleanName, slug, isActive: true },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "AESTHETIC_TAG_CREATED",
      targetEntity: "AestheticTag",
      targetId: tag.id,
      details: { name: cleanName, slug },
    });

    revalidatePath("/admin/taxonomy");
    return { success: true, tag };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat tag estetika baru." };
  }
}

export async function toggleAestheticTagAction(id: string, isActive: boolean) {
  try {
    const admin = await getAuthenticatedAdmin();
    const tag = await prisma.aestheticTag.update({
      where: { id },
      data: { isActive },
    });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: isActive ? "AESTHETIC_TAG_ENABLED" : "AESTHETIC_TAG_DISABLED",
      targetEntity: "AestheticTag",
      targetId: id,
      details: { name: tag.name, isActive },
    });

    revalidatePath("/admin/taxonomy");
    return { success: true, tag };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah status estetika." };
  }
}

export async function deleteAestheticTagAction(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    const tag = await prisma.aestheticTag.delete({ where: { id } });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "AESTHETIC_TAG_DELETED",
      targetEntity: "AestheticTag",
      targetId: id,
      details: { name: tag.name },
    });

    revalidatePath("/admin/taxonomy");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus tag estetika." };
  }
}

// =============================================================================
// ROLE BLUEPRINTS: STANDAR PERAN KRU & TARIF PASAR
// =============================================================================

export async function upsertRoleBlueprintAction(formData: FormData) {
  try {
    const admin = await getAuthenticatedAdmin();
    const id = formData.get("id")?.toString();
    const roleName = formData.get("roleName")?.toString()?.trim();
    const skillsRaw = formData.get("skills")?.toString() || "";
    const toolsRaw = formData.get("tools")?.toString() || "";
    const rateJunior = formData.get("rateJunior")?.toString()?.trim() || null;
    const rateMid = formData.get("rateMid")?.toString()?.trim() || null;
    const rateSenior = formData.get("rateSenior")?.toString()?.trim() || null;

    if (!roleName) return { success: false, error: "Nama peran profesi wajib diisi." };

    const skillsArray = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const recommendedTools = toolsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let blueprint;
    if (id) {
      blueprint = await prisma.roleBlueprint.update({
        where: { id },
        data: {
          roleName,
          skillsArray,
          recommendedTools,
          rateJunior,
          rateMid,
          rateSenior,
        },
      });
      await logAdminAudit({
        adminId: admin.adminId,
        adminName: admin.adminName,
        actionType: "ROLE_BLUEPRINT_UPDATED",
        targetEntity: "RoleBlueprint",
        targetId: id,
        details: { roleName },
      });
    } else {
      blueprint = await prisma.roleBlueprint.create({
        data: {
          roleName,
          skillsArray,
          recommendedTools,
          rateJunior,
          rateMid,
          rateSenior,
        },
      });
      await logAdminAudit({
        adminId: admin.adminId,
        adminName: admin.adminName,
        actionType: "ROLE_BLUEPRINT_CREATED",
        targetEntity: "RoleBlueprint",
        targetId: blueprint.id,
        details: { roleName },
      });
    }

    revalidatePath("/admin/roles");
    return { success: true, blueprint };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan blueprint peran kru." };
  }
}

export async function deleteRoleBlueprintAction(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    const bp = await prisma.roleBlueprint.delete({ where: { id } });

    await logAdminAudit({
      adminId: admin.adminId,
      adminName: admin.adminName,
      actionType: "ROLE_BLUEPRINT_DELETED",
      targetEntity: "RoleBlueprint",
      targetId: id,
      details: { roleName: bp.roleName },
    });

    revalidatePath("/admin/roles");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus blueprint." };
  }
}
