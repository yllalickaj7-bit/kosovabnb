import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import Doc
D = "/home/claude/kosovabnb/docs"
OUT = D
def new(n, sub): return Doc(f"PROJEKT – JAVA {n}", sub)

# ---------------- JAVA 1 ----------------
d = new(1, "Dokumenti fillestar i projektit")
d.H("1. Përshkrimi i problemit", 15)
d.P("Pronarët e hoteleve, motelave, vilave dhe apartamenteve të vogla në Kosovë rezervimet i menaxhojnë ende me telefon, WhatsApp dhe fletore. Kjo sjell rezervime të dyfishta, përgjigje të vonuara ndaj mysafirëve, sidomos jashtë orarit të punës, dhe çmime që vendosen sipas përvojës ose me hamendje: shumë të ulëta në sezon të lartë dhe shumë të larta kur kërkesa është e dobët.")
d.P("Nga ana tjetër, mysafiri nuk ka një vend ku të shohë disponueshmërinë reale, ta marrë çmimin përfundimtar dhe të rezervojë menjëherë në shqip. Në KosovaBNB, faqen që e kisha ndërtuar më parë si ndërfaqe, rezervimi përfundonte vetëm me hapjen e një mesazhi në WhatsApp, pa kontroll të disponueshmërisë dhe pa asnjë evidencë në bazën e të dhënave. Këtë e shoh si pikën kryesore që duhet rregulluar.")
d.H("2. Qëllimi i projektit")
d.P("Qëllimi im është ta zgjeroj KosovaBNB nga një faqe vitrinë në një sistem të plotë për menaxhimin e hotelit. Sistemi duhet të menaxhojë dhomat dhe disponueshmërinë, të pranojë rezervime online pa mbivendosje, ta simulojë pagesën, t'u përgjigjet mysafirëve përmes një chatbot-i AI dhe t'i rekomandojë pronarit çmimin e duhur për çdo natë.")
d.H("3. Përdoruesit")
d.T(["Roli", "Çfarë bën në sistem"], [
    ["Mysafiri", "Kërkon prona, shikon disponueshmërinë dhe çmimin, rezervon, paguan (simulim) dhe flet me chatbot-in"],
    ["Pronari (host)", "Menaxhon pronat dhe dhomat, shikon rezervimet, pranon ose refuzon rekomandimet e çmimit"],
    ["Administratori", "Menaxhon rolet dhe të gjitha pronat"],
], [3.5, 13.1])
d.H("4. Sistemet ekzistuese dhe çfarë u mungon")
d.P("Para se të nisja i shikova disa zgjidhje që ekzistojnë. Booking.com dhe Airbnb kanë audiencë të madhe, por marrin komision të lartë dhe çmimin e vendos vetë pronari. Sistemet PMS si Cloudbeds ose Mews janë të plota por të shtrenjta dhe të ndërlikuara për një pronar të vogël, dhe zakonisht nuk kanë shqip. Mjetet e çmimit dinamik, si PriceLabs, japin sugjerime çmimi por janë shërbim i veçantë me abonim, i palidhur me rezervimin. Praktika që përdoret sot, telefoni dhe WhatsApp-i, është e thjeshtë por nuk ka disponueshmëri reale dhe sjell rezervime të dyfishta.")
d.H("5. Çfarë sjell sistemi im")
d.UL(["Një vend i vetëm për rezervim, disponueshmëri, pagesë dhe komunikim, në shqip.",
      "Rezervimet e dyfishta bëhen të pamundura që në bazën e të dhënave, jo vetëm në ndërfaqe.",
      "Chatbot që përgjigjet me të dhëna reale, jo me çmime të shpikura.",
      "Rekomandim çmimi me shpjegim, brenda kufijve që i vendos vetë pronari. Vendimin e merr njeriu."])
