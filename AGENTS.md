# Architecture rules

- Keep AI provider access in `supabase/functions/_shared/llm.ts` and read credentials only from server secrets so chat, trip planning, and pricing use the same provider without exposing credentials.
- Keep direct room and price-override reads owner/admin-scoped; expose traveler totals through the bounded, active-room `quote_stay` function so private pricing records remain protected without breaking booking quotes.