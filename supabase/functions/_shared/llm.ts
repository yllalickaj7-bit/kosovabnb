// Adapter i vetëm për modelet e gjuhës: Claude (Anthropic) ose OpenAI. Zgjedhja:
//   LLM_PROVIDER=anthropic|openai  (opsional), përndryshe: ANTHROPIC_API_KEY → anthropic, OPENAI_API_KEY → openai, GROQ_API_KEY → groq (FALAS, API e përputhshme me OpenAI).
// Modelet: ANTHROPIC_MODEL (claude-haiku-5-5), OPENAI_MODEL (gpt-4o-mini), GROQ_MODEL (llama-3.3-70b-versatile). OPENAI_BASE_URL për çdo ofrues tjetër të përputhshëm me OpenAI.
// Brenda funksioneve biseda mbahet në formatin e blloqeve të Anthropic (text/tool_use/tool_result); për OpenAI përkthehet këtu.
// deno-lint-ignore no-explicit-any
type Json = any;

export const llmProvider = (): "anthropic" | "openai" | null => {
  const pref = Deno.env.get("LLM_PROVIDER");
  const a = !!Deno.env.get("ANTHROPIC_API_KEY"), o = !!Deno.env.get("OPENAI_API_KEY"), g = !!Deno.env.get("GROQ_API_KEY");
  if (pref === "openai" && (o || g)) return "openai";
  if (pref === "anthropic" && a) return "anthropic";
  if (a) return "anthropic";
  if (o || g) return "openai";
  return null;
};

// Çelësi, adresa dhe modeli për ofruesit e përputhshëm me OpenAI (OpenAI vetë ose Groq falas)
const openAiConfig = () => {
  const groq = Deno.env.get("GROQ_API_KEY");
  const openai = Deno.env.get("OPENAI_API_KEY");
  if (openai && Deno.env.get("LLM_PROVIDER") !== "groq") {
    return { key: openai, base: (Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, ""), model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini" };
  }
  return { key: groq!, base: "https://api.groq.com/openai/v1", model: Deno.env.get("GROQ_MODEL") ?? "llama-3.3-70b-versatile" };
};

export const llmMissingMessage = "Mungon çelësi i AI: vendos GROQ_API_KEY (falas), OPENAI_API_KEY ose ANTHROPIC_API_KEY te Supabase Secrets.";

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

  const cfg = openAiConfig();
  const body: Json = { model: cfg.model, max_tokens: maxTokens, messages: toOpenAiMessages(opts.system, opts.messages) };
  if (opts.tools?.length) body.tools = opts.tools.map((t: Json) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } }));
  const res = await fetch(`${cfg.base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}`, "content-type": "application/json" },
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