d.H("6. Funksionet kryesore")
d.T(["Nr.", "Funksioni", "Prioriteti"], [
    ["F1", "Regjistrim, hyrje dhe role (mysafir, host, admin)", "MVP"],
    ["F2", "Menaxhimi i pronave dhe dhomave nga host-i", "MVP"],
    ["F3", "Kërkimi dhe kontrolli i disponueshmërisë sipas datave dhe mysafirëve", "MVP"],
    ["F4", "Rezervimi me çmim të llogaritur në server dhe pa mbivendosje", "MVP"],
    ["F5", "Pagesë e simuluar (karta provë) dhe konfirmim", "MVP"],
    ["F6", "Chatbot AI për pyetje, disponueshmëri, çmim dhe rezervim", "MVP"],
    ["F7", "Rekomandim çmimi me AI dhe pranim/refuzim nga host-i", "MVP"],
    ["F8", "Paneli i host-it: rezervimet, zënia, të ardhurat", "I dytë"],
    ["F9", "Vlerësime nga mysafirët pas qëndrimit", "I dytë"],
    ["F10", "Njoftime me email dhe kalendar i dhomave", "Opsional"],
], [1.4, 12.2, 3.0])
d.P("Kërkesat jo-funksionale që i vendosa vetes: siguria (rregulla qasjeje në çdo tabelë, asnjë numër i vërtetë karte, çelësat e AI vetëm në server), një përgjigje e chatbot-it brenda pak sekondave, ndërfaqe që punon edhe në telefon, dhe mbështetje për shqip e anglisht.")
d.H("7. Roli i AI-së")
d.P("AI e përdor në dy vende dhe në të dyja i vendosa kufij që sistemi të mbetet i besueshëm. Te chatbot-i, modeli kupton pyetjen në shqip ose anglisht dhe thërret funksione të sistemit për disponueshmërinë dhe çmimin. Rezervimi krijohet vetëm kur mysafiri e konfirmon qartë. Te rekomandimi i çmimit, çmimin e llogarit një formulë me rregulla (sezoni, fundjava, zënia, sa ditë mbeten) dhe rezultati kufizohet midis çmimit minimal dhe maksimal. Modeli gjuhësor shton vetëm shpjegimin në fjali të thjeshta.")
d.H("8. Teknologjitë dhe plani")
d.P("Frontend-i ekziston: React, Vite, TypeScript, Tailwind dhe shadcn/ui. Për backend zgjodha Supabase (PostgreSQL, Auth, Edge Functions). Versionimi bëhet me Git dhe GitHub.")
d.T(["Java", "Dorëzimi", "Çfarë bëhet"], [
    ["1", "Dokumenti fillestar", "Analiza, kërkesat dhe roli i AI-së"], ["2", "Projektimi", "UML, ER dhe API"],
    ["3", "Prototipi", "Wireframe, Git dhe plani i punës"], ["4", "Backend bazë", "Migrimet, rolet, rezervimet, disponueshmëria"],
    ["5", "Demo 50%", "Rezervim i plotë me pagesë të simuluar"], ["6", "AI dhe siguria", "Chatbot, rekomandim çmimi, role në vend të panelit të vjetër"],
    ["7", "Testimi", "Teste automatike, testim me përdorues, dokumentim"], ["8", "Finali", "Aplikacioni, raporti, prezantimi"],
], [1.4, 4.2, 11.0])
d.save(f"{OUT}/Java1_Dokumenti_Fillestar_KosovaBNB.docx")

