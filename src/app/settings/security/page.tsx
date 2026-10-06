import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SecurityForm } from "@/components/settings/SecurityForm";

export const metadata = {
  title: "Keamanan Akun | Pengaturan RAMU",
  description: "Kelola email akun, kata sandi, dan sesi perangkat Anda di RAMU.",
};

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SecurityForm email={user.email || ""} />;
}
