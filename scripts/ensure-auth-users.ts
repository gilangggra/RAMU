import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnon);

const ACCOUNTS = [
  { email: "bernadya@gmail.com", password: "password123", name: "bernadya" },
  { email: "brand@ramu.id", password: "password123", name: "Nala The Label" },
  { email: "designer@ramu.id", password: "password123", name: "Atelier Nara" },
  { email: "photographer@ramu.id", password: "password123", name: "Lensa Kreatif Studio" },
  { email: "model@ramu.id", password: "password123", name: "Go Young Jung" },
  { email: "mua@ramu.id", password: "password123", name: "Glow & Form Artistry" },
  { email: "studio@ramu.id", password: "password123", name: "Studio Imaji & Co." },
];

async function main() {
  console.log("Checking / Creating Supabase Auth users...");

  for (const acc of ACCOUNTS) {
    // Try sign in first
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (signInData?.user) {
      console.log(`✓ ${acc.email} can sign in! ID: ${signInData.user.id}`);
      await supabase.auth.signOut();
      continue;
    }

    console.log(`- ${acc.email} cannot sign in: ${signInErr?.message}. Attempting signup...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
      options: {
        data: {
          display_name: acc.name,
        },
      },
    });

    if (signUpErr) {
      console.error(`  Failed to sign up ${acc.email}:`, signUpErr.message);
    } else {
      console.log(`  Signed up ${acc.email}: ID ${signUpData.user?.id}`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
