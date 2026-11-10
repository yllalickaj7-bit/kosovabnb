# Architecture rules

- Keep AI provider access in `supabase/functions/_shared/llm.ts` and read credentials only from server secrets so chat, trip planning, and pricing use the same provider without exposing credentials.