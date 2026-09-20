import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { OpportunityShowcase } from "@/components/landing/OpportunityShowcase";
import { Differentiator } from "@/components/landing/Differentiator";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#27213D] selection:bg-[#FFD45A]/40 selection:text-[#27213D] font-sans antialiased overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />

        <HowItWorks />

        <OpportunityShowcase />

        <Differentiator />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
