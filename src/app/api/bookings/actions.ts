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
      return { success: false, error: "You cannot book yourself." };
    }

    // Create the booking request
    const booking = await prisma.bookingRequest.create({
      data: {
        requesterId: requester.id,
        targetId: data.targetId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || null,
        details: data.details, // Prisma handles JSON conversion automatically
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
