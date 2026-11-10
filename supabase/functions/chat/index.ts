// Chatbot AI për KosovaBNB: Claude me thirrje funksionesh mbi të dhënat reale (disponueshmëri, çmim, rezervim).
// Sekretet (Supabase → Edge Functions → Secrets): ANTHROPIC_API_KEY (i detyrueshëm), ANTHROPIC_MODEL (opsional), SITE_URL (opsional).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, UUID_RE, DATE_RE } from "../_shared/cors.ts";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-5-5";
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

// deno-lint-ignore no-explicit-any
type Json = any;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metodë e palejuar" }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "Chatbot-i nuk është konfiguruar ende (mungon ANTHROPIC_API_KEY)." }, 503);

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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, system, tools: TOOLS, messages: convo }),
    });
    if (!res.ok) {
      console.error("Anthropic error", res.status, await res.text());
      return json({ error: "Asistenti nuk është i disponueshëm për momentin. Provoni pas pak." }, 502);
    }
    const data = await res.json();
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
