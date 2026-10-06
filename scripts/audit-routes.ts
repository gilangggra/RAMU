/**
 * Authenticated route audit.
 * Usage: npx tsx scripts/audit-routes.ts [email] [password]
 * Logs in via @supabase/ssr (same cookie format as the app), then crawls
 * every page route and reports HTTP status + error markers in the HTML.
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

const BASE = "http://localhost:3000";
const email = process.argv[2] || "brand@ramu.id";
const password = process.argv[3] || "password123";

const STATIC_ROUTES = [
  "/", "/dashboard", "/dashboard/bookings", "/dashboard/showcase", "/directory",
  "/collaborate", "/collaborations", "/projects", "/projects/new", "/opportunities",
  "/messages", "/assets", "/goals", "/needs", "/constraints", "/readiness",
  "/resources", "/engine-insights", "/showcase", "/onboarding", "/settings",
  "/settings/profile", "/settings/rates", "/settings/specs", "/settings/preferences",
  "/settings/payout", "/settings/availability", "/settings/legal",
  "/settings/notifications", "/settings/security",
];

const ERROR_MARKERS = [
  "Unhandled Runtime Error", "Internal Server Error", "Application error",
  "PrismaClient", "TypeError:", "ReferenceError:", "Cannot read properties",
  "is not a function", "NaN", "Invalid Date", "[object Object]", ">undefined<",
  '\\"digest\\":', "NEXT_NOT_FOUND",
];

async function main() {
  const jar = new Map<string, string>();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (list) => list.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))),
      },
    }
  );
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Login failed: " + error.message);
  const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  console.log(`Logged in as ${email} (${jar.size} cookie chunks)\n`);

  const discovered = new Set<string>();
  const results: string[] = [];

  async function check(route: string) {
    const t = Date.now();
    try {
      const res = await fetch(BASE + route, { headers: { cookie }, redirect: "manual" });
      const html = res.status < 300 ? await res.text() : "";
      const loc = res.headers.get("location");
      const markers = ERROR_MARKERS.filter((m) => html.includes(m));
      // Next dev renders errors into a __next_error__ root
      if (html.includes('id="__next_error__"')) markers.unshift("__next_error__");
      // discover dynamic links
      for (const m of html.matchAll(/href="(\/(?:directory|projects|collaborations|opportunities|dashboard\/bookings)\/[a-zA-Z0-9\-_]+(?:\/interests)?)"/g)) {
        if (!m[1].endsWith("/new")) discovered.add(m[1]);
      }
      const line = `${String(res.status).padEnd(4)} ${route.padEnd(48)} ${(Date.now() - t + "ms").padStart(7)} ${loc ? "-> " + loc : ""} ${markers.length ? "!! " + markers.join(", ") : ""}`;
      results.push(line);
      console.log(line);
      if (markers.length && res.status >= 500) {
        const msg = html.match(/"message":"([^"]{0,300})/)?.[1] || html.match(/<title>([^<]*)/)?.[1];
        if (msg) console.log("      message:", msg);
      }
    } catch (e) {
      console.log(`ERR  ${route}  ${(e as Error).message}`);
    }
  }

  for (const r of STATIC_ROUTES) await check(r);
  console.log("\n--- Dynamic routes discovered ---");
  const perPrefix = new Map<string, number>();
  for (const r of discovered) {
    const prefix = r.split("/").slice(0, r.startsWith("/dashboard") ? 3 : 2).join("/") + (r.endsWith("/interests") ? "/interests" : "");
    const n = perPrefix.get(prefix) || 0;
    if (n >= 3) continue;
    perPrefix.set(prefix, n + 1);
    await check(r);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
