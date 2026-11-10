import sys; sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import Doc
ROOT = "/home/claude/kosovabnb/docs"
d = Doc("PROJEKT – JAVA 8", "Raporti final")
d.H("Përmbajtja", 16)
d.UL(["1. Hyrja", "2. Analiza e kërkesave", "3. Projektimi", "4. Implementimi", "5. Veçoritë e avancuara", "6. Testimi dhe rezultatet", "7. Kufizimet dhe rreziqet", "8. Përfundimi dhe puna e ardhshme", "9. Referencat"])
d.H("1. Hyrja")
d.P("Platformat e rezervimit (Booking, Airbnb) bashkojnë mysafirët dhe pronarët, por pronarët e vegjël shpesh çmojnë 'me ndjesi' dhe mysafirët humbin kohë duke krahasuar. "
    "Ky projekt zgjeron KosovaBNB, një ndërfaqe ekzistuese rezervimesh për Kosovën, në një sistem të plotë për menaxhimin e hotelit me rezervim real, pagesë të simuluar, chatbot AI dhe rekomandim çmimi.")
d.P("Qëllimet: (1) rezervim që nuk lejon dyfishim; (2) pagesë të simuluar të sigurt; (3) AI që ndihmon pa shpikur të dhëna; (4) mjete për host-in që të vendosë çmimin me prova, jo me hamendje.")
d.H("2. Analiza e kërkesave")
d.T(["Kodi", "Kërkesa funksionale", "Statusi"], [
    ["F1", "Kërkim dhe shikim i pronave", "Ekzistonte; e ruajtur"],
    ["F2", "Rezervim me kontroll disponueshmërie dhe çmim nga serveri", "Gati, testuar në SQL"],
    ["F3", "Pagesë e simuluar me karta provë", "Gati, testuar në SQL"],
    ["F4", "Chatbot AI me kërkim, çmim dhe rezervim", "Kod gati; pa provë me Claude real"],
    ["F5", "Rekomandim çmimi i shpjegueshëm me pranim/refuzim", "Gati, testuar në SQL"],
    ["F6", "Role guest/host/admin", "Gati, testuar (RLS)"],
    ["F7", "Simulator i strategjive të çmimit", "Motori i testuar; UI pa provë në shfletues"],
    ["F8", "Revenue Manager me parashikim", "Logjika e testuar; UI pa provë"],
    ["F9", "Planifikues udhëtimi me AI", "Kod gati; pa provë me Claude real"],
], [1.5, 10.5, 4.6])
d.T(["Kodi", "Kërkesa jo-funksionale", "Si përmbushet"], [
    ["N1", "Integritet: asnjë rezervim i dyfishtë", "EXCLUDE USING gist në bazë, jo në klient"],
    ["N2", "Siguri: asnjë sekret ose kartë e plotë te klienti", "Çelësi AI në Supabase Secrets; vetëm last4; RLS"],
    ["N3", "Besueshmëri e AI", "Çmimet/disponueshmëria vetëm nga funksionet; planifikuesi rivlerëson në server"],
    ["N4", "Shpjegueshmëri", "Rekomandimi = rregulla + faktorë të ruajtur; AI vetëm shpjegon"],
    ["N5", "Ndershmëri e rezultateve", "Interval besimi, kufizime të dukshme, rezultate negative të raportuara"],
], [1.5, 5.5, 9.6])
d.H("3. Projektimi")
d.IMG(f"{ROOT}/diagrams/arch.png", 15, "Figura 1. Arkitektura")
d.IMG(f"{ROOT}/diagrams/er.png", 15, "Figura 2. Modeli i të dhënave (ER)")
d.P("Detajet e plota (use case, klasa, sekuenca) janë te Java 2. Vendimet kryesore të projektimit:")
d.UL(["Rregullat e biznesit në PostgreSQL (funksione SQL) që të vlejnë pavarësisht nga klienti.",
      "Pagesa e simuluar është funksion SQL; kështu punon pa deploy shtesë dhe mund të testohet pa rrjet.",
      "Çmimi: rregulla × rregullim sipas zënies, i kufizuar në [min, max]. Modeli i gjuhës nuk vendos çmimin, vetëm e shpjegon.",
      "Logjika e çmimit ekziston si SQL (burimi i së vërtetës) dhe si TypeScript (për simulim/parashikim në shfletues); testet kontrollojnë që të përputhen."])
