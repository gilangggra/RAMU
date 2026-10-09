import { redirect } from "next/navigation";

export const metadata = {
  title: "Rekomendasi Mitra Kolaborasi | RAMU",
  description:
    "Temukan rekan kolaborasi kreatif yang selaras dengan kapasitas dan kebutuhan proyek Anda.",
};

export default async function CollaboratePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams();
  query.set("tab", "matched");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key !== "tab" && typeof value === "string") {
        query.set(key, value);
      }
    }
  }

  redirect(`/directory?${query.toString()}`);
}
