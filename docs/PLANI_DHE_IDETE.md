# KosovaBNB – Plani teknik dhe idetë

Ky dokument përshkruan çfarë ekziston, çfarë do të ndërtohet dhe në çfarë rendi. Lidhet me planin 8-javor të lëndës.

## 1. Gjendja aktuale

- Frontend: React 18 + Vite + TypeScript, Tailwind, shadcn/ui, Leaflet (6 faqe: kryefaqja, listimi, eksperiencat, shërbimet, bëhu host, hyrja, admin).
- Backend: Supabase. Tabela e vetme `listings` (12 prona seed me koordinata), lexim publik.
- Rezervimi: `BookingWidget` llogarit çmimin në frontend dhe hap WhatsApp. Nuk ruhet asgjë në bazë dhe nuk verifikohet disponueshmëria.
- Admin: edge function `admin-auth` me fjalëkalim të koduar në kod.

## 2. Çfarë shtohet (arkitektura)

```
React UI ──► Supabase (Postgres + RLS + Auth)
   │                ▲
   ├─► Edge Function  chat              ──► Claude API (tool calling) ──► check_availability / quote_stay / create_booking
   ├─► RPC            create_booking / simulate_payment   (SQL, çmimi dhe pagesa në server)
   └─► Edge Function  price-recommend   ──► rpc generate_price_recommendations ──► Claude (vetëm shpjegimi)
```

Çelësat e AI qëndrojnë vetëm në Supabase Secrets. Klienti nuk shkruan kurrë direkt te `payments`, `chat_*` ose `price_recommendations`. Pagesa e simuluar është funksion SQL (`simulate_payment`), jo Edge Function, kështu që punon pa deploy shtesë.

## 3. Baza e të dhënave

Migrimi: `supabase/migrations/20261110000000_hotel_management_schema.sql`. Diagrami: `docs/diagrams/er.png`.

| Tabela | Qëllimi |
|---|---|
| `user_roles`, `profiles` | Rolet guest/host/admin dhe profili; krijohen automatikisht me regjistrim |
| `rooms` | Njësitë e rezervueshme të një prone, me `base_price`, `min_price`, `max_price` |
| `bookings` | Rezervimet; `EXCLUDE` constraint e bën të pamundur mbivendosjen e datave për të njëjtën dhomë |
| `payments` | Pagesa e simuluar; ruhen vetëm `card_last4` dhe `is_simulated` |
| `pricing_rules` | Sezoni, fundjava, festat, last-minute (shumëzues) |
| `price_recommendations` | Sugjerimi i AI me faktorët (JSONB), shpjegimin dhe statusin suggested/accepted/rejected |
| `chat_conversations`, `chat_messages` | Historiku i chatbot-it dhe thirrjet e funksioneve |
| `reviews` | Vlerësime vetëm për rezervime të përfunduara |

Funksione SQL: `check_availability`, `nightly_price`, `quote_stay`, `has_role`; pamja `listing_occupancy_30d`.
Testuar në PostgreSQL lokal: mbivendosja refuzohet, rezervimi "back-to-back" lejohet, çmimi respekton kufijtë min/max.

## 4. Idetë kryesore

**Chatbot AI.** Përdoruesi shkruan "Dua një vilë për 6 vetë në Prizren 20–23 korrik". Modeli thërret `check_availability` dhe `quote_stay`, paraqet opsionet me çmim real dhe krijon rezervimin vetëm pas "po" nga mysafiri. Përgjigjet në shqip ose anglisht sipas gjuhës së përdoruesit. Nuk shpik çmime ose disponueshmëri.

**Rekomandimi i çmimit.** Hibrid dhe i shpjegueshëm:
1. Faktorët: sezoni/festa, fundjava, zënia 30-ditore, dita deri në qëndrim.
2. Çmimi = çmimi bazë × faktorët, i kufizuar brenda `min_price`–`max_price`.
3. Claude shkruan vetëm shpjegimin ("82% e dhomave të zëna, fundjavë → +15%").
4. Host-i pranon ose refuzon; çdo vendim ruhet dhe mund të përdoret më vonë për të vlerësuar saktësinë.

**Pagesa e simuluar.** Karta provë `4242 4242 4242 4242` kalon, `4000 0000 0000 0002` refuzohet, `4000 0000 0000 9995` dështon për fonde të pamjaftueshme. Asnjëherë nuk ruhet numri i plotë ose CVV. Ndërfaqja shfaq qartë "Mënyra provë".

**Ide shtesë (nëse mbetet kohë):**
- Paneli i host-it me grafik zënieje dhe të ardhurash (recharts është tashmë në projekt).
- Kalendar i dhomave me ngjyra sipas çmimit të sugjeruar.
- Chatbot për host-in: "Sa rezervime kam këtë javë?".
- Njoftim me email kur konfirmohet rezervimi.

