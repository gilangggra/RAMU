import React from "react";
import { GlassServiceBookingFlow } from "@/components/bookings/GlassServiceBookingFlow";

export const metadata = {
  title: "Glassmorphism UI Demo | RAMU Design System",
  description: "Implementasi desain UI Glassmorphism dengan Mesh Gradient, kartu transparan, dan state aktif.",
};

export default function GlassDemoPage() {
  return (
    <div className="min-h-screen app-background p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center">
      <GlassServiceBookingFlow />
    </div>
  );
}
