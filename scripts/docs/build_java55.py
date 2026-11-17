import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import Doc
D = "/home/claude/kosovabnb/docs"
d = Doc("PROJEKT – JAVA 5.5", "Dokumentim i ndërmjetëm: çfarë u bë dhe çfarë ndryshoi pas Javës 5")

d.H("1. Pse e shkruaj këtë dokument", 15)
d.P("Pas dorëzimit të Javës 5 (demoja 50%) projekti ndryshoi shumë. Disa gjëra i shtova sepse ishin planifikuar për Javën 6, por disa i ndryshova sepse diçka nuk punonte ose sepse ndërrova mënyrën si e publikoj aplikacionin. Këtu i shënoj të gjitha në një vend: çfarë kishte para, çfarë ka tani, çfarë problemesh hasa dhe çfarë mbetet.")

d.H("2. Ku ishim në fund të Javës 5")
d.UL(["Baza e të dhënave në Supabase me tabelat, rregullat e qasjes dhe funksionet SQL për disponueshmërinë, çmimin dhe rezervimin.",
      "Rezervim i plotë nga ndërfaqja, me pagesë të simuluar dhe faqen 'Rezervimet e mia'.",
      "Paneli bazë i host-it.",
      "Aplikacioni ishte i lidhur me platformën Lovable, që e ndërtonte dhe e publikonte automatikisht nga GitHub."])

d.H("3. Çfarë shtova që nga Java 5")
d.T(["Pjesa", "Çfarë bën", "Ku është në kod"], [
    ["Chatbot AI", "Përgjigjet në shqip dhe anglisht, kërkon prona, kontrollon disponueshmërinë dhe çmimin nga baza dhe e çon përdoruesin te pagesa", "api/chat.ts, ChatWidget.tsx"],
    ["Rekomandimi i çmimit", "Llogarit çmim për çdo natë me rregulla dhe shton shpjegim me AI; hosti e pranon ose e refuzon", "api/price-recommend.ts, HostDashboardPage"],
    ["Planifikuesi i udhëtimit", "Nga një përshkrim bën itinerar me disa qytete dhe prona; serveri e verifikon çdo qëndrim", "api/trip-planner.ts, PlannerPage"],
    ["Simulatori i çmimeve", "Krahason çmim fiks, rregulla sezonale dhe çmim dinamik mbi një vit sintetik", "SimulatorPage, src/lib/simulation"],
    ["Revenue Manager", "Parashikon zënien për 90 ditë dhe provon skenarë 'po sikur'", "RevenueManagerPage, src/lib/forecast.ts"],
    ["Asistenti dhe planifikuesi bazë", "Punojnë pa AI, me rregulla mbi pronat reale, kur AI nuk është e disponueshme", "local-assistant.ts, local-planner.ts"],
    ["Dizajni i ri", "Kryefaqe e re me hero, kërkim me AI, qytetet, hapat 'Si funksionon'", "Index.tsx, index.css"],
    ["Mjete vetëm për host", "Simulatori dhe Revenue Manager shfaqen vetëm për host ose admin", "useIsHost.ts"],
    ["Më shumë vendbanime", "69 prona shtesë në 18 qytete të Kosovës, me dhoma, çmime dhe koordinata", "migrations/20261117000000_more_listings.sql"],
], [3.6, 8.2, 4.8])

d.H("4. Arkitektura tani")
d.IMG(f"{D}/diagrams/arch.png", 15, "Figura 1. Arkitektura e përgjithshme (logjika e biznesit mbetet në bazë)")
d.P("Ndryshimi kryesor në arkitekturë është se funksionet e AI-së nuk ekzekutohen më vetëm si Supabase Edge Functions. Tani ka edhe kopje si funksione Vercel në dosjen `api/`, dhe ndërfaqja i thërret këto fillimisht. Kodi i tyre gjenerohet nga i njëjti burim (`scripts/gen-api.mjs`), kështu që logjika nuk dyfishohet me dorë.")
d.IMG(f"{D}/diagrams/seq_chat.png", 14.5, "Figura 2. Rrjedha e chatbot-it")