# ---------------- JAVA 2 ----------------
d = new(2, "Dokumenti i projektimit (UML, ER, API)")
d.H("1. Arkitektura", 15)
d.P("Sistemi është aplikacion web. Klienti i bërë me React flet drejtpërdrejt me Supabase për të dhënat dhe hyrjen në llogari. Gjërat që duhet t'u besohen vetëm serverit, si disponueshmëria, çmimi, rezervimi dhe pagesa e simuluar, i vendosa në bazën e të dhënave si funksione SQL. Chatbot-i dhe shpjegimet e çmimit janë Edge Functions që flasin me modelin e AI-së, dhe çelësi i AI-së qëndron vetëm në server.")
d.IMG(f"{D}/diagrams/arch.png", 15.5, "Figura 1. Arkitektura e përgjithshme")
d.H("2. Rastet e përdorimit")
d.IMG(f"{D}/diagrams/usecase.png", 12.5, "Figura 2. Aktorët dhe rastet e përdorimit")
d.P("Aktorët janë mysafiri, host-i dhe administratori. Rezervimi përfshin kontrollin e disponueshmërisë dhe hyrjen në llogari, ndërsa pagesa e simuluar zgjerohet nga rezervimi.")
d.H("3. Klasat")
d.IMG(f"{D}/diagrams/class.png", 15.5, "Figura 3. Klasat kryesore")
d.P("Klasat e domenit përputhen me tabelat. Shërbimet (rezervimi, pagesa, çmimi) i realizova si funksione SQL, ndërsa chatbot-i si Edge Function.")
d.H("4. Sekuencat")
d.IMG(f"{D}/diagrams/seq_booking.png", 14.5, "Figura 4. Rezervimi dhe pagesa e simuluar")
d.P("Kur klienti dërgon rezervimin, serveri e llogarit vetë çmimin, kështu që çmimi që vjen nga ndërfaqja nuk ka rëndësi. Kufizimi në bazë refuzon çdo mbivendosje, edhe nëse dy përdorues provojnë në të njëjtën kohë.")
d.IMG(f"{D}/diagrams/seq_chat.png", 14.5, "Figura 5. Chatbot-i: kërkim, kontroll dhe rezervim")
d.IMG(f"{D}/diagrams/seq_price.png", 14.5, "Figura 6. Rekomandimi i çmimit dhe vendimi i host-it")
d.H("5. Baza e të dhënave")
d.IMG(f"{D}/diagrams/er.png", 16, "Figura 7. Diagrami ER")
d.T(["Tabela", "Qëllimi", "Rregulla kyçe"], [
    ["listings", "Prona (ekzistonte)", "owner_id; krijon vetëm host/admin"],
    ["rooms", "Njësi e rezervueshme", "çmim bazë, minimal, maksimal"],
    ["bookings", "Rezervimet", "EXCLUDE: asnjë mbivendosje për të njëjtën dhomë"],
    ["payments", "Pagesa e simuluar", "vetëm 4 shifrat e fundit; klienti nuk shkruan direkt"],
    ["pricing_rules", "Sezoni, fundjava, festat, last-minute", "shumëzues midis 0 dhe 5"],
    ["room_price_overrides", "Çmimi i miratuar për një natë", "ka përparësi mbi rregullat"],
    ["price_recommendations", "Sugjerimet e AI", "faktorët si JSON, statusi"],
    ["chat_conversations, chat_messages", "Historiku i chatbot-it", "shkruhet vetëm nga serveri"],
    ["user_roles, profiles, reviews", "Rolet, profili, vlerësimet", "vlerësim vetëm për rezervim të përfunduar"],
], [4.2, 4.6, 7.8])
d.H("6. API-ja")
d.T(["Emri", "Çfarë bën", "Kush e thërret"], [
    ["check_availability", "Dhomat e lira për datat dhe mysafirët", "Të gjithë"],
    ["quote_stay", "Netë, nëntotal, tarifë shërbimi, total", "Të gjithë"],
    ["create_booking", "Validon dhe krijon rezervim në pritje", "Përdorues i kyçur"],
    ["simulate_payment", "Pagesa provë; konfirmon rezervimin", "Pronari i rezervimit"],
    ["generate_price_recommendations", "Sugjerime çmimi", "Host/admin"],
    ["decide_price_recommendation", "Pranim ose refuzim", "Host/admin"],
    ["chat (Edge Function)", "Chatbot me thirrje funksionesh", "Të gjithë"],
    ["price-recommend (Edge Function)", "Sugjerime me shpjegim", "Host/admin"],
], [5.2, 7.4, 4.0])
d.H("7. Siguria")
d.UL(["Rregullat e qasjes (RLS) në çdo tabelë: mysafiri sheh vetëm rezervimet e veta, host-i vetëm ato të pronave të tij.",
      "Çmimi, disponueshmëria dhe pagesa llogariten në bazë, jo te klienti.",
      "Pagesa është simulim; asnjë numër i plotë karte nuk ruhet.",
      "Paneli i vjetër i adminit, me fjalëkalim të shkruar në kod, e zëvendësova me hyrje me llogari dhe rol admin."])
d.save(f"{OUT}/Java2_Dokumenti_Projektimit_KosovaBNB.docx")

# ---------------- JAVA 3 ----------------
d = new(3, "Wireframe-t, prototipi dhe plani me Git")
d.H("1. Çfarë bëra këtë javë", 15)
d.P("Këtë javë i skicova ekranet kryesore, e përshkrova prototipin dhe e organizova punën me Git dhe GitHub. Prototipi nuk është në Figma: e ndërtova drejtpërdrejt si aplikacion React mbi ndërfaqen ekzistuese të KosovaBNB, kështu që skicat janë udhërrëfyes për atë që ndërtoj.")
d.H("2. Wireframe-t")
for n, c in [("01_kryefaqja", "Kryefaqja: kërkimi dhe lista e pronave"), ("02_prona", "Faqja e pronës me widget-in e rezervimit"),
             ("03_pagesa", "Pagesa e simuluar"), ("04_chatbot", "Chatbot-i AI"), ("05_host", "Paneli i host-it"),
             ("06_revenue", "Revenue Manager"), ("07_simulator", "Simulatori i çmimeve"), ("08_planner", "Planifikuesi i udhëtimit")]:
    d.IMG(f"{D}/wireframes/{n}.png", 14, f"Wireframe: {c}")
