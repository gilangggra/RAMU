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

  return prisma.bookingRequest.update({
    where: { id },
    data: { status }
  });
}

export async function updateBookingRequest(
  id: string, 
  requesterId: string, 
  input: UpdateBookingRequestInput
) {
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking request not found");
  if (booking.requesterId !== requesterId) throw new Error("Unauthorized to update this booking");

  return prisma.bookingRequest.update({
    where: { id },
    data: {
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
      details: input.details ? (input.details as unknown as Prisma.InputJsonValue) : undefined,
    }
  });
}

export async function cancelBookingRequest(id: string, requesterId: string) {
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking request not found");
  if (booking.requesterId !== requesterId) throw new Error("Unauthorized to cancel this booking");

  return prisma.bookingRequest.delete({ where: { id } });
}
