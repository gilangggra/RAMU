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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings2 className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
            Engine Configuration
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">Blueprint Peran Kru</h1>
        <p className="text-sm text-stone-500 mt-1">
          Standarisasi keahlian, alat kerja, dan rekomendasi acuan tarif pasaran per peran profesi kreatif.
        </p>
      </div>

      <RoleBlueprintManagerClient initialBlueprints={blueprints} />
    </div>
  );
}
