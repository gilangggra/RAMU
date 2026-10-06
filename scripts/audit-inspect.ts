/**
 * Inspect HTML context around a needle on an authenticated page.
 * Usage: npx tsx scripts/audit-inspect.ts <route> <needle> [email]
 */
import { createServerClient } from "@supabase/ssr";
import fs from "fs";

for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function main() {
  const [route, needle, email = "brand@ramu.id"] = process.argv.slice(2);
  const jar = new Map<string, string>();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (l) => l.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))),
    },
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password: "password123" });
  if (error) throw error;
  const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  const html = await (await fetch("http://localhost:3000" + route, { headers: { cookie } })).text();
  let i = html.indexOf(needle), n = 0;
  while (i !== -1 && n < 5) {
    // strip tags for readability
    const ctx = html.slice(Math.max(0, i - 700), i + 200).replace(/<[^>]+>/g, " | ").replace(/\s+/g, " ");
    console.log(`--- match ${++n} @${i} ---\n${ctx}\n`);
    i = html.indexOf(needle, i + 1);
  }
  if (!n) console.log("no match");
}
main().catch((e) => { console.error(e); process.exit(1); });