d.H("5. Problemet që hasa dhe si i zgjidha")
d.P("Këtë pjesë e shkruaj me hollësi sepse pjesa më e madhe e kohës shkoi këtu, jo te funksionet e reja.")
d.T(["Problemi", "Shkaku", "Zgjidhja"], [
    ["Ndryshimet nuk dukeshin në faqe", "Pull Request-et nuk ishin bashkuar në main dhe funksionet nuk ishin dislokuar", "Çdo ndryshim tani bashkohet në main menjëherë; Vercel e ndërton automatikisht"],
    ["Instalimi në Vercel dështoi (ERESOLVE)", "react-leaflet@5 kërkon React 19, ndërsa projekti përdor React 18", "Skedari .npmrc me legacy-peer-deps=true"],
    ["Chatbot-i kërkonte kredite OpenAI", "Isha lidhur me OpenAI, që nuk është falas", "Kalova te Groq, që ka nivel falas; çelësi vetëm në server"],
    ["'Failed to send a request to the Edge Function'", "Funksionet nuk ishin dislokuar në projektin Supabase", "Shtova diagnostikim në ndërfaqe dhe më pas funksionet në Vercel"],
    ["Groq: model_not_found", "Modelet llama-3.3-70b dhe llama-3.1-8b u mbyllën nga Groq më 16.08.2026", "Kalova te openai/gpt-oss-120b me rezervë gpt-oss-20b"],
    ["Funksioni Vercel dështonte (FUNCTION_INVOCATION_FAILED)", "Projekti është ESM dhe importet pa shtesë .js nuk gjendeshin", "Importet me .js dhe kapje gabimesh që kthen JSON"],
    ["Çelësi Groq mungonte në Vercel", "Ishte vendosur vetëm te platforma e vjetër", "E shtova si variabël 'sensitive' në Vercel"],
], [4.6, 6.0, 6.0])

d.H("6. Vendimi për platformën")
d.P("Fillimisht aplikacioni ishte i lidhur me Lovable, por ai e ndërronte kodin vetë dhe e ribënte disa pjesë që unë i kisha rregulluar, p.sh. skedarin e AI-së. Për këtë arsye vendosa ta publikoj në Vercel, i lidhur me GitHub, dhe të mbaj Supabase vetëm për bazën e të dhënave dhe kyçjen. Hoqa nga kodi varësitë e Lovable. Lidhjen në anën e Lovable e shkëput vetë nga cilësimet e tyre.")

d.H("7. Si e provova")
d.UL(["Teste njësie për çmimin, parashikimin, simulimin, asistentin dhe planifikuesin lokal.",
      "15 grupe kontrollesh SQL mbi PostgreSQL lokal, të cilat kalojnë. Skedari i 69 vendbanimeve u provua gjithashtu: ekzekutimi i dytë nuk shton asgjë.",
      "Faqen e kontrolloj me dorë te adresa e Vercel, duke parë gabimin që tregon chatbot-i kur diçka dështon."])
d.P("Ndërfaqja e re u kontrollua më shumë me kod sesa me përdorim real në shfletues. Për këtë arsye listën e provave me dorë e mbaj në dokumentin e Javës 7 dhe e plotësoj pasi t'i bëj.")

d.H("8. Çfarë mbetet")
d.UL(["Të vërtetoj që chatbot-i punon me Groq në adresën e publikuar dhe të ndryshoj çelësin, sepse u tregua në një bisedë.",
      "Të ekzekutoj skedarin SQL me vendbanimet e reja te Supabase.",
      "Testimi me 2–3 përdorues realë dhe plotësimi i rezultateve në Javën 7.",
      "Të mbyll rrugët /simulator dhe /host/revenue edhe në anën e serverit; tani vetëm lidhjet fshihen për jo-host.",
      "Pagesa mbetet simulim; pagesë reale kërkon ofrues të jashtëm."])

d.H("9. Përdorimi i mjeteve AI")
d.P("Për të shkruar një pjesë të madhe të kodit dhe dokumenteve përdora një asistent AI (Claude). Kërkesat, idetë, vendimet për teknologjinë dhe testimin e rezultateve i kam marrë dhe i kam kontrolluar vetë. Këtë e deklaroj hapur, sipas rregullave të lëndës.")
d.save(f"{D}/Java5_5_Dokumentim_Ndermjetem_KosovaBNB.docx")
print("ok")