d.H("3. Rrjedha e përdoruesit")
d.P("Rrjedha kryesore është: kërkon, hap pronën, zgjedh datat, kontrollon disponueshmërinë, rezervon, kyçesh nëse nuk je i kyçur, paguan dhe e sheh konfirmimin. Rrjedha e dytë nis nga chatbot-i, që e çon përdoruesin te e njëjta faqe pagese. Hosti hyn në panel, sheh rekomandimet e çmimit dhe i pranon ose i refuzon.")
d.H("4. Git dhe GitHub")
d.P("Dega `main` mbahet gjithmonë e gatshme për publikim. Çdo punë e re bëhet në një degë të veçantë (feature/ ose fix/) dhe hyn në `main` vetëm me Pull Request. Mesazhet e commit-eve i shkruaj shkurt dhe të qarta, p.sh. 'Shton rezervimin me kufizim kundër mbivendosjes'. Detyrat i mbaj në një tabelë GitHub Projects me kolonat Backlog, Java aktuale, Në punë, Në rishikim dhe Gati.")
d.T(["Java", "Milestone", "Dorëzimi"], [["1", "Dokumenti fillestar", "Java1_*.docx"], ["2", "Projektimi", "Java2_*.docx"], ["3", "Prototipi", "Ky dokument"],
    ["4", "Backend bazë", "Migrimet dhe funksionet SQL"], ["5", "Demo 50%", "Rezervim + pagesë"], ["6", "AI dhe siguria", "Chatbot, çmimi"],
    ["7", "Testimi", "Java7_*.docx"], ["8", "Finali", "Raporti dhe prezantimi"]], [1.4, 5.0, 10.2])
d.save(f"{OUT}/Java3_Prototipi_dhe_Plani_KosovaBNB.docx")

# ---------------- JAVA 4 ----------------
d = new(4, "Backend-i bazë")
d.H("1. Çfarë bëra", 15)
d.P("Këtë javë e ndërtova pjesën që nuk shihet por mban gjithçka: bazën e të dhënave. Shkrova dy migrime SQL për Supabase. I pari krijon tabelat (dhoma, rezervime, pagesa, rregulla çmimi, rekomandime, bisedat e chatbot-it, rolet, profilet dhe vlerësimet), rregullat e qasjes dhe çaktivizuesin që i jep çdo përdoruesi të ri rolin 'mysafir' dhe profilin. I dyti përmban funksionet e biznesit.")
d.H("2. Vendimet kryesore")
d.P("Rezervimet e dyfishta i parandalova me një kufizim të bazës (EXCLUDE me gist mbi dhomën dhe periudhën), jo me kod në ndërfaqe. Kështu edhe nëse dy persona rezervojnë në të njëjtin sekond, vetëm njëri kalon. Rezervimi i mëparshëm që mbaron kur fillon tjetri (check-out sot, check-in sot) lejohet, sepse netët nuk mbivendosen.")
d.P("Çmimin e llogarit funksioni `nightly_price`: merr çmimin bazë të dhomës, shumëzon me rregullat që vlejnë për atë natë (sezoni, fundjava, festat, last-minute) dhe e kufizon midis çmimit minimal dhe maksimal. Nëse hosti ka pranuar një çmim të veçantë për atë natë, ai ka përparësi.")
d.T(["Funksioni", "Çfarë bën"], [
    ["check_availability", "Kthen dhomat e lira; rezervimet e pa-paguara pas 30 minutash nuk bllokojnë më"],
    ["quote_stay", "Llogarit netët, nëntotalin, tarifën e shërbimit (12%) dhe totalin"],
    ["create_booking", "Validon datat, kapacitetin dhe përdoruesin, pastaj krijon rezervimin 'në pritje'"],
    ["has_role", "Kontrollon rolin pa rënë në rekursion të rregullave"],
], [4.6, 12.0])
d.H("3. Një gabim që e gjeta")
d.P("Kur e provova funksionin `check_availability` si përdorues i zakonshëm, dhoma e zënë dilte e lirë. Shkaku ishte se rregullat e qasjes ia fshihnin përdoruesit rezervimet e të tjerëve, prandaj funksioni nuk i shihte. E rregullova duke e ekzekutuar me të drejtat e funksionit (SECURITY DEFINER) dhe duke i fiksuar rrugën e kërkimit. Pas kësaj shtova një test që e mbron këtë rast.")
d.H("4. Tipet dhe vërtetimi")
d.P("Gjeneroja tipet TypeScript të bazës që ndërfaqja të përdorë emrat e saktë të kolonave. Migrimet i provova në një PostgreSQL të pastër në mjedisin tim të punës: aplikohen pa gabim dhe funksionet sillen siç pritet. Nuk i provova ende në projektin real të Supabase në atë moment.")
d.save(f"{OUT}/Java4_Backend_KosovaBNB.docx")