d.H("4. Implementimi")
d.T(["Pjesa", "Teknologjia", "Skedarët kryesorë"], [
    ["Baza dhe logjika", "PostgreSQL, RLS, funksione SQL", "supabase/migrations/*"],
    ["Rezervim dhe pagesë", "React, React Query", "BookingWidget, CheckoutPage, MyBookingsPage"],
    ["Chatbot", "Deno Edge Function + Claude tool calling", "supabase/functions/chat, ChatWidget"],
    ["Rekomandim çmimi", "SQL + Edge Function", "price-recommend, HostDashboardPage"],
    ["Simulator", "TypeScript (RNG me seed, Monte Carlo)", "src/lib/simulation/*, SimulatorPage"],
    ["Revenue Manager", "TypeScript, Recharts", "src/lib/forecast.ts, RevenueManagerPage"],
    ["Planifikues", "Edge Function + Leaflet", "trip-planner, PlannerPage, TripMap"],
], [3.5, 5.6, 7.5])
d.H("5. Veçoritë e avancuara")
d.H("5.1 Simulatori me mysafirë sintetikë", 11)
d.P("Në vend që çmimi dinamik të 'duket i zgjuar', e provojmë: mijëra mysafirë sintetikë (kohë rezervimi eksponenciale, gatishmëri pagese lognormale, ngjarje të papritura) rezervojnë një hotel 10-dhomësh për një vit. "
    "Të njëjtët mysafirë (të njëjtat seed-e) provohen me tri strategji, kështu që diferenca vjen vetëm nga çmimi. Rezultatet raportohen me interval besimi 95%.")
d.T(["Strategjia", "Të ardhura/vit", "Zënia", "ADR"], [
    ["Çmim fiks (€80)", "€189,988 ± 989", "65.1%", "€80.0"],
    ["Rregulla sezonale", "€195,382 ± 1,166", "59.6%", "€89.8"],
    ["AI dinamik", "€196,821 ± 1,135", "60.9%", "€88.6"],
], [4.6, 4.8, 3.6, 3.6])
d.P("Gjetje: AI dinamik është +3.6% mbi çmimin fiks (98/100 seed-e), por vetëm +0.74% mbi rregullat sezonale. Pjesa më e madhe e përfitimit vjen nga sezonaliteti i thjeshtë.")
d.T(["Kërkesa/ditë", "Zënia (fiks)", "Rregulla vs fiks", "AI vs fiks", "AI vs rregulla"], [
    ["6", "43%", "−1.9%", "+0.7%", "+2.7%"], ["8", "55%", "+0.6%", "+2.2%", "+1.6%"], ["10", "65%", "+2.8%", "+3.6%", "+0.7%"],
    ["12", "72%", "+5.3%", "+5.4%", "+0.1% (jo domethënëse)"], ["14", "78%", "+6.9%", "+6.6%", "−0.3%"], ["18", "85%", "+9.2%", "+8.7%", "−0.4%"], ["24", "91%", "+10.4%", "+10.6%", "+0.2%"],
], [2.6, 2.8, 3.6, 3.0, 4.6])
d.P("Interpretim: kur kërkesa është e dobët, rregullat sezonale mund të dëmtojnë (−1.9%), ndërsa rregullimi sipas zënies i kufizon humbjet. Kur hoteli mbushet, AI nuk shton gjë mbi rregullat. Këto janë rezultate të modelit sintetik, jo prova për tregun real.")
d.H("5.2 Revenue Manager me parashikim", 11)
d.P("Parashikimi 90-ditor përdor modelin 'pickup': afër datës mbështetet te rezervimet reale (on-the-books), larg datës te sezonaliteti. Formula: parashikimi = OTB + (1 − w(L)) × a-priori, me w(L) = exp(−(L+1)/τ). "
    "Intervali vjen nga varianca binomiale e pjesës së mbetur. Host-i mund të provojë 'po sikur ndryshoj çmimin me X%' (elasticitet i rregullueshëm) dhe merr sinjalizime (sezon i lartë i pa-rezervuar, datë që mbushet, kërkesë shumë e ulët).")
