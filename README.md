# KosovaBnB

Platformë rezervimesh për Kosovën: React + Vite + TypeScript + Tailwind + shadcn/ui, me Supabase (Postgres, Auth, Edge Functions) dhe AI (OpenAI ose Claude).

## Zhvillim lokal
```bash
npm install
cp .env.example .env.local   # plotëso çelësat e Supabase
npm run dev                  # http://localhost:8080
npm test                     # teste njësie (Vitest)
```

## Vendosja (Vercel)
1. Vercel → **Add New → Project** → zgjidh repon `kosovabnb` (framework Vite zbulohet vetë; `vercel.json` e ka konfigurimin).
2. Te **Environment Variables** shto `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (shih `.env.example`).
3. Deploy. Pastaj te Supabase → **Authentication → URL Configuration** vendos *Site URL* dhe *Redirect URLs* me domenin e Vercel.

## Baza dhe AI
Shih `docs/PLANI_DHE_IDETE.md` (migrimet, funksionet `chat`, `trip-planner`, `price-recommend`, secret-et `OPENAI_API_KEY` ose `ANTHROPIC_API_KEY`).
