import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefById } from "@/application/projectBriefService";
import { InterestCard } from "@/components/projects/InterestCard";
import { FormCollaborationButton } from "@/components/projects/FormCollaborationButton";
import { AppShell } from "@/components/layout/AppShell";
import { Clock, Search, Check, CheckCircle2 } from "lucide-react";

export default async function ProjectInterestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const { id } = await params;
  const brief = await getProjectBriefById(id);

  if (!brief) {
    notFound();
  }

  if (brief.creatorActorId !== actor.id) {
    redirect(`/projects/${id}`);
  }

  const totalRoles = brief.neededRoles.length;
  const filledRoles = brief.neededRoles.filter((r) => r.isFilled).length;
  const allFilled = totalRoles > 0 && filledRoles === totalRoles;

  // Flatten & count interests
  const allInterests = brief.neededRoles.flatMap((r) =>
    r.interests.map((i) => ({ ...i, roleLabel: r.roleLabel, isRoleFilled: r.isFilled }))
  );
  const pendingCount = allInterests.filter((i) => i.status === "PENDING").length;
  const acceptedCount = allInterests.filter((i) => i.status === "ACCEPTED").length;

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/projects" className="hover:text-neutral-200 transition-colors">
            Proyek
          </Link>
          <span>/</span>
          <Link href={`/projects/${brief.id}`} className="hover:text-neutral-200 transition-colors truncate max-w-xs">
            {brief.title}
          </Link>
          <span>/</span>
          <span className="text-neutral-200 font-semibold">Kelola Peminat</span>
        </div>

        <Link
          href={`/projects/${brief.id}`}
          className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
        >
          ← Kembali ke Detail Brief
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-950 text-primary-300 border border-primary-700/50">
              Kurasi Kolaborator
            </span>
            <span className="text-xs text-neutral-400">
              Proyek: <strong className="text-neutral-200">{brief.title}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
            Tinjau & Pilih Rekan Kolaborasi
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl">
            Tinjau aset dan pesan yang ditawarkan oleh para calon kolaborator. Saat Anda menerima seorang kolaborator untuk suatu peran, slot tersebut otomatis terisi dan siap dieksekusi.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <p className="text-[11px] font-medium text-neutral-400">Peran Dibutuhkan</p>
            <p className="text-xl font-black text-neutral-100 mt-1">{totalRoles}</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <p className="text-[11px] font-medium text-neutral-400">Slot Terisi</p>
            <p className="text-xl font-black text-primary-400 mt-1">
              {filledRoles} <span className="text-xs font-normal text-neutral-500">/ {totalRoles}</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <p className="text-[11px] font-medium text-neutral-400">Menunggu Review</p>
            <p className="text-xl font-black text-amber-300 mt-1">{pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <p className="text-[11px] font-medium text-neutral-400">Kolaborator Terpilih</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{acceptedCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-primary-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              {allFilled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seluruh peran telah terisi!</span>
                </>
              ) : (
                <span>Progres Pembentukan Tim: {filledRoles} dari {totalRoles} peran terisi</span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {allFilled
                ? "Bentuk ruang kolaborasi sekarang untuk mengaktifkan workspace tugas dan milestone bersama."
                : "Setelah seluruh peran diterima, Anda dapat mengaktifkan ruang kolaborasi resmi bersama seluruh tim."}
            </p>
          </div>

          <FormCollaborationButton
            briefId={brief.id}
            isFilled={allFilled}
            collaborationId={brief.collaboration?.id}
          />
        </div>
      </div>

      <div className="space-y-6">
        {brief.neededRoles.map((role, idx) => {
          const roleInterests = role.interests;
          const acceptedInterest = roleInterests.find((i) => i.status === "ACCEPTED");

          return (
            <section
              key={role.id}
              className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-primary-950 border border-primary-700/50 text-primary-300 font-black text-xs flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-neutral-100">{role.roleLabel}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {role.assetCategory}
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">{role.description}</p>
                    )}
                  </div>
                </div>

                <div>
                  {role.isFilled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-950 text-primary-300 border border-primary-700/50">
                      <Check className="w-3.5 h-3.5 text-primary-300" />
                      <span>Terisi oleh {acceptedInterest?.actor.name || "Kolaborator"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-600/30">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>Mencari ({roleInterests.length} peminat)</span>
                    </span>
                  )}
                </div>
              </div>

              {roleInterests.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-neutral-950 border border-dashed border-neutral-800">
                  <div className="flex justify-center mb-2">
                    <Search className="w-7 h-7 text-neutral-500" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-300">
                    Belum ada peminat untuk peran {role.roleLabel}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
                    Brief Anda sedang aktif di galeri publik. Kolaborator dengan profil yang cocok akan segera mengajukan asetnya.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleInterests.map((interest) => (
                    <InterestCard
                      key={interest.id}
                      interestId={interest.id}
                      briefId={brief.id}
                      roleLabel={role.roleLabel}
                      status={interest.status}
                      message={interest.message}
                      actor={{
                        id: interest.actor.id,
                        name: interest.actor.name,
                        sector: interest.actor.sector,
                        location: interest.actor.location,
                        description: interest.actor.description,
                        assets: interest.actor.assets || [],
                      }}
                      proposedAssets={(interest.proposedAssets as string[]) || []}
                      isInitiator={true}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
