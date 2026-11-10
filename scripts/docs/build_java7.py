import sys; sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import Doc
d = Doc("PROJEKT – JAVA 7", "Raporti i testimit dhe dokumentimi")
d.H("1. Strategjia e testimit", 16)
d.P("Testimi është ndarë sipas rrezikut. Pjesët ku një gabim kushton më shumë (çmimi, disponueshmëria, pagesa, të drejtat e qasjes) janë testuar te baza e të dhënave, sepse aty zbatohen rregullat e biznesit. "
    "Logjika e llogaritjes që përdoret në shfletues (çmimi, parashikimi, simulimi) është kod i pastër TypeScript dhe testohet me teste njësie. Ndërfaqja dhe integrimi me Claude API testohen manualisht (shih 6 dhe 7).")
d.T(["Niveli", "Mjeti", "Sasia", "Ku ekzekutohet"], [
    ["Njësie (unit)", "Vitest", "44 teste, 4 skedarë", "npm test"],
    ["Bazë e të dhënave", "PostgreSQL + psql (supabase/tests)", "15 grupe kontrollesh (T1–T15)", "supabase/tests/run.sh"],
    ["Validim statistik", "Simulator + backtest", "100 seed-e / 20 seed-e", "scripts/run-simulation.ts, scripts/backtest-forecast.ts"],
    ["Ndërfaqja & AI", "Manual", "Lista në seksionin 6", "Shfletues + Supabase real"],
], [3.0, 4.8, 4.3, 4.5])
d.H("2. Testet e njësisë")
d.T(["Skedari", "Teste", "Çfarë kontrollon"], [
    ["pricing.test.ts", "12", "Shumëzuesit sezonalë/fundjavë/festë, kufijtë min/max, rregullimi sipas zënies, mospërputhje me SQL"],
    ["booking-utils.test.ts", "7", "Formatimi i kartës dhe datës, algoritmi Luhn, rezultati i pagesës sipas kartës provë"],
    ["simulation.test.ts", "10", "Përsëritshmëria me të njëjtin seed, kufijtë e çmimit, mospërzierja e rezervimeve, intervali i besimit"],
    ["forecast.test.ts", "15", "Pickup, interval, 'po sikur', optimumi, sinjalizimet, rastet kufitare (lead 0)"],
], [4.0, 1.7, 10.9])
d.P("Rezultati i fundit: 44 kaluan, 0 dështuan. Shënim: në mjedisin e punës Vitest nuk mund të instalohej, prandaj testet u ekzekutuan me një shim të vogël mbi `node:test` (scripts/vitest-shim.ts). Në projekt ekzekutohen me `npm test`; përputhja e plotë me Vitest nuk është provuar këtu.")
d.H("3. Testet e bazës së të dhënave (SQL)")
d.P("Skedari supabase/tests/regression.sql aplikon të gjitha migrimet mbi një PostgreSQL të pastër (me stub të skemës `auth`) dhe përdor ASSERT; `run.sh` i ekzekuton nga e para për çdo rrjedhë.")
d.T(["Test", "Kontrolli", "Rezultati"], [
    ["T1", "Përdoruesi i ri merr rolin guest automatikisht", "Kaloi"],
    ["T2", "Rezervimi pa kyçje refuzohet", "Kaloi"],
    ["T3", "Rezervim i vlefshëm: total = subtotal + tarifë, statusi 'pending'", "Kaloi"],
    ["T4", "Mbivendosja (edhe pjesore) e datave refuzohet nga constraint-i EXCLUDE", "Kaloi"],
    ["T5", "Rezervimi 'back-to-back' (check-out = check-in tjetër) lejohet", "Kaloi"],
    ["T6", "Kapaciteti, data në të kaluarën, >30 net, 0 mysafirë refuzohen", "Kaloi"],
    ["T7", "check_availability i shfaq dhomat e zëna si të pa-lira (SECURITY DEFINER)", "Kaloi"],
    ["T8", "Çmimi mbetet brenda min/max edhe me shumëzues ×5", "Kaloi"],
    ["T9–T10", "Karta e refuzuar, fonde të pamjaftueshme dhe kartë e skaduar dështojnë; rezervimi mbetet pending", "Kaloi"],
    ["T11", "Karta 4242… kalon dhe rezervimi bëhet 'confirmed'", "Kaloi"],
    ["T12", "Ruhet vetëm card_last4 dhe is_simulated; numri i plotë nuk ruhet kurrë; pagesa e dyfishtë refuzohet", "Kaloi"],
    ["T13", "Përdorues i huaj nuk paguan rezervimin e dikujt tjetër", "Kaloi"],
    ["T14", "RLS: b nuk sheh rezervimet e a; hosti sheh ato të pronës së vet; klienti nuk shkruan te payments", "Kaloi"],
    ["T15", "Rekomandimet: vetëm host-i i gjeneron; brenda min/max; pranimi zbatohet te nightly_price", "Kaloi"],
], [1.8, 12.0, 2.8])
d.H("4. Defekte të gjetura nga testimi")
d.T(["#", "Defekti", "Shkaku", "Rregullimi"], [
    ["1", "check_availability tregonte dhoma të lira që ishin të zëna", "Funksioni ekzekutohej me të drejtat e përdoruesit; RLS i fshihte rezervimet e të tjerëve", "SECURITY DEFINER me search_path fiks; test T7 e mbron"],
    ["2", "Parashikimi i të ardhurave jepte 0 për natën e sotme", "w = exp(-L/τ) në L=0 shënonte gabimisht gjithçka si të rezervuar", "w = exp(-(L+1)/τ); test lead 0"],
    ["3", "Alarmi 'underbooked_peak' nuk shfaqej në test", "Testi përdorte rezervime të pamjaftueshme të vërteta", "Testi u rregullua me rezervime reale në OTB"],
    ["4", "Backtest me rrjedhje të informacionit (data leak)", "Rezervimet e ditës së parashikimit përfshiheshin në fotografinë e njohur", "Kushti bookDay < day"],
], [0.8, 5.0, 5.8, 5.0])
d.H("5. Validimi i modeleve (jo vetëm 'kalon/dështon')")
d.P("Simulatori dhe parashikuesi nuk kanë 'përgjigje të saktë' që mund të krahasohet me një assert, prandaj vlerësohen statistikisht.")
d.UL(["Simulatori: 100 seed-e, intervale besimi 95%, të njëjtët mysafirë për secilën strategji (common random numbers). Çmimi dinamik fiton +3.6% mbi çmimin fiks (98 nga 100 seed-e), por vetëm +0.74% mbi rregullat sezonale; përfitimi shuhet kur hoteli është i mbushur (zënia ≥ 72%) dhe rregullat humbasin kur kërkesa është shumë e dobët.",
      "Parashikuesi: MAE i zënies në ditët 0–7 është 6.3 pikë përqindjeje (kundrejt 18.2 vetëm me a-priori); në 61–89 ditë parashikimi nuk është më i mirë se a-priori (17.7 kundrejt 18.5). Pra: afër datës ndihmon shumë, larg datës jo.",
      "Këto rezultate vlejnë për kërkesën sintetike të modelit. Nuk provojnë se i njëjti përfitim ekziston në tregun real."])
