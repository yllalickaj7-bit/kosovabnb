import { afterEach, describe, expect, it, vi } from "vitest";
import { callLlm, llmProvider } from "../../../supabase/functions/_shared/llm";

declare global {
  var Deno: { env: { get(name: string): string | undefined } };
}

afterEach(() => vi.unstubAllGlobals());

describe("Groq provider migration", () => {
  it("uses Groq even when the previous OpenAI key remains configured", async () => {
    const values: Record<string, string> = { GROQ_API_KEY: "test-groq", OPENAI_API_KEY: "test-openai" };
    vi.stubGlobal("Deno", { env: { get: (name: string) => values[name] } });
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "Hello" } }] })));
    vi.stubGlobal("fetch", request);
    expect(llmProvider()).toBe("groq");
    const result = await callLlm({ system: "Test", messages: [{ role: "user", content: "Hello" }] });
    expect(request.mock.calls[0][0]).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(JSON.parse(request.mock.calls[0][1].body).model).toBe("openai/gpt-oss-120b");
    expect(result.ok).toBe(true);
  });

  it("kalon te modeli rezervë kur kryesori dështon", async () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => (name === "GROQ_API_KEY" ? "k" : undefined) } });
    const request = vi.fn()
      .mockResolvedValueOnce(new Response("bad", { status: 400 }))
      .mockResolvedValueOnce(new Response("bad", { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] })));
    vi.stubGlobal("fetch", request);
    const r = await callLlm({ system: "S", messages: [{ role: "user", content: "x" }] });
    expect(r.ok).toBe(true);
    expect(JSON.parse(request.mock.calls[2][1].body).model).toBe("openai/gpt-oss-20b");
  });

  it("kthen detajin e gabimit dhe nuk provon më me çelës të gabuar", async () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => (name === "GROQ_API_KEY" ? "k" : undefined) } });
    const request = vi.fn().mockResolvedValue(new Response("invalid key", { status: 401 }));
    vi.stubGlobal("fetch", request);
    const r = await callLlm({ system: "S", messages: [{ role: "user", content: "x" }] });
    expect(r.ok).toBe(false); expect(r.status).toBe(401); expect(r.error).toContain("invalid key");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not fall back to the old provider when the Groq key is missing", () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "OPENAI_API_KEY" ? "test-openai" : undefined } });
    expect(llmProvider()).toBeNull();
  });
});