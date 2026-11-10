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
   ├─► Edge Function  simulate-payment  ──► shkruan payments, konfirmon bookings
   └─► Edge Function  price-recommend   ──► faktorët (rregulla + zënia) ──► Claude (vetëm shpjegimi) ──► price_recommendations
```

Çelësat e AI qëndrojnë vetëm në Supabase Secrets. Klienti nuk shkruan kurrë direkt te `payments`, `chat_*` ose `price_recommendations`.

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

## 5. Probleme sigurie në kodin ekzistues (për t'u rregulluar në Javën 6, ose më herët)

1. `supabase/functions/admin-auth/index.ts` ka fjalëkalimin të koduar (`pass123`) dhe **nuk e verifikon token-in** për veprimet list/create/update/delete. Funksioni përdor `service role`, kështu që kushdo që e di URL-në mund të krijojë, ndryshojë ose fshijë prona. Zgjidhja: roli `admin` në `user_roles` + RLS, dhe heqja e funksionit.
2. Fjalëkalimi i tanishëm duhet të konsiderohet i ekspozuar (është në repo publike). Duhet ndryshuar kudo ku përdoret.
3. `.env` është i commit-uar. Përmban vetëm çelësin publik të Supabase (i sigurt për frontend), por `.env` duhet shtuar në `.gitignore` dhe çelësat e rinj të ruhen si Secrets.

## 6. Radha e punës

| Java | Dorëzimi | Statusi |
|---|---|---|
| 1 | Dokumenti fillestar | Gati: `docs/Java1_Dokumenti_Fillestar_KosovaBNB.docx` |
| 2 | UML + ER | ER gati; mbeten use case, klasa, sekuenca |
| 3 | Wireframe + Git + plan | UI ekzistues; mbeten ekranet e reja |
| 4 | Backend bazë | Skema gati; mbeten CRUD, tipet TypeScript, auth |
| 5 | Demo 50% | Rezervim + pagesë e simuluar |
| 6 | Chatbot, çmimi, siguria | — |
| 7 | Teste + dokumentim | — |
| 8 | Final | — |

Hapi i parë pas aplikimit të migrimit: rigjenero `src/integrations/supabase/types.ts` me `supabase gen types typescript`.
