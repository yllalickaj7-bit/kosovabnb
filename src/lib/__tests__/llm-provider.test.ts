import { afterEach, describe, expect, it, vi } from "vitest";
import { callLlm, llmProvider } from "../../../supabase/functions/_shared/llm";

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
    expect(JSON.parse(request.mock.calls[0][1].body).model).toBe("llama-3.3-70b-versatile");
    expect(result.ok).toBe(true);
  });

  it("does not fall back to the old provider when the Groq key is missing", () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "OPENAI_API_KEY" ? "test-openai" : undefined } });
    expect(llmProvider()).toBeNull();
  });
});