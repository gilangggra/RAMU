import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefById } from "@/application/projectBriefService";
import { InterestCard } from "@/components/projects/InterestCard";
import { FormCollaborationButton } from "@/components/projects/FormCollaborationButton";
import { AppShell } from "@/components/layout/AppShell";
import { Clock, Search, Check, CheckCircle2, ArrowLeft } from "lucide-react";

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

  const allInterests = brief.neededRoles.flatMap((r) =>
    r.interests.map((i) => ({ ...i, roleLabel: r.roleLabel, isRoleFilled: r.isFilled }))
  );
  const pendingCount = allInterests.filter((i) => i.status === "PENDING").length;
  const acceptedCount = allInterests.filter((i) => i.status === "ACCEPTED").length;

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/projects" className="hover:text-stone-900 font-semibold transition-colors">
              Papan Proyek
            </Link>
            <span>/</span>
            <Link href={`/projects/${brief.id}`} className="hover:text-stone-900 font-semibold transition-colors truncate max-w-xs">
              {brief.title}
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-bold">Kelola Peminat</span>
          </div>

          <Link
            href={`/projects/${brief.id}`}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Detail Brief</span>
          </Link>
        </div>

        <div className="p-8 rounded-[32px] bg-white border border-stone-200/90 shadow-2xs space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                Kurasi Kolaborator
              </span>
              <span className="text-xs text-stone-500">
                Proyek: <strong className="text-stone-900">{brief.title}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Tinjau &amp; Pilih Rekan Kolaborasi
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              Tinjau aset dan pesan yang ditawarkan oleh para calon kolaborator. Saat Anda menerima seorang kolaborator untuk suatu peran, slot tersebut otomatis terisi dan siap dieksekusi.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <p className="text-[11px] font-bold uppercase text-stone-400">Peran Dibutuhkan</p>
              <p className="text-2xl font-black text-stone-900 mt-1">{totalRoles}</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <p className="text-[11px] font-bold uppercase text-stone-400">Slot Terisi</p>
              <p className="text-2xl font-black text-amber-800 mt-1">
                {filledRoles} <span className="text-xs font-normal text-stone-400">/ {totalRoles}</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <p className="text-[11px] font-bold uppercase text-stone-400">Menunggu Review</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <p className="text-[11px] font-bold uppercase text-stone-400">Kolaborator Terpilih</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">{acceptedCount}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                {allFilled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Seluruh peran telah terisi!</span>
                  </>
                ) : (
                  <span>Progres Tim: {filledRoles} dari {totalRoles} peran terisi</span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {allFilled
                  ? "Bentuk ruang kolaborasi sekarang untuk mengaktifkan workspace tugas dan milestone bersama."
                  : acceptedCount > 0
                  ? `Anda sudah dapat mengaktifkan ruang kolaborasi sekarang dengan ${acceptedCount} kolaborator yang diterima, atau menunggu peran lainnya.`
                  : "Setelah kolaborator diterima, Anda dapat mengaktifkan ruang kolaborasi resmi bersama seluruh tim."}
              </p>
            </div>

            <FormCollaborationButton
              briefId={brief.id}
              isFilled={allFilled}
              acceptedCount={acceptedCount}
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
                className="p-6 sm:p-8 rounded-[28px] bg-white border border-stone-200/90 shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-stone-900">{role.roleLabel}</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                          {role.assetCategory}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-xs text-stone-500 mt-0.5">{role.description}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    {role.isFilled ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Terisi oleh {acceptedInterest?.actor.name || "Kolaborator"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Mencari ({roleInterests.length} peminat)</span>
                      </span>
                    )}
                  </div>
                </div>

                {roleInterests.length === 0 ? (
                  <div className="py-8 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200">
                    <div className="flex justify-center mb-2">
                      <Search className="w-7 h-7 text-stone-400" />
                    </div>
                    <p className="text-xs font-bold text-stone-900">
                      Belum ada peminat untuk peran {role.roleLabel}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto">
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
                        isInvited={Boolean(interest.isInvited)}
                        actor={{
                          id: interest.actor.id,
                          name: interest.actor.name,
                          sector: interest.actor.sector,
                          location: interest.actor.location,
                          avatarUrl: interest.actor.owner?.avatarUrl || null,
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
      </div>
    </AppShell>
  );
}
