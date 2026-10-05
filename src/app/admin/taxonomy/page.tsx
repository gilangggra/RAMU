import { prisma } from "@/infrastructure/database/prisma";
import { BookOpen } from "lucide-react";
import { TaxonomyManagerClient } from "./TaxonomyManagerClient";

export default async function AdminTaxonomyPage() {
  const [sectors, aesthetics] = await Promise.all([
    prisma.taxonomySector.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.aestheticTag.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
            Engine Configuration
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">
          Manajemen Taksonomi Sektor &amp; Estetika
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Kelola kamus sektor industri kreatif dan tag gaya estetika resmi yang tersimpan langsung di database.
        </p>
      </div>

      {/* Dynamic Taxonomy Manager Component */}
      <TaxonomyManagerClient
        initialSectors={sectors as any}
        initialAesthetics={aesthetics as any}
      />
    </div>
  );
}
