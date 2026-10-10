import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SecurityForm } from "@/components/settings/SecurityForm";

export const metadata = {
  title: "Keamanan Akun | Pengaturan Admin RAMU",
  description: "Kelola email akun, kata sandi, dan sesi perangkat administrator RAMU.",
};

// Memakai ulang SecurityForm & updatePasswordAction (supabase.auth.updateUser) dari role umum.
export default async function AdminSecuritySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SecurityForm email={user.email || ""} />;
}
