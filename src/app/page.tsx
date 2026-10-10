import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionServices } from "@/components/landing/SolutionServices";
import { PortfolioProof } from "@/components/landing/PortfolioProof";
import { CollaborationStories } from "@/components/landing/CollaborationStories";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#27213D] selection:bg-[#4CC9FE]/30 selection:text-[#27213D] font-sans antialiased overflow-x-hidden">
      {/* 1. HEADLINE: Logo, Tagline, & Sticky Header */}
      <Navbar />

      <main>
        {/* Step 1: Hero (Headline, Value Proposition, Primary & Circular CTAs) */}
        <Hero />

        {/* Step 2: Problem (Clientele Pain Points, High Costs, Idle Inefficiencies) */}
        <ProblemSection />

        {/* Step 3: Solution / Services (Core 4 Services, Deterministic Engine, Workflow) */}
        <SolutionServices />

        {/* Step 4: Proof / Portfolio (Completed Collaborations, Deliverables, Metrics) */}
        <PortfolioProof />

        {/* Step 5: Proof / Testimonials (Quotes, Savings, Verified Reviews) */}
        <CollaborationStories />

        {/* Step 6: FAQ (Sales, Legal, SPK, Matching Answers) */}
        <LandingFAQ />

        {/* Step 7: Call To Action (High-Conversion Action Trigger) */}
        <FinalCTA />
      </main>

      {/* Step 9: Footer (Relevant Content Links & Credentials) */}
      <Footer />
    </div>
  );
}
