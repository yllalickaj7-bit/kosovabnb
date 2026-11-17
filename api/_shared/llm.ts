// Adapter për Groq, duke përdorur API-në e përputhshme me OpenAI.
// Sekreti: GROQ_API_KEY. Modeli opsional: GROQ_MODEL (parazgjedhje openai/gpt-oss-120b; rezervë openai/gpt-oss-20b (llama-3.x u mbyllën nga Groq më 16.08.2026)).
// Brenda funksioneve biseda mbahet në formatin e blloqeve të Anthropic (text/tool_use/tool_result); për OpenAI përkthehet këtu.
// deno-lint-ignore no-explicit-any
type Json = any;

export const llmProvider = (): "groq" | null => Deno.env.get("GROQ_API_KEY") ? "groq" : null;

// Konfigurimi lexohet vetëm në server; çelësi nuk i dërgohet shfletuesit.
const openAiConfig = () => {
  const groq = Deno.env.get("GROQ_API_KEY");
  if (!groq) return null;
  return { key: groq, base: "https://api.groq.com/openai/v1", models: Array.from(new Set([...(Deno.env.get("GROQ_MODEL") ? [Deno.env.get("GROQ_MODEL")] : []), "openai/gpt-oss-120b", "openai/gpt-oss-20b"])) };
};

export const llmMissingMessage = "Mungon çelësi i AI: vendos GROQ_API_KEY te Lovable Cloud Secrets.";

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

  const cfg = openAiConfig();
  if (!cfg) return { ok: false, status: 503, error: llmMissingMessage, content: [], stop_reason: "error" };
  const base: Json = { max_tokens: maxTokens, messages: toOpenAiMessages(opts.system, opts.messages) };
  if (opts.tools?.length) base.tools = opts.tools.map((t: Json) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } }));
  // Provo modelin kryesor, pastaj rezervën; modelet e vegjël herë pas here gjenerojnë thirrje funksioni të pavlefshme (400), prandaj 2 tentativa.
  let res: Response | null = null;
  let lastError = "";
  let lastStatus = 502;
  outer: for (const model of cfg.models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await fetch(`${cfg.base}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${cfg.key}`, "content-type": "application/json" },
          body: JSON.stringify({ ...base, model }),
        });
      } catch (e) {
        lastError = `rrjeti: ${(e as Error).message}`; lastStatus = 502; res = null; continue;
      }
      if (res.ok) break outer;
      lastStatus = res.status;
      lastError = `${model}: ${(await res.text()).slice(0, 300)}`;
      res = null;
      if (lastStatus === 401 || lastStatus === 403) break outer; // çelës i gabuar: s'ka kuptim të provohet më tej
    }
  }
  if (!res) return { ok: false, status: lastStatus, error: lastError, content: [], stop_reason: "error" };
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