# ---------------- JAVA 5 ----------------
d = new(5, "Demo e ndërmjetme: rezervim dhe pagesë e simuluar")
d.H("1. Çfarë bëra", 15)
d.P("Këtë javë lidha ndërfaqen me bazën që ndërtova. Faqja e pronës tani nuk hap më WhatsApp: widget-i i rezervimit pyet bazën për dhomat e lira, shfaq çmimin real me tarifën, dhe krijon rezervimin. Pas rezervimit përdoruesi shkon te faqja e pagesës.")
d.H("2. Ekranet e reja")
d.UL(["Pagesa (/checkout/:id): formular me numër karte, skadim dhe CVC. Në krye ka një paralajmërim të qartë 'Mënyrë provë', që askush të mos shkruajë karta të vërteta.",
      "Rezervimet e mia (/bookings): lista e rezervimeve me statusin dhe butonat Paguaj dhe Anulo.",
      "Paneli i host-it (/host): rezervimet e pronave të mia dhe sa janë të zëna.",
      "Faqja e hyrjes u përshtat që pas kyçjes të të kthejë aty ku ishe."])
d.H("3. Si funksionon pagesa e simuluar")
d.P("Pagesa është funksion në bazë (`simulate_payment`). Karta 4242 4242 4242 4242 kalon, 4000 0000 0000 0002 refuzohet, dhe 4000 0000 0000 9995 dështon me fonde të pamjaftueshme. Një kartë e skaduar dështon gjithashtu. Ruhen vetëm katër shifrat e fundit dhe shenja që është simulim. Numri i plotë dhe CVC nuk ruhen kurrë. Kur pagesa kalon, rezervimi bëhet 'i konfirmuar'; kur dështon, mbetet 'në pritje' dhe dhoma lirohet pas 30 minutash.")
d.H("4. Çfarë mbetet pa provuar")
d.P("Kodin e ndërfaqes e kontrollova vetëm sintaksisht dhe me tipet, sepse në mjedisin tim të punës nuk mund të nisja shfletuesin. Logjikën e bazës e provova me teste SQL. Prova e plotë në shfletues me një Supabase real mbetet për t'u bërë dhe e rregulloj kur dalin gabime.")
d.save(f"{OUT}/Java5_Demo_KosovaBNB.docx")

# ---------------- JAVA 6 ----------------
d = new(6, "Chatbot-i AI, rekomandimi i çmimit dhe siguria")
d.H("1. Chatbot-i", 15)
d.P("Chatbot-i është një Edge Function që flet me modelin e gjuhës. Modelit i jep tre funksione: kërko prona, kontrollo disponueshmërinë dhe krijo rezervim. Çmimin dhe disponueshmërinë nuk i shpik kurrë modeli: i merr nga funksionet, që thërrasin bazën. Rezervimi krijohet vetëm pasi mysafiri thotë qartë 'po'. Kufizova gjatësinë e mesazheve, numrin e mesazheve dhe numrin e raundeve të funksioneve, që biseda të mos dalë jashtë kontrollit.")
d.P("Në ndërfaqe shtova një dritare chatbot-i që hapet nga një buton në cep, mban historikun dhe i bën lidhjet e brendshme (p.sh. te pagesa) të klikueshme. Lidhjet e jashtme nuk bëhen të klikueshme për siguri.")
d.H("2. Rekomandimi i çmimit")
d.P("Qasja ime është hibride. Së pari llogariten faktorët me rregulla: sezoni, fundjava, festat, zënia e dritares ±7 ditë dhe sa ditë mbeten deri në qëndrim. Çmimi kufizohet midis minimumit dhe maksimumit. Modeli i gjuhës shton vetëm një fjali shpjegimi. Hosti e sheh sugjerimin me faktorët dhe e pranon ose e refuzon, dhe vendimi ruhet. Nëse modeli nuk është i disponueshëm, sugjerimi del me një shpjegim standard.")
d.H("3. Siguria")
d.P("Paneli i vjetër i adminit përdorte fjalëkalim të shkruar në kod dhe nuk e verifikonte token-in, pra kushdo që dinte adresën mund të krijonte ose fshinte prona. E hoqa dhe e zëvendësova me hyrje me llogari dhe rol 'admin' që kontrollohet në bazë. Fjalëkalimi i vjetër ishte në një repo publike, prandaj e konsideroj të kompromentuar. Çelësat e AI nuk janë kurrë në kodin e ndërfaqes, vetëm në sekretet e serverit.")
d.H("4. Kufizime")
d.P("Chatbot-i dhe shpjegimet varen nga një çelës i vlefshëm AI në server. Pa të, ndërfaqja kalon në një asistent bazë që kërkon pronat me rregulla të thjeshta, pa model gjuhësor.")
d.save(f"{OUT}/Java6_AI_dhe_Siguria_KosovaBNB.docx")

