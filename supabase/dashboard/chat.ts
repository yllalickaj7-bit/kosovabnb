// KosovaBNB – funksioni `chat` në një skedar të vetëm (për ngjitje te Supabase Dashboard → Edge Functions → Via Editor).
// Gjeneruar nga supabase/functions/chat/ + _shared/. Mos e ndrysho me dorë.
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

// Chatbot AI për KosovaBNB: Claude me thirrje funksionesh mbi të dhënat reale (disponueshmëri, çmim, rezervim).
// Sekretet (Supabase → Edge Functions → Secrets): ANTHROPIC_API_KEY (i detyrueshëm), ANTHROPIC_MODEL (opsional), SITE_URL (opsional).

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://kosovabnb.lovable.app";
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
const MAX_TOOL_ROUNDS = 5;

const TOOLS = [
  {
    name: "search_listings",
    description: "Kërko prona sipas qytetit/vendndodhjes, llojit, çmimit maksimal për natë dhe numrit të mysafirëve. Kthen deri në 8 prona.",
    input_schema: {
      type: "object",
      properties: {
        location: { type: "string", description: "Qyteti ose zona, p.sh. Prizren" },
        type: { type: "string", enum: ["Apartamente", "Hotele", "Motele", "Vila", "Kamping", "Dizajn"] },
        max_price: { type: "number", description: "Çmimi maksimal për natë në euro" },
        guests: { type: "integer", description: "Numri minimal i mysafirëve që duhet të strehojë" },
      },
    },
  },
  {
    name: "check_availability",
    description: "Kontrollo dhomat e lira dhe çmimin total për një pronë në një periudhë. Datat në formatin YYYY-MM-DD; check_out është dita e nisjes.",
    input_schema: {
      type: "object",
      properties: {
        listing_id: { type: "string" },
        check_in: { type: "string" },
        check_out: { type: "string" },
        guests: { type: "integer" },
      },
      required: ["listing_id", "check_in", "check_out", "guests"],
    },
  },
  {
    name: "create_booking",
    description:
      "Krijo rezervim (në pritje të pagesës). Thirre VETËM pasi mysafiri të ketë konfirmuar shprehimisht dhomën, datat, mysafirët dhe totalin. Kërkon që mysafiri të jetë i kyçur.",
    input_schema: {
      type: "object",
      properties: {
        room_id: { type: "string" },
        check_in: { type: "string" },
        check_out: { type: "string" },
        guests: { type: "integer" },
        guest_name: { type: "string" },
      },
      required: ["room_id", "check_in", "check_out", "guests", "guest_name"],
    },
  },
];


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metodë e palejuar" }, 405);

  if (!llmProvider()) return json({ error: llmMissingMessage }, 503);

  let body: Json;
  try { body = await req.json(); } catch { return json({ error: "JSON i pavlefshëm" }, 400); }

  const rawMessages: unknown = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > MAX_MESSAGES) {
    return json({ error: `Dërgoni 1–${MAX_MESSAGES} mesazhe` }, 400);
  }
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of rawMessages as Json[]) {
    if ((m?.role !== "user" && m?.role !== "assistant") || typeof m?.content !== "string" || m.content.length === 0 || m.content.length > MAX_CHARS) {
      return json({ error: "Mesazh i pavlefshëm" }, 400);
    }
    messages.push({ role: m.role, content: m.content });
  }
  if (messages[messages.length - 1].role !== "user") return json({ error: "Mesazhi i fundit duhet të jetë i përdoruesit" }, 400);

  const language: string = body.language === "en" ? "en" : "sq";
  const listingId: string | null = typeof body.listing_id === "string" && UUID_RE.test(body.listing_id) ? body.listing_id : null;
  const sessionId: string | null = typeof body.session_id === "string" ? body.session_id.slice(0, 64) : null;

  // Klienti përdor JWT-në e përdoruesit: RLS dhe auth.uid() zbatohen si për çdo kërkesë tjetër
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  let listingContext = "";
  if (listingId) {
    const { data: l } = await supabase.from("listings").select("id,title,type,location,price,guests,description").eq("id", listingId).maybeSingle();
    if (l) listingContext = `\nPërdoruesi po shikon këtë pronë: ${JSON.stringify(l)}`;
  }

  const today = new Date().toISOString().slice(0, 10);
  const system = [
    `Je asistenti i KosovaBNB, platformë rezervimesh për hotele, vila, apartamente dhe kamping në Kosovë.`,
    `Përgjigju në ${language === "en" ? "anglisht" : "shqip"}, shkurt dhe miqësisht. Data e sotme: ${today}. Monedha: euro.`,
    `RREGULLA: (1) Çmimet dhe disponueshmërinë i merr VETËM nga funksionet; mos shpik asnjë çmim, pronë ose datë. ` +
      `(2) Nëse mungojnë datat ose numri i mysafirëve, pyet përpara se të kontrollosh. ` +
      `(3) Para se të krijosh rezervim, përmblidh dhomën, datat, mysafirët dhe totalin dhe pyet "Konfirmon?"; thirre create_booking vetëm pas "po" të qartë. ` +
      `(4) Nëse përdoruesi nuk është i kyçur, thuaji të hyjë te ${SITE_URL}/auth para rezervimit. ` +
      `(5) Pas rezervimit, jepi lidhjen e pagesës dhe thuaji se pagesa është në mënyrë provë (simulim). ` +
      `(6) Mos jep këshilla juridike ose mjekësore; për pyetje jashtë rezervimeve dhe udhëtimit në Kosovë, kthehu me mirësjellje te tema.` +
      `\nPërdoruesi është ${user ? "i kyçur" : "i pakyçur"}.` + listingContext,
  ].join("\n");

  // ---- ekzekutimi i funksioneve ----
  const runTool = async (name: string, input: Json): Promise<unknown> => {
    try {
      if (name === "search_listings") {
        let q = supabase.from("listings").select("id,title,type,price,location,guests,rating").eq("is_active", true).limit(8);
        if (typeof input.location === "string" && input.location.trim()) q = q.ilike("location", `%${input.location.trim().replace(/[%_]/g, "")}%`);
        if (typeof input.type === "string") q = q.eq("type", input.type);
        if (typeof input.max_price === "number") q = q.lte("price", input.max_price);
        if (typeof input.guests === "number") q = q.gte("guests", input.guests);
        const { data, error } = await q.order("rating", { ascending: false });
        if (error) return { error: error.message };
        return { listings: data };
      }
      if (name === "check_availability") {
        if (!UUID_RE.test(input.listing_id) || !DATE_RE.test(input.check_in) || !DATE_RE.test(input.check_out)) return { error: "Parametra të pavlefshëm" };
        const { data: rooms, error } = await supabase.rpc("check_availability", {
          _listing_id: input.listing_id, _check_in: input.check_in, _check_out: input.check_out, _guests: Math.max(1, Number(input.guests) || 1),
        });
        if (error) return { error: error.message };
        const out = [];
        for (const r of (rooms ?? []).slice(0, 5)) {
          const { data: q } = await supabase.rpc("quote_stay", { _room_id: r.room_id, _check_in: input.check_in, _check_out: input.check_out });
          out.push({ room_id: r.room_id, room_name: r.room_name, room_type: r.room_type, capacity: r.capacity, quote: q?.[0] ?? null });
        }
        return { available_rooms: out, note: out.length === 0 ? "Nuk ka dhoma të lira për këto data." : undefined };
      }
      if (name === "create_booking") {
        if (!user) return { error: "Përdoruesi nuk është i kyçur. Kërkoji të hyjë në llogari para rezervimit." };
        if (!UUID_RE.test(input.room_id) || !DATE_RE.test(input.check_in) || !DATE_RE.test(input.check_out)) return { error: "Parametra të pavlefshëm" };
        const { data, error } = await supabase.rpc("create_booking", {
          _room_id: input.room_id, _check_in: input.check_in, _check_out: input.check_out,
          _guests: Math.max(1, Number(input.guests) || 1),
          _guest_name: String(input.guest_name ?? "").slice(0, 100) || (user.email ?? "Mysafir"),
          _guest_email: user.email ?? "", _source: "chatbot",
        });
        if (error) return { error: error.message };
        return { booking_id: data, status: "pending", payment_link: `${SITE_URL}/checkout/${data}`, hold_minutes: 30 };
      }
      return { error: "Funksion i panjohur" };
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  // ---- cikli me Claude ----
  const convo: Json[] = messages.map((m) => ({ role: m.role, content: m.content }));
  let reply = "";
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const data = await callLlm({ system, messages: convo, tools: TOOLS, maxTokens: 1024 });
    if (!data.ok) {
      console.error("LLM error", data.status, data.error);
      return json({ error: "Asistenti nuk është i disponueshëm për momentin. Provoni pas pak." }, 502);
    }
    const text = (data.content as Json[]).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (data.stop_reason !== "tool_use") { reply = text; break; }

    convo.push({ role: "assistant", content: data.content });
    const results = [];
    for (const block of (data.content as Json[]).filter((b) => b.type === "tool_use")) {
      results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(await runTool(block.name, block.input ?? {})) });
    }
    convo.push({ role: "user", content: results });
  }
  if (!reply) reply = language === "en" ? "Sorry, I couldn't complete that. Please try again." : "Më vjen keq, nuk e përfundova dot. Provoni përsëri.";

  // ---- ruajtja e bisedës (best-effort; vetëm nëse ekziston service role) ----
  let conversationId: string | null = typeof body.conversation_id === "string" && UUID_RE.test(body.conversation_id) ? body.conversation_id : null;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey) {
    try {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
      if (conversationId) {
        const { data: c } = await admin.from("chat_conversations").select("user_id,session_id").eq("id", conversationId).maybeSingle();
        const owns = c && ((c.user_id && c.user_id === user?.id) || (!c.user_id && c.session_id && c.session_id === sessionId));
        if (!owns) conversationId = null;
      }
      if (!conversationId) {
        const { data: c } = await admin.from("chat_conversations")
          .insert({ user_id: user?.id ?? null, session_id: sessionId, listing_id: listingId, language }).select("id").single();
        conversationId = c?.id ?? null;
      }
      if (conversationId) {
        await admin.from("chat_messages").insert([
          { conversation_id: conversationId, role: "user", content: messages[messages.length - 1].content },
          { conversation_id: conversationId, role: "assistant", content: reply },
        ]);
      }
    } catch (e) {
      console.error("Chat log failed", (e as Error).message);
    }
  }

  return json({ reply, conversation_id: conversationId });
});