d.H("6. Testimi manual i ndërfaqes (lista për t'u ekzekutuar)")
d.P("Këto prova nuk janë bërë ende dhe duhet të plotësohen para dorëzimit (Kalon / Dështon / Koment):")
d.T(["#", "Skenari", "Pritja", "Rezultati"], [
    ["M1", "Rezervim me datat e lira dhe pagesë me 4242…", "Rezervimi 'E konfirmuar' te 'Rezervimet e mia'", "[ ]"],
    ["M2", "Pagesë me 4000 0000 0000 0002", "Mesazh gabimi, rezervimi mbetet 'në pritje'", "[ ]"],
    ["M3", "Rezervim mbi datat e zëna", "Mesazh 'Dhoma nuk është e lirë'", "[ ]"],
    ["M4", "Chatbot: kërkesë, kontroll, rezervim", "Çmim real; rezervim vetëm pas 'po'", "[ ]"],
    ["M5", "Chatbot pa ANTHROPIC_API_KEY", "Mesazh 'nuk është konfiguruar'", "[ ]"],
    ["M6", "Host: gjenero dhe prano rekomandim", "Çmimi i ri shfaqet te widget-i i rezervimit", "[ ]"],
    ["M7", "Përdorues pa rol host hap /host", "Nuk sheh të dhënat e të tjerëve", "[ ]"],
    ["M8", "/simulator me parazgjedhje", "Rezultate të ngjashme me 3.6% / 0.74%", "[ ]"],
    ["M9", "/host/revenue në modalitetin demo", "Grafik, KPI dhe sinjalizime shfaqen", "[ ]"],
    ["M10", "/planner me kërkesë të thjeshtë", "Itinerar me hartë; qëndrimet e pavlefshme hidhen poshtë", "[ ]"],
    ["M11", "Telefon (390 px): kryefaqja, rezervimi, pagesa", "Pa scroll horizontal; butonat të arritshëm", "[ ]"],
], [1.0, 6.0, 6.8, 2.8])
d.H("7. Testimi me përdorues (për t'u kryer)")
d.P("Kërkesa e lëndës është 2–3 përdorues. Ky seksion është protokolli; rezultatet duhet të plotësohen nga studenti pas seancave reale — nuk janë shpikur këtu.")
d.UL(["Detyrat (pa udhëzime të hollësishme): gjej një vilë për 4 vetë për fundjavën; rezervo dhe paguaj; bëj të njëjtën gjë me chatbot-in.",
      "Matet: a e kryen (po/jo), koha, numri i gabimeve/hezitimeve, çfarë nuk kuptoi.",
      "Pas seancës: 3 pyetje: çfarë ishte e paqartë? a e besoi çmimin? a e kuptoi se pagesa është provë?"])
d.T(["Përdoruesi", "Detyra 1", "Detyra 2", "Koha", "Vërejtje"], [["P1", "", "", "", ""], ["P2", "", "", "", ""], ["P3", "", "", "", ""]], [2.6, 3.0, 3.0, 2.4, 5.6])
d.H("8. Dokumentimi i projektit")
d.UL(["docs/PLANI_DHE_IDETE.md: arkitektura, vendosja (deploy), çfarë është verifikuar.", "docs/WOW_FEATURES.md: shpjegim i thjeshtë i veçorive të avancuara.",
      "docs/diagrams/: UML, ER, sekuenca (burimi .mmd + PNG).", "supabase/tests/: testet SQL të ri-ekzekutueshme.", "docs/results/: rezultatet e simulimit dhe backtest-it (JSON)."])
d.save(sys.argv[1])
