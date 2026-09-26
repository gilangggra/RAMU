import { redirect } from "next/navigation";

export default async function ConstraintsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  q.set("tab", "constraints");
  if (sp.error) q.set("error", sp.error);
  if (sp.success) q.set("success", sp.success);
  redirect(`/readiness?${q.toString()}`);
}
