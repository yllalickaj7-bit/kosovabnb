// Gjeneron rekomandimet e çmimit (SQL: statistikë + rregulla) dhe, nëse ka çelës, i rishkruan shpjegimet me Claude.
// Numrat NUK i ndryshon AI-ja: vetëm teksti i shpjegimit. Sekretet: ANTHROPIC_API_KEY (opsional), ANTHROPIC_MODEL (opsional).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, UUID_RE } from "../_shared/cors.ts";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-5-5";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metodë e palejuar" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return json({ error: "Duhet të kyçeni" }, 401);

  let listingId: unknown;
  try { listingId = (await req.json()).listing_id; } catch { return json({ error: "JSON i pavlefshëm" }, 400); }
  if (typeof listingId !== "string" || !UUID_RE.test(listingId)) return json({ error: "listing_id i pavlefshëm" }, 400);

  // Leja kontrollohet në SQL (pronari ose admin)
  const { data: generated, error } = await supabase.rpc("generate_price_recommendations", { _listing_id: listingId, _days: 30 });
  if (error) return json({ error: error.message }, 403);

  let explained = 0;
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (apiKey && (generated ?? 0) > 0) {
    const { data: rooms } = await supabase.from("rooms").select("id").eq("listing_id", listingId);
    const { data: recs } = await supabase
      .from("price_recommendations")
      .select("id,stay_date,current_price,recommended_price,factors")
      .in("room_id", (rooms ?? []).map((r) => r.id))
      .eq("status", "suggested")
      .order("stay_date")
      .limit(40);

    if (recs && recs.length > 0) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 4000,
            system:
              "Je analist çmimesh për hotele në Kosovë. Për çdo rekomandim shkruaj NJË fjali shqip (maks. 160 karaktere) që shpjegon pse çmimi sugjerohet më i lartë ose më i ulët, " +
              "duke përdorur VETËM faktorët e dhënë (occupancy = zëna në dritaren 14-ditore, lead_days = ditë deri në qëndrim, demand_multiplier). Mos ndrysho numrat dhe mos shpik faktorë. " +
              'Kthe vetëm JSON: [{"id":"...","explanation":"..."}].',
            messages: [{ role: "user", content: JSON.stringify(recs) }],
          }),
        });
        if (res.ok) {
          const out = await res.json();
          const text: string = out.content?.find((b: { type: string }) => b.type === "text")?.text ?? "[]";
          const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
          const valid = new Set(recs.map((r) => r.id));
          for (const item of Array.isArray(parsed) ? parsed : []) {
            if (valid.has(item?.id) && typeof item.explanation === "string") {
              const { error: ue } = await supabase.from("price_recommendations")
                .update({ explanation: item.explanation.slice(0, 300) }).eq("id", item.id);
              if (!ue) explained++;
            }
          }
        } else {
          console.error("Anthropic error", res.status, await res.text());
        }
      } catch (e) {
        console.error("Explain failed", (e as Error).message); // shpjegimi standard mbetet
      }
    }
  }

  return json({ generated, explained });
});
