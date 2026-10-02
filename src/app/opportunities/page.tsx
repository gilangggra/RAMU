import { redirect } from "next/navigation";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ feasibility?: string; scope?: string; actorId?: string }>;
}) {
  const params = await searchParams;
  const feasibility = params?.feasibility;
  const scope = params?.scope;
  const query = new URLSearchParams();
  query.set("tab", "ai-opportunities");
  if (feasibility && feasibility !== "ALL") query.set("feasibility", feasibility);
  if (scope) query.set("scope", scope);
  redirect(`/projects?${query.toString()}`);
}
