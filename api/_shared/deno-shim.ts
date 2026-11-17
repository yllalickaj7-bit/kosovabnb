// Ofron Deno.env.get mbi process.env (Vercel) dhe emra alternativë për çelësat e Supabase.
const alias: Record<string, string[]> = {
  SUPABASE_URL: ["VITE_SUPABASE_URL"],
  SUPABASE_ANON_KEY: ["VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_ANON_KEY"],
  SITE_URL: ["VERCEL_PROJECT_PRODUCTION_URL"],
};
(globalThis as any).Deno = {
  env: {
    get(k: string): string | undefined {
      for (const n of [k, ...(alias[k] ?? [])]) {
        const v = process.env[n];
        if (v) return k === "SITE_URL" && !v.startsWith("http") ? "https://" + v : v;
      }
      return undefined;
    },
  },
};
export {};
