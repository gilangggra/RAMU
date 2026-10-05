import { redirect } from "next/navigation";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.tab) query.set("tab", params.tab);
  if (params?.error) query.set("error", params.error);
  if (params?.success) query.set("success", params.success);

  const qs = query.toString();
  redirect(`/readiness${qs ? `?${qs}` : ""}`);
}