## 5. Siguria: panel admin i vjetër (rregulluar)

Funksioni `admin-auth` kishte fjalëkalimin të koduar (`pass123`) dhe nuk e verifikonte token-in; përdorte `service role`, pra kushdo që e dinte URL-në mund të krijonte, ndryshonte ose fshinte prona. Në këtë dege:
- `AdminPage` kyçet me llogari dhe rolin `admin` në `user_roles`; të dhënat mbrohen nga RLS.
- Skedari `supabase/functions/admin-auth` u fshi nga repo.

**Ende duhet bërë me dorë:**
1. Fshij funksionin e vendosur: `supabase functions delete admin-auth` (heqja nga repo nuk e heq nga Supabase).
2. Fjalëkalimi `pass123` ishte në repo publike: konsiderohet i ekspozuar; ndryshoje kudo tjetër ku është përdorur.
3. `.env` është i commit-uar. Përmban vetëm çelësin publik të Supabase (i sigurt për frontend); mos vendos kurrë çelës sekret aty.

## 5b. Vendosja (deploy)

```bash
# 1. Migrimet (sipas rendit)
supabase db push

# 2. Admini i parë (zëvendëso me ID-në e përdoruesit nga Auth → Users)
#    insert into public.user_roles (user_id, role) values ('<USER_ID>', 'admin');

# 3. Chatbot dhe shpjegimet AI
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   # ose OPENAI_API_KEY=sk-...  ose GROQ_API_KEY=gsk_... (FALAS, console.groq.com)  (njëri mjafton)
supabase secrets set OPENAI_MODEL=gpt-4o-mini LLM_PROVIDER=openai   # opsionale, vetëm nëse përdor OpenAI
supabase secrets set ANTHROPIC_MODEL=claude-haiku-5-5 SITE_URL=https://<domeni-yt>   # opsionale
supabase functions deploy chat
supabase functions deploy price-recommend
supabase functions deploy trip-planner
```

Pa `ANTHROPIC_API_KEY`: chatbot-i kthen mesazh "nuk është konfiguruar", ndërsa rekomandimet e çmimit punojnë me shpjegimin standard në shqip.
Prona ekzistuese (seed) nuk kanë `owner_id`; për t'i lidhur me një host: `update public.listings set owner_id = '<USER_ID>' where id = '...';`.

## 6. Radha e punës

| Java | Dorëzimi | Statusi |
|---|---|---|
| 1 | Dokumenti fillestar | Gati: `docs/Java1_Dokumenti_Fillestar_KosovaBNB.docx` |
| 2 | UML + ER + API | Gati: `docs/Java2_Dokumenti_Projektimit_KosovaBNB.docx`, diagramet te `docs/diagrams/` |
| 3 | Wireframe + Git + plan | Gati: `docs/Java3_Prototipi_dhe_Plani_KosovaBNB.docx`, `docs/wireframes/` (8 PNG) |
| 4 | Backend bazë | Gati: migrimet, funksionet, RLS, tipet TypeScript (rigjeneruar nga skema) |
| 5 | Demo 50% | Kod gati: rezervim + pagesë e simuluar; duhet testuar në Supabase real |
| 6 | Chatbot, çmimi, siguria | Kod gati; chatbot-i kërkon `ANTHROPIC_API_KEY` dhe deploy |
| 7 | Teste + dokumentim | Gati: 44 teste Vitest, 15 grupe SQL (`supabase/tests/run.sh`), `docs/Java7_Raporti_Testimit_KosovaBNB.docx`; mbetet testimi me përdorues |
| 8 | Final | Gati: `docs/Java8_Raporti_Final_KosovaBNB.docx`, `docs/Java8_Prezantimi_KosovaBNB.pptx` |
| + | Veçori shtesë | Simulator, Revenue Manager, Planifikues AI: shih `docs/WOW_FEATURES.md` |

## 7. Çfarë është verifikuar dhe çfarë jo

- **Verifikuar:** të 4 migrimet aplikohen në PostgreSQL të pastër; testet e sjelljes (mbivendosja, kapaciteti, pagesa me karta të ndryshme, RLS mes përdoruesve, rekomandimet, role) kalojnë; të gjithë skedarët TS/TSX kalojnë kontrollin sintaksor; `types.ts` kompilohet me `tsc --strict`.
- **Jo e verifikuar:** `npm run build` dhe ekzekutimi i UI-së në shfletues, si dhe Edge Functions kundër Claude API dhe Supabase real. Mjedisi i punës nuk kishte qasje për të instaluar varësitë dhe as çelës API. Para demos duhet `npm install && npm run build` dhe një provë e plotë.
