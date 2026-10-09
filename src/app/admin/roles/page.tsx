import { Settings2 } from "lucide-react";
import { prisma } from "@/infrastructure/database/prisma";
import RoleBlueprintManagerClient from "./RoleBlueprintManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const blueprints = await prisma.roleBlueprint.findMany({
    orderBy: { roleName: "asc" },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Engine Configuration • Crew Role Blueprints
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">Blueprint Peran Kru</h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
          Standarisasi keahlian, alat kerja, dan rekomendasi acuan tarif pasaran per peran profesi kreatif.
        </p>
      </div>

      <RoleBlueprintManagerClient initialBlueprints={blueprints} />
    </div>
  );
}
