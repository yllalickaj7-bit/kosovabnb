# KosovaBNB – Sistem Inteligjent për Menaxhimin e Hotelit

*Dokumenti fillestar i projektit – Java 1 · Inxhinieri Softuerike · Prishtinë, 2026/2027*

## 1. Përshkrimi i problemit

Pronarët e hoteleve, motelave, vilave dhe apartamenteve të vogla në Kosovë rezervimet i menaxhojnë ende me telefon, WhatsApp dhe fletore. Kjo sjell rezervime të dyfishta, përgjigje të vonuara ndaj mysafirëve (sidomos jashtë orarit të punës) dhe çmime të vendosura me përvojë ose me hamendje: shumë të ulëta në sezon të lartë, shumë të larta kur kërkesa është e ulët.

Mysafirët, nga ana tjetër, nuk kanë një vend ku të shohin disponueshmërinë reale, të marrin çmimin përfundimtar dhe të rezervojnë menjëherë në gjuhën shqipe. Në KosovaBNB rezervimi aktual përfundon vetëm me hapjen e një mesazhi në WhatsApp, pa verifikim të disponueshmërisë dhe pa evidencë në bazë të të dhënave.

## 2. Qëllimi i projektit

Qëllimi është të zgjerohet platforma ekzistuese KosovaBNB (ndërfaqja është e gatshme) në një sistem të plotë për menaxhimin e hotelit, i cili: (1) menaxhon dhomat dhe disponueshmërinë, (2) pranon rezervime online pa mbivendosje, (3) simulon pagesën e rezervimit, (4) i përgjigjet mysafirëve përmes një chatbot-i AI në shqip dhe anglisht dhe (5) i rekomandon pronarit çmimin optimal për çdo natë me bazë të dhënash.

## 3. Përdoruesit e sistemit

| Roli | Çfarë bën në sistem |
|---|---|
| Mysafiri | Kërkon dhe filtron prona, shikon disponueshmërinë dhe çmimin, rezervon, paguan (simulim), flet me chatbot-in, lë vlerësim |
| Pronari / Hoteliti (host) | Menaxhon pronat dhe dhomat, shikon rezervimet, pranon ose refuzon rekomandimet e çmimit |
| Administratori | Menaxhon përdoruesit, rolet dhe të gjitha pronat; shikon raporte |

## 4. Analiza e sistemeve ekzistuese

| Sistemi | Pika të forta | Çfarë mungon |
|---|---|---|
| Booking.com / Airbnb | Audiencë e madhe, rezervim dhe pagesë të integruara | Komision i lartë; asistencë e përgjithshme, jo e përshtatur për pronarët lokalë; çmimin e vendos vetë pronari |
| Sisteme PMS (p.sh. Cloudbeds, Mews) | Menaxhim i plotë i dhomave dhe i operacioneve | Çmim dhe kompleksitet i lartë për pronarët e vegjël; zakonisht pa shqip |
| Mjete të çmimit dinamik (p.sh. PriceLabs) | Rekomandim çmimi sipas kërkesës | Shërbim i veçantë me abonim; jo i integruar me rezervimin dhe chatbot-in |
| Rezervim me telefon / WhatsApp (praktika aktuale) | I thjeshtë, personal | Pa disponueshmëri reale, pa automatizim, rrezik rezervimesh të dyfishta |

## 5. Avantazhet e sistemit të propozuar

- Një vend i vetëm për rezervim, disponueshmëri, pagesë dhe komunikim – në shqip.
- Parandalim i rezervimeve të dyfishta në nivel të bazës së të dhënave (kufizim që nuk lejon periudha të mbivendosura për të njëjtën dhomë).
- Chatbot AI 24/7 që përgjigjet me të dhëna reale (disponueshmëri dhe çmim), jo me përgjigje të shpikura.
- Rekomandim çmimi me shpjegim të qartë, brenda kufijve që i vendos vetë pronari; vendimi mbetet te njeriu.
- Pa komision të platformës dhe i përshtatur për tregun e Kosovës (euro, qytetet dhe sezonet lokale: Rugova, Brezovica, Prizreni).

