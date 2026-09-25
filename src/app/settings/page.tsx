import { redirect } from "next/navigation";

export default function SettingsIndexPage() {
  // Redirect automatically to the first tab (Profile)
  redirect("/settings/profile");
}
