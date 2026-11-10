# Veçoritë e avancuara: çfarë janë, si funksionojnë, çfarë nuk provojnë

Tre mjete shtesë mbi rezervimin dhe chatbot-in. Secili është i ndërtuar që të **matet**, jo vetëm të duket i zgjuar.

## 1. Simulatori i çmimeve (`/simulator`)
**Ideja.** Nuk kemi të dhëna reale të një hoteli, prandaj krijojmë mysafirë sintetikë: ata vijnë rastësisht, kanë buxhet të ndryshëm dhe rezervojnë disa ditë para qëndrimit. Një hotel 10-dhomësh simulohet për një vit.
**Si krahasohet drejt.** Të njëjtët mysafirë (i njëjti `seed`) provohen me tri strategji: çmim fiks, rregulla sezonale, AI dinamik. Kështu diferenca vjen vetëm nga çmimi. Përsëritet 100 herë dhe jepet intervali i besimit 95%.
**Çfarë gjetëm.** AI dinamik +3.6% mbi çmimin fiks, por vetëm +0.74% mbi rregullat sezonale. Kur hoteli mbushet, AI nuk shton gjë. Kur kërkesa është shumë e dobët, rregullat sezonale mund të dëmtojnë (−1.9%).
**Çfarë NUK provon.** Kërkesa është sintetike: sezonaliteti, ngjarjet dhe elasticiteti janë supozime. Është demonstrim i mekanizmit, jo premtim përfitimi.
Kodi: `src/lib/simulation/`, rezultatet: `docs/results/simulation.json`, ri-ekzekutim: `npx tsx scripts/run-simulation.ts`.

## 2. Revenue Manager (`/host/revenue`)
**Ideja.** Për 90 ditët e ardhshme, sa do të jetë zënia? Afër datës e dimë nga rezervimet reale; larg datës mbështetemi te sezonaliteti. Formula: `parashikimi = rezervuar + (1 − w) × a-priori`, ku `w` është pjesa e rezervimeve që pritet të jetë bërë tashmë.
**Çfarë shfaq.** Grafik me interval pasigurie, KPI (të ardhura të pritura, zënie), sinjalizime (sezon i lartë i pa-rezervuar, datë që mbushet, kërkesë shumë e ulët) dhe skenari "po sikur": ndrysho çmimin dhe shih zënien dhe të ardhurat e pritura.
**Modaliteti demo.** Pa rezervime reale përdor një vit të simuluar; shfaqet qartë "Të dhëna demo".
**Backtest.** Gabimi mesatar i zënies: 6.3 pp (0–7 ditë), 10–16 pp (8–60 ditë), 17.7 pp (61–89 ditë, pothuajse njësoj si a-priori). Pra vlera e tij është në distancat e mesme.
Elasticiteti i "po sikur" është supozim i rregullueshëm, jo i matur.
Kodi: `src/lib/forecast.ts`; backtest: `npx tsx scripts/backtest-forecast.ts`.

## 3. Planifikuesi i udhëtimit me AI (`/planner`)
**Ideja.** Shkruan "5 ditë romantike me kulturë dhe natyrë". Claude kërkon prona reale, kontrollon disponueshmërinë dhe propozon itinerar me disa qytete.
**Pse është i besueshëm.** Modeli vetëm *propozon*. Serveri e rivlerëson çdo qëndrim: pronë ekzistuese, datë në të ardhmen, pa mbivendosje, dhomë e lirë për numrin e mysafirëve, çmim nga `quote_stay`. Titulli, vendndodhja dhe koordinatat vijnë nga baza, jo nga modeli. Çfarë nuk kalon hidhet poshtë dhe tregohet.
**Siguria.** Teksti i përdoruesit trajtohet si i pabesuar (nuk mund t'i ndryshojë rregullat e sistemit).
**Kufizim.** "Rezervo të gjitha" krijon rezervime të veçanta (jo një transaksion): nëse njëri dështon, të mëparshmit mbeten dhe përdoruesi njoftohet.
Kodi: `supabase/functions/trip-planner/`, `src/pages/PlannerPage.tsx`, `src/components/TripMap.tsx`. Kërkon `ANTHROPIC_API_KEY` dhe `supabase functions deploy trip-planner`.

## Çfarë është verifikuar
Testet njësie (44) dhe SQL (15 grupe) kalojnë. UI e këtyre tri faqeve është verifikuar vetëm sintaksisht (nuk u ekzekutua në shfletues); `trip-planner` nuk është provuar me Claude real.
