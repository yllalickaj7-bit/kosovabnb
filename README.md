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

## AI në Vercel (pa Supabase Edge Functions)

Funksionet `api/chat.ts`, `api/trip-planner.ts`, `api/price-recommend.ts` punojnë si Vercel Functions
(gjenerohen nga `supabase/functions` me `node scripts/gen-api.mjs`). Te Vercel → Settings → Environment Variables
shto vetëm: `GROQ_API_KEY` (falas nga console.groq.com). Çelësat e Supabase merren nga `VITE_SUPABASE_*` që janë aty.
