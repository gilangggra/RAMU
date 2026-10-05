import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { BookingsClientView } from "./BookingsClientView";

export const metadata = {
  title: "Manajemen Pesanan & SPK | RAMU",
  description: "Kelola pesanan masuk, permintaan sewa terkirim, dan kepastian kontrak kerja resmi platform RAMU.",
};

export default async function BookingManagementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      actors: {
        where: { status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const primaryActor = profile?.actors?.[0];

  if (!primaryActor) {
    redirect("/onboarding");
  }

  const incomingBookings = await prisma.bookingRequest.findMany({
    where: { targetId: primaryActor.id },
    include: { requester: true, target: true },
    orderBy: { createdAt: "desc" },
  });

  const outgoingBookings = await prisma.bookingRequest.findMany({
    where: { requesterId: primaryActor.id },
    include: { requester: true, target: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell actor={{ ...primaryActor, avatarUrl: profile.avatarUrl }} activeRoute="/dashboard/bookings">
      <BookingsClientView
        primaryActor={primaryActor}
        incomingBookings={incomingBookings}
        outgoingBookings={outgoingBookings}
      />
    </AppShell>
  );
}