## 6. Funksionet kryesore

| Nr. | Funksioni | Prioriteti |
|---|---|---|
| F1 | Regjistrim, hyrje dhe role (mysafir, host, admin) me Supabase Auth | MVP |
| F2 | Menaxhimi i pronave dhe dhomave (CRUD) nga host-i | MVP |
| F3 | Kërkimi dhe kontrolli i disponueshmërisë sipas datave dhe numrit të mysafirëve | MVP |
| F4 | Rezervimi me llogaritje serverike të çmimit dhe parandalim të mbivendosjes | MVP |
| F5 | Simulim i pagesës (kartë provë: sukses, refuzim) dhe konfirmim i rezervimit | MVP |
| F6 | Chatbot AI: pyetje për pronat, disponueshmëri, çmim dhe krijim rezervimi me konfirmim | MVP |
| F7 | Rekomandim çmimi me AI për çdo natë dhe pranim/refuzim nga host-i | MVP |
| F8 | Panel i host-it: rezervimet, zënia (occupancy), të ardhurat | I dytë |
| F9 | Vlerësime nga mysafirët pas qëndrimit | I dytë |
| F10 | Njoftime me email dhe kalendar i dhomave | Opsional |

Kërkesat jo-funksionale: siguria (RLS në çdo tabelë, asnjë e dhënë reale karte, çelësat e AI vetëm në server), përgjigje e chatbot-it nën 5 sekonda, ndërfaqe responsive, mbështetje për shqip dhe anglisht.

## 7. Roli i AI-së në projekt

AI përdoret në dy vende, dhe në të dyja ka kufizime të qarta për ta mbajtur sistemin të besueshëm.

- Chatbot AI (model gjuhësor me thirrje funksionesh): kupton pyetjet në shqip ose anglisht dhe thërret funksione të sistemit (kontrollo disponueshmërinë, merr çmimin, krijo rezervim). Çmimet dhe disponueshmëria vijnë gjithmonë nga baza e të dhënave; rezervimi krijohet vetëm pas konfirmimit të mysafirit. Çelësi i API-t ruhet në server (Supabase Edge Function).
- Rekomandimi i çmimit (qasje hibride): së pari llogariten faktorët me rregulla dhe statistikë – sezoni, fundjava, festat, zënia e 30 ditëve të ardhshme dhe sa ditë mbeten deri në qëndrim. Rezultati kufizohet brenda çmimit minimal dhe maksimal të dhomës. Modeli gjuhësor shton vetëm shpjegimin në gjuhë natyrore (p.sh. "Çmimi sugjerohet më i lartë sepse 82% e dhomave janë të zëna dhe është fundjavë"). Host-i e pranon ose e refuzon sugjerimin.

## 8. Teknologjitë dhe plani i punës

Frontend (ekzistues): React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Query, Leaflet. Backend: Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions në Deno). AI: Claude API përmes Edge Function. Testim: Vitest. Versionimi: Git/GitHub.

| Java | Dorëzimi | Çfarë do të bëhet në KosovaBNB |
|---|---|---|
| 1 | Propozimi (ky dokument) | Analiza, kërkesat, përcaktimi i rolit të AI-së |
| 2 | Projektimi | UML, diagrami ER (skema e bazës është projektuar), API e Edge Functions |
| 3 | Prototipi dhe mjedisi | Wireframe për ekranet e reja (rezervimi, pagesa, chatbot, paneli i host-it), GitHub Projects |
| 4 | Backend bazë | Migrimet, rolet, CRUD për dhoma dhe rezervime, kontrolli i disponueshmërisë |
| 5 | Demo e ndërmjetme | Rezervim i plotë nga ndërfaqja me pagesë të simuluar |
| 6 | Funksionet shtesë dhe siguria | Chatbot AI, rekomandimi i çmimit, zëvendësimi i panelit admin me role |
| 7 | Testimi dhe dokumentimi | Teste njësi, testim me 2–3 përdorues, README |
| 8 | Dorëzimi final | Aplikacioni, raporti, prezantimi dhe demo live |