# ---------------- JAVA 7 ----------------
d = new(7, "Testimi dhe dokumentimi")
d.H("1. Si e provova sistemin", 15)
d.P("E ndava testimin sipas rrezikut. Pjesët ku një gabim kushton më shumë (çmimi, disponueshmëria, pagesa, qasja) i provova te baza e të dhënave. Llogaritjet që ekzekutohen në shfletues (çmimi, parashikimi, simulimi) janë kod i pastër dhe i provova me teste njësie. Ndërfaqen dhe lidhjen me AI i provoj me dorë.")
d.T(["Niveli", "Mjeti", "Sasia"], [["Teste njësie", "Vitest", "mbi 50 teste"], ["Baza e të dhënave", "PostgreSQL me ASSERT (supabase/tests)", "15 grupe kontrollesh"],
    ["Modelet", "Simulim dhe backtest", "100 dhe 20 përsëritje"], ["Ndërfaqja dhe AI", "Me dorë", "Lista më poshtë"]], [4.2, 8.0, 4.4])
d.H("2. Testet e bazës")
d.P("Skedari supabase/tests/regression.sql i aplikon të gjitha migrimet mbi një bazë të pastër dhe kontrollon gjërat që më interesojnë: përdoruesi i ri merr rolin guest; rezervimi pa kyçje refuzohet; mbivendosja e datave refuzohet, por 'back-to-back' lejohet; kapaciteti dhe datat e pavlefshme refuzohen; çmimi mbetet brenda kufijve edhe me shumëzues ekstrem; karta e refuzuar dhe fondet e pamjaftueshme dështojnë; numri i plotë i kartës nuk ruhet; një përdorues nuk paguan rezervimin e tjetrit; dhe regullat e qasjes e mbajnë çdo përdorues te të dhënat e veta. Të gjitha këto kalojnë në PostgreSQL lokal.")
d.H("3. Defektet që i gjeti testimi")
d.T(["Defekti", "Shkaku", "Rregullimi"], [
    ["Disponueshmëria tregonte dhoma të zëna si të lira", "Rregullat e qasjes ia fshihnin rezervimet e tjera funksionit", "SECURITY DEFINER dhe test"],
    ["Parashikimi jepte 0 për natën e sotme", "Formula e peshës ishte e gabuar në distancë 0", "Formulë e re dhe test"],
    ["Backtest-i dukej shumë i mirë", "Rezervimet e ditës së parashikimit hynin në informacion", "Përdoren vetëm rezervimet e mëparshme"],
], [5.4, 6.0, 5.2])
d.H("4. Provat që mbeten me dorë")
d.T(["#", "Skenari", "Pritja", "Rezultati"], [
    ["1", "Rezervim me data të lira dhe kartë 4242…", "Rezervimi del i konfirmuar", ""],
    ["2", "Kartë 4000 0000 0000 0002", "Gabim, rezervimi mbetet në pritje", ""],
    ["3", "Rezervim në data të zëna", "Mesazh që dhoma nuk është e lirë", ""],
    ["4", "Chatbot: kërkim dhe rezervim", "Çmim real; rezervim vetëm pas 'po'", ""],
    ["5", "Planifikuesi i udhëtimit", "Itinerar me hartë", ""],
    ["6", "Telefon (390 px)", "Pa scroll horizontal", ""],
], [0.8, 6.0, 6.6, 3.2])
d.H("5. Testimi me përdorues")
d.P("Lënda kërkon 2–3 përdorues. Do t'u jap dy detyra pa udhëzime: të gjejnë një vilë për 4 vetë për fundjavën dhe ta rezervojnë, dhe të provojnë të njëjtën gjë me chatbot-in. Do të shënoj nëse e kryen, sa zgjat dhe ku ngatërrohet. Rezultatet i vendos më poshtë pasi ta bëj me njerëz realë.")
d.T(["Përdoruesi", "Detyra 1", "Detyra 2", "Koha", "Vërejtje"], [["P1", "", "", "", ""], ["P2", "", "", "", ""], ["P3", "", "", "", ""]], [2.6, 3.2, 3.2, 2.4, 5.2])
d.save(f"{OUT}/Java7_Raporti_Testimit_KosovaBNB.docx")

