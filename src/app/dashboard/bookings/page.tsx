import { redirect } from "next/navigation";

interface BookingManagementPageProps {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function BookingManagementPage({ searchParams }: BookingManagementPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  query.set("section", "contracts");

  if (params?.tab) query.set("tab", params.tab);
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  redirect(`/collaborations?${query.toString()}`);
}
