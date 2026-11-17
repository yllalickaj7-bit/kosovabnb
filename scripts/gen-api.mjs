// Gjeneron api/*.ts (Vercel Functions) nga supabase/functions/* që AI të punojë pa Supabase Edge Functions.
// Ekzekuto: node scripts/gen-api.mjs
import fs from "node:fs";
const src = "supabase/functions";
fs.mkdirSync("api/_shared", { recursive: true });
fs.writeFileSync("api/_shared/deno-shim.ts", `// Ofron Deno.env.get mbi process.env (Vercel) dhe emra alternativë për çelësat e Supabase.
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
`);
for (const f of ["cors", "llm"]) fs.writeFileSync(`api/_shared/${f}.ts`, fs.readFileSync(`${src}/_shared/${f}.ts`, "utf8"));
for (const fn of ["chat", "trip-planner", "price-recommend"]) {
  let s = fs.readFileSync(`${src}/${fn}/index.ts`, "utf8");
  s = s.replace('"https://esm.sh/@supabase/supabase-js@2"', '"@supabase/supabase-js"')
       .replace(/"\.\.\/_shared\/(\w+)\.ts"/g, '"./_shared/$1"')
       .replace("Deno.serve(async (req) => {", "const handler = async (req: Request) => {")
       .replace(/^(\/\/.*\n)?/, "");
  // pas shtrirjes së handler-it shtohet eksporti
  s = `import "./_shared/deno-shim";\ndeclare const Deno: any;\n// GJENERUAR nga supabase/functions/${fn}/index.ts me scripts/gen-api.mjs: mos e ndrysho direkt.\n` + s.replace(/\n\}\);\s*$/, "\n};\n") + `\nexport default { fetch: handler };\n`;
  fs.writeFileSync(`api/${fn}.ts`, s);
}
console.log("ok");
