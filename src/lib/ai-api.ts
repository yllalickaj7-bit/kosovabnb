import { supabase } from "@/integrations/supabase/client";

/**
 * Thërret funksionin AI (chat, trip-planner, price-recommend).
 * Së pari te /api/<emri> (Vercel); nëse nuk ekziston aty (p.sh. në zhvillim lokal),
 * bie te Supabase Edge Function me të njëjtin emër.
 * Kthen formën { data, error } si supabase.functions.invoke; error.context është Response.
 */
export async function callFn(name: string, opts: { body: unknown }) {
  try {
    const { data: s } = await supabase.auth.getSession();
    const token = s.session?.access_token ?? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);
    const res = await fetch(`/api/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(opts.body),
    });
    const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
    if (res.status !== 404 && isJson) {
      if (res.ok) return { data: await res.json(), error: null as null };
      return { data: null, error: Object.assign(new Error(`HTTP ${res.status}`), { context: res }) };
    }
  } catch { /* rrjeti: provo rrugën tjetër */ }
  return supabase.functions.invoke(name, opts as { body: Record<string, unknown> });
}