# ---------------- JAVA 8 ----------------
d = new(8, "Raporti final")
d.H("Përmbajtja", 15)
d.UL(["1. Hyrja", "2. Analiza e kërkesave", "3. Projektimi", "4. Implementimi", "5. Veçoritë shtesë", "6. Testimi", "7. Vendosja në internet", "8. Kufizimet", "9. Përfundimi", "10. Referencat"])
d.H("1. Hyrja")
d.P("Pronarët e vegjël në Kosovë rezervimet i bëjnë ende me telefon dhe WhatsApp, çka sjell rezervime të dyfishta dhe çmime të vendosura me hamendje. Në këtë projekt e zgjerova KosovaBNB, një ndërfaqe rezervimesh që e kisha ndërtuar më parë, në një sistem të plotë për menaxhimin e hotelit: rezervim që nuk lejon mbivendosje, pagesë të simuluar, chatbot AI dhe rekomandim çmimi.")
d.H("2. Analiza e kërkesave")
d.P("Kërkesat funksionale janë ato që i shkrova në dokumentin fillestar: kërkimi i pronave, rezervimi me çmim nga serveri, pagesa e simuluar, chatbot-i, rekomandimi i çmimit, rolet, dhe paneli i host-it. Kërkesat që mbaj si më të rëndësishmet janë ato jo-funksionale: asnjë rezervim i dyfishtë, asnjë çelës ose karte e vërtetë te klienti, dhe AI që nuk shpik të dhëna.")
d.H("3. Projektimi")
d.IMG(f"{D}/diagrams/arch.png", 14.5, "Figura 1. Arkitektura")
d.IMG(f"{D}/diagrams/er.png", 14.5, "Figura 2. Modeli i të dhënave")
d.P("Rregullat e biznesit i vendosa në bazën e të dhënave si funksione SQL, që të vlejnë pavarësisht nga ndërfaqja. Pagesa e simuluar është funksion SQL, jo shërbim i jashtëm, kështu që punon pa konfigurim shtesë. Çmimin e vendos një formulë me rregulla; modeli i gjuhës vetëm e shpjegon. Diagramet e tjera (use case, klasat, sekuencat) janë te dokumenti i Javës 2.")
d.H("4. Implementimi")
d.T(["Pjesa", "Teknologjia", "Ku është"], [
    ["Baza dhe logjika", "PostgreSQL, rregulla qasjeje, funksione SQL", "supabase/migrations"],
    ["Rezervim dhe pagesë", "React, React Query", "BookingWidget, CheckoutPage"],
    ["Chatbot", "Edge Function me thirrje funksionesh", "supabase/functions/chat"],
    ["Rekomandim çmimi", "SQL dhe Edge Function", "price-recommend"],
    ["Planifikues udhëtimi", "Edge Function dhe hartë Leaflet", "trip-planner, PlannerPage"],
    ["Simulator dhe parashikim", "TypeScript, Recharts", "src/lib/simulation, forecast"],
], [4.0, 6.4, 6.2])
d.H("5. Veçoritë shtesë")
d.P("Përveç asaj që kërkohej, shtova tri gjëra që më interesonin. Të gjitha i konsideroj eksperimentale dhe e them qartë çfarë provojnë dhe çfarë jo.")
d.P("Simulatori i çmimeve krijon mysafirë sintetikë që rezervojnë një hotel 10-dhomësh për një vit, dhe i provon të njëjtët mysafirë me tri strategji: çmim fiks, rregulla sezonale dhe çmim dinamik. Rezultati është se çmimi dinamik del rreth 3.6% më mirë se çmimi fiks, por vetëm rreth 0.7% më mirë se rregullat sezonale të thjeshta. Kur hoteli mbushet shumë, çmimi dinamik nuk shton asgjë mbi rregullat; kur kërkesa është shumë e dobët, rregullat sezonale mund të dëmtojnë. Kërkesa është sintetike, kështu që këtë e shoh si demonstrim të mekanizmit, jo si provë për tregun real.")
d.T(["Strategjia", "Të ardhura në vit", "Zënia"], [["Çmim fiks", "€189,988 ± 989", "65.1%"], ["Rregulla sezonale", "€195,382 ± 1,166", "59.6%"], ["Çmim dinamik", "€196,821 ± 1,135", "60.9%"]], [5.0, 6.0, 5.6])
d.P("Revenue Manager parashikon zënien për 90 ditët e ardhshme me rezervimet që ekzistojnë dhe sezonalitetin, tregon një interval pasigurie dhe lejon të provohet 'po sikur ndryshoj çmimin me X%'. Në provën me të dhëna historike të simuluara, gabimi mesatar është rreth 6 pikë përqindjeje për 0–7 ditë dhe 10–16 për 8–60 ditë; për 61–89 ditë parashikimi nuk është më i mirë se sezonaliteti i thjeshtë.")
d.P("Planifikuesi i udhëtimit përdor AI-në për të propozuar qytete dhe prona, por serveri i verifikon vetë çdo qëndrim (disponueshmëria dhe çmimi nga baza) dhe hedh poshtë atë që nuk kalon. Nëse AI nuk është aktive, planifikuesi punon me rregulla të thjeshta mbi pronat reale.")
d.H("6. Testimi")
d.P("Kam mbi 50 teste njësie dhe 15 grupe kontrollesh SQL, që kalojnë në mjedisin tim. Ato kapën defekte reale, p.sh. kontrollin e disponueshmërisë që nuk shihte rezervimet e tjera. Detajet janë te dokumenti i Javës 7. Testimin me përdorues dhe provat me dorë në shfletues i kam të shënuara si detyrë që e bëj personalisht.")
d.H("7. Vendosja në internet")
d.P("Aplikacioni lidhet me një projekt Supabase dhe publikohet nga GitHub. Funksionet AI përdorin një model përmes një çelësi që ruhet vetëm si sekret në server. Për të mos paguar, kalova te një ofrues me nivel falas (Groq). Sistemi ka mbrojtje: nëse AI nuk punon, chatbot-i dhe planifikuesi kalojnë në mënyrë bazë dhe nuk shfaqin gabim të plotë.")
d.H("8. Kufizimet")
d.UL(["Simulatori përdor kërkesë sintetike; konstantet janë supozime të mia.",
      "Pagesa është simulim: pa PCI, pa 3-D Secure, pa rimbursime.",
      "Rezervimi i përbashkët i planifikuesit krijon rezervime të veçanta, jo një transaksion të vetëm.",
      "Disa pjesë të ndërfaqes i kam kontrolluar më shumë me kod dhe tipe sesa me përdorim real në shfletues.",
      "Gjatë zhvillimit përdora mjete AI si ndihmë për të shkruar kodin; arkitekturën, kërkesat dhe vendimet i kam marrë vetë dhe i kam rishikuar."])
