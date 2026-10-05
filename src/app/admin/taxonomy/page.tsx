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
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Engine Configuration • Taxonomy &amp; Aesthetics
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
          Manajemen Taksonomi Sektor &amp; Estetika
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
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
