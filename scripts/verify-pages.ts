import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testPages() {
  console.log("=== VERIFYING RAMU PAGES ===");

  // 1. Landing Page
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  console.log(`1. Landing Page [/]: HTTP ${homeRes.status}`);
  console.log(`   - Headline check: ${homeHtml.includes("Ubah apa yang Anda miliki")}`);
  console.log(`   - Deterministic Engine check: ${homeHtml.includes("Deterministic")}`);
  console.log(`   - Resource Idle check: ${homeHtml.includes("idle") || homeHtml.includes("Idle")}`);

  // 2. Login Page
  const loginRes = await fetch("http://localhost:3000/login");
  const loginHtml = await loginRes.text();
  console.log(`\n2. Login Page [/login]: HTTP ${loginRes.status}`);
  console.log(`   - Brand account button check: ${loginHtml.includes("Nala The Label")}`);
  console.log(`   - Studio account button check: ${loginHtml.includes("Studio Imaji")}`);
  console.log(`   - Admin account button check: ${loginHtml.includes("bernadya (Admin)")}`);

  // 3. Supabase Auth Sign In for Brand
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: "brand@ramu.id",
    password: "password123",
  });

  if (authErr || !authData.session) {
    console.error("Auth failed:", authErr?.message);
    return;
  }
  console.log(`\n3. Supabase Auth: brand@ramu.id successfully authenticated!`);
  console.log(`   Access Token: ${authData.session.access_token.slice(0, 20)}...`);

  // Build cookies for Next.js SSR requests
  // Next.js Supabase auth helpers look for sb-auth-token or sb-[ref]-auth-token
  const projectRef = "dxvcklytzeekydhoialh";
  const sessionStr = JSON.stringify(authData.session);
  const base64Session = Buffer.from(sessionStr).toString("base64");
  const cookieHeader = `sb-${projectRef}-auth-token=${encodeURIComponent(base64Session)}; sb-access-token=${authData.session.access_token}; sb-refresh-token=${authData.session.refresh_token}`;

  // 4. Test Showcase Page
  const showcaseRes = await fetch("http://localhost:3000/showcase");
  console.log(`\n4. Showcase Page [/showcase]: HTTP ${showcaseRes.status}`);

  // 5. Test Directory Page
  const dirRes = await fetch("http://localhost:3000/directory");
  console.log(`5. Directory Page [/directory]: HTTP ${dirRes.status}`);

  console.log("\n=== ALL PAGE CHECKS COMPLETE ===");
}

testPages().catch(console.error);