d.H("9. Përfundimi")
d.P("Rezultati është një sistem rezervimi që garanton në bazë mungesën e rezervimeve të dyfishta, ka pagesë provë të sigurt, chatbot dhe rekomandim çmimi të shpjegueshëm, plus disa mjete shtesë që i provova me kujdes. Më e vlefshme për mua ishte që AI-në e krahasova me zgjidhje të thjeshta dhe e raportova rezultatin siç doli, edhe kur përfitimi ishte i vogël. Hapat e radhës janë një provë e plotë me përdorues dhe me të dhëna reale, dhe pagesë reale përmes një ofruesi.")
d.H("10. Referencat")
d.UL(["Talluri, K. T. dhe van Ryzin, G. J. (2004). The Theory and Practice of Revenue Management. Springer.",
      "Law, A. M. (2015). Simulation Modeling and Analysis (botimi 5). McGraw-Hill.",
      "Dokumentimi i PostgreSQL: Exclusion Constraints dhe Row Security Policies (postgresql.org/docs).",
      "Dokumentimi i Supabase: Auth, Row Level Security, Edge Functions (supabase.com/docs).",
      "Dokumentimi i React, Vite, Tailwind CSS, Recharts dhe Leaflet."])
d.save(f"{OUT}/Java8_Raporti_Final_KosovaBNB.docx")
print("ok")
