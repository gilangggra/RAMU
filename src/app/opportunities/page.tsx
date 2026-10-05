import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ feasibility?: string; scope?: string; actorId?: string }>;
}) {
  await searchParams;
  redirect("/collaborate");
}
