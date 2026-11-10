// KosovaBNB – funksioni `price-recommend` në një skedar të vetëm (për ngjitje te Supabase Dashboard → Edge Functions → Via Editor).
// Gjeneruar nga supabase/functions/price-recommend/ + _shared/. Mos e ndrysho me dorë.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// deno-lint-ignore no-explicit-any
type Json = any;
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Adapter i vetëm për modelet e gjuhës: Claude (Anthropic) ose OpenAI. Zgjedhja:
//   LLM_PROVIDER=anthropic|openai  (opsional), përndryshe: ANTHROPIC_API_KEY → anthropic, përndryshe OPENAI_API_KEY → openai.
// Modelet: ANTHROPIC_MODEL (parazgjedhje claude-haiku-5-5), OPENAI_MODEL (parazgjedhje gpt-4o-mini).
// Brenda funksioneve biseda mbahet në formatin e blloqeve të Anthropic (text/tool_use/tool_result); për OpenAI përkthehet këtu.

export const llmProvider = (): "anthropic" | "openai" | null => {
  const pref = Deno.env.get("LLM_PROVIDER");
  const a = !!Deno.env.get("ANTHROPIC_API_KEY"), o = !!Deno.env.get("OPENAI_API_KEY");
  if (pref === "openai" && o) return "openai";
  if (pref === "anthropic" && a) return "anthropic";
  if (a) return "anthropic";
  if (o) return "openai";
  return null;
};

export const llmMissingMessage = "Mungon çelësi i AI: vendos ANTHROPIC_API_KEY ose OPENAI_API_KEY te Supabase Secrets.";

export interface LlmResult { ok: boolean; status: number; error?: string; content: Json[]; stop_reason: string }

const toOpenAiMessages = (system: string, messages: Json[]): Json[] => {
  const out: Json[] = [{ role: "system", content: system }];
  for (const m of messages) {
    if (typeof m.content === "string") { out.push({ role: m.role, content: m.content }); continue; }
    if (m.role === "assistant") {
      const text = m.content.filter((b: Json) => b.type === "text").map((b: Json) => b.text).join("\n");
      const calls = m.content.filter((b: Json) => b.type === "tool_use").map((b: Json) => ({
        id: b.id, type: "function", function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) },
      }));
      out.push({ role: "assistant", content: text || null, ...(calls.length ? { tool_calls: calls } : {}) });
    } else {
      for (const b of m.content) {
        if (b.type === "tool_result") out.push({ role: "tool", tool_call_id: b.tool_use_id, content: String(b.content) });
        else if (b.type === "text") out.push({ role: "user", content: b.text });
      }
    }
  }
  return out;
};

export const callLlm = async (opts: { system: string; messages: Json[]; tools?: Json[]; maxTokens?: number }): Promise<LlmResult> => {
  const provider = llmProvider();
  if (!provider) return { ok: false, status: 503, error: llmMissingMessage, content: [], stop_reason: "error" };
  const maxTokens = opts.maxTokens ?? 1024;

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-5-5", max_tokens: maxTokens, system: opts.system, tools: opts.tools, messages: opts.messages }),
    });
    if (!res.ok) return { ok: false, status: res.status, error: await res.text(), content: [], stop_reason: "error" };
    const d = await res.json();
    return { ok: true, status: 200, content: d.content ?? [], stop_reason: d.stop_reason };
  }

  const body: Json = { model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini", max_tokens: maxTokens, messages: toOpenAiMessages(opts.system, opts.messages) };
  if (opts.tools?.length) body.tools = opts.tools.map((t: Json) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } }));
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, status: res.status, error: await res.text(), content: [], stop_reason: "error" };
  const d = await res.json();
  const msg = d.choices?.[0]?.message ?? {};
  const content: Json[] = [];
  if (msg.content) content.push({ type: "text", text: msg.content });
  for (const c of msg.tool_calls ?? []) {
    let input: Json = {};
    try { input = JSON.parse(c.function.arguments || "{}"); } catch { input = {}; }
    content.push({ type: "tool_use", id: c.id, name: c.function.name, input });
  }
  return { ok: true, status: 200, content, stop_reason: (msg.tool_calls?.length ?? 0) > 0 ? "tool_use" : "end_turn" };
};

// Gjeneron rekomandimet e çmimit (SQL: statistikë + rregulla) dhe, nëse ka çelës, i rishkruan shpjegimet me Claude.
// Numrat NUK i ndryshon AI-ja: vetëm teksti i shpjegimit. Sekretet: ANTHROPIC_API_KEY (opsional), ANTHROPIC_MODEL (opsional).


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
  const apiKey = llmProvider();
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
        const res = await callLlm({
          maxTokens: 4000,
          system:
            "Je analist çmimesh për hotele në Kosovë. Për çdo rekomandim shkruaj NJË fjali shqip (maks. 160 karaktere) që shpjegon pse çmimi sugjerohet më i lartë ose më i ulët, " +
            "duke përdorur VETËM faktorët e dhënë (occupancy = zëna në dritaren 14-ditore, lead_days = ditë deri në qëndrim, demand_multiplier). Mos ndrysho numrat dhe mos shpik faktorë. " +
            'Kthe vetëm JSON: [{"id":"...","explanation":"..."}].',
          messages: [{ role: "user", content: JSON.stringify(recs) }],
        });
        if (res.ok) {
          const text: string = res.content.find((b: { type: string }) => b.type === "text")?.text ?? "[]";
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
          console.error("LLM error", res.status, res.error);
        }
      } catch (e) {
        console.error("Explain failed", (e as Error).message); // shpjegimi standard mbetet
      }
    }
  }

  return json({ generated, explained });
});