d.T(["Distanca (ditë)", "MAE pickup", "MAE vetëm rezervime", "MAE vetëm a-priori"], [
    ["0–7", "6.3 pp", "6.2 pp", "18.2 pp"], ["8–14", "10.3 pp", "19.0 pp", "18.0 pp"], ["15–30", "13.1 pp", "34.7 pp", "18.0 pp"],
    ["31–60", "16.1 pp", "51.5 pp", "18.2 pp"], ["61–89", "17.7 pp", "59.0 pp", "18.5 pp"],
], [3.6, 3.6, 4.8, 4.6])
d.P("Gjetje e ndershme: parashikuesi bie shumë mbi bazat në distanca të mesme, por në 61–89 ditë është pothuajse njësoj me a-priori; në 0–7 ditë i përafrohet thjesht rezervimeve ekzistuese. Pra vlera e tij është te distancat 8–60 ditë.")
d.H("5.3 Planifikuesi i udhëtimit me AI", 11)
d.P("Përdoruesi përshkruan udhëtimin; Claude kërkon prona dhe disponueshmëri me funksione dhe dorëzon një itinerar. Pjesa kyçe: serveri rivlerëson çdo qëndrim (pronë ekzistuese, data në të ardhmen, pa mbivendosje, dhomë e lirë për numrin e mysafirëve, çmim nga quote_stay) dhe hedh poshtë atë që nuk kalon. "
    "Titulli, vendndodhja dhe koordinatat vijnë nga baza, jo nga modeli. Teksti i përdoruesit trajtohet si i pabesuar (mbrojtje nga prompt injection).")
d.H("6. Testimi dhe rezultatet")
d.P("44 teste njësie (Vitest) dhe 15 grupe kontrollesh SQL kalojnë. Testimi ka gjetur defekte reale (p.sh. check_availability që nuk shihte rezervimet e të tjerëve). Detajet te dokumenti Java 7. Testimi me përdorues dhe provat manuale të UI-së nuk janë kryer ende.")
d.H("7. Kufizimet dhe rreziqet")
d.UL(["Kërkesa në simulator është sintetike; konstantet (elasticiteti, ngjarjet, kohët e rezervimit) janë supozime të dokumentuara.",
      "UI është verifikuar vetëm sintaksisht; nuk është ekzekutuar në shfletues. Edge Functions nuk janë provuar me Claude API dhe Supabase real.",
      "Rezervimi i planifikuesit krijon rezervime të veçanta; nuk është transaksion i vetëm: nëse njëri dështon, të tjerët mbeten (përdoruesi njoftohet).",
      "Pagesa është simulim. Nuk ka PCI, 3-D Secure, rimbursime ose email njoftimi.",
      "Prona ekzistuese (seed) nuk kanë owner_id; duhet lidhur me një host për të parë panelin.",
      "Paneli i vjetër admin-auth u hoq nga repo, por duhet fshirë edhe nga Supabase dhe fjalëkalimi i ekspozuar të konsiderohet i kompromentuar."])
d.H("8. Përfundimi dhe puna e ardhshme")
d.P("Projekti dërgon një sistem rezervimi me integritet të garantuar nga baza, pagesë të simuluar, chatbot dhe rekomandim çmimi të shpjegueshëm, plus tre mjete që shkojnë përtej kërkesës minimale: simulator, Revenue Manager dhe planifikues udhëtimi. "
    "Kontributi kryesor metodologjik është se AI-ja matet kundrejt bazave të thjeshta dhe rezultati raportohet ndershmërisht, përfshirë kur përfitimi është i vogël.")
d.UL(["Provë e plotë në shfletues dhe me Claude real; testimi me 2–3 përdorues.", "Kalibrimi i simulatorit me të dhëna reale rezervimesh.", "Rezervim transaksional për itinerar; njoftime me email.", "Pagesë reale përmes ofruesi (p.sh. Stripe) në vend të simulimit."])
d.H("9. Referencat")
d.UL(["Talluri, K. T., van Ryzin, G. J. (2004). The Theory and Practice of Revenue Management. Springer.",
      "Law, A. M. (2015). Simulation Modeling and Analysis (5th ed.). McGraw-Hill.",
      "PostgreSQL Documentation: Exclusion Constraints; Row Security Policies. postgresql.org/docs",
      "Supabase Documentation: Auth, Row Level Security, Edge Functions. supabase.com/docs",
      "Anthropic Documentation: Tool use with Claude. docs.claude.com",
      "React, Vite, Tailwind CSS, Recharts, Leaflet, OpenStreetMap: dokumentimi zyrtar."])
d.save(sys.argv[1])
