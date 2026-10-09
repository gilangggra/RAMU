import { prisma } from "@/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export interface CreateBookingRequestInput {
  requesterId: string;
  targetId: string;
  startDate: Date;
  endDate?: Date;
  budget?: string;
  details: Record<string, unknown>;
}

export interface UpdateBookingRequestInput {
  startDate?: Date;
  endDate?: Date;
  budget?: string;
  details?: Record<string, unknown>;
}

export async function createBookingRequest(input: CreateBookingRequestInput) {
  if (input.requesterId === input.targetId) {
    throw new Error("Anda tidak dapat memesan layanan Anda sendiri.");
  }
  if (input.endDate && input.endDate < input.startDate) {
    throw new Error("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
  }

  return prisma.bookingRequest.create({
    data: {
      requesterId: input.requesterId,
      targetId: input.targetId,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
      details: input.details as unknown as Prisma.InputJsonValue,
      status: "PENDING",
    },
    include: { requester: true, target: true }
  });
}

export async function getBookingRequestById(id: string) {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { requester: true, target: true }
  });
  if (!booking) throw new Error("Booking request not found");
  return booking;
}

export async function getBookingsForTarget(targetId: string) {
  return prisma.bookingRequest.findMany({
    where: { targetId },
    include: { requester: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getBookingsFromRequester(requesterId: string) {
  return prisma.bookingRequest.findMany({
    where: { requesterId },
    include: { target: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function respondToBookingRequest(
  id: string, 
  targetId: string, 
  status: "ACCEPTED" | "DECLINED" | "NEGOTIATING"
) {
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking request not found");
  if (booking.targetId !== targetId) throw new Error("Unauthorized to respond to this booking");
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    throw new Error("Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah statusnya.");
  }

  return prisma.bookingRequest.update({
    where: { id },
    data: { status }
  });
}

export async function updateBookingRequest(
  id: string, 
  actorId: string, 
  input: UpdateBookingRequestInput
) {
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking request not found");
  if (booking.requesterId !== actorId && booking.targetId !== actorId) {
    throw new Error("Unauthorized to update this booking");
  }
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    throw new Error("Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah.");
  }

  return prisma.bookingRequest.update({
    where: { id },
    data: {
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
      status: "PENDING",
      details: input.details ? (input.details as unknown as Prisma.InputJsonValue) : undefined,
    }
  });
}

export async function cancelBookingRequest(id: string, actorId: string, reason?: string) {
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking request not found");
  if (booking.requesterId !== actorId && booking.targetId !== actorId) {
    throw new Error("Unauthorized to cancel this booking");
  }
  if (booking.status === "COMPLETED") {
    throw new Error("Pesanan yang sudah selesai tidak dapat dibatalkan.");
  }
  if (booking.status === "CANCELLED") {
    throw new Error("Pesanan ini sudah berstatus dibatalkan.");
  }

  const existingDetails = (typeof booking.details === "object" && booking.details !== null)
    ? (booking.details as Record<string, any>)
    : {};

  return prisma.bookingRequest.update({
    where: { id },
    data: {
      status: "CANCELLED",
      details: {
        ...existingDetails,
        cancellation: {
          cancelledByActorId: actorId,
          cancelledAt: new Date().toISOString(),
          reason: reason || "Dibatalkan.",
        },
      } as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function completeBookingRequest(id: string, actorId: string, notes?: string) {
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking request not found");
  if (booking.requesterId !== actorId && booking.targetId !== actorId) {
    throw new Error("Unauthorized to complete this booking");
  }
  if (booking.status !== "ACCEPTED") {
    throw new Error("Hanya pesanan yang sudah disetujui (ACCEPTED) yang dapat diselesaikan.");
  }

  const existingDetails = (typeof booking.details === "object" && booking.details !== null)
    ? (booking.details as Record<string, any>)
    : {};

  return prisma.bookingRequest.update({
    where: { id },
    data: {
      status: "COMPLETED",
      details: {
        ...existingDetails,
        completion: {
          completedByActorId: actorId,
          completedAt: new Date().toISOString(),
          notes: notes || "Pekerjaan dan deliverables telah diselesaikan dan disetujui kedua belah pihak.",
        },
      } as unknown as Prisma.InputJsonValue,
    },
  });
}

