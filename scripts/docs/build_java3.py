import sys; sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import Doc, TITLE
ROOT = "/home/claude/kosovabnb/docs"
d = Doc("PROJEKT – JAVA 3", "Wireframe-t, prototipi dhe plani i punës me Git")
d.H("1. Qëllimi i këtij dokumenti", 16)
d.P("Ky dokument përmbush Javën 3 të planit: skicat e ndërfaqes (wireframe), përshkrimin e prototipit të punuar dhe organizimin e punës me Git/GitHub. "
    "Ndryshe nga një prototip në Figma, këtu prototipi është vetë aplikacioni i punuar (React) mbi ndërfaqen ekzistuese të KosovaBNB; wireframe-t janë skicat që ndjekin faqet e reja.")
d.H("2. Wireframe-t")
d.P("Tetë ekranet kryesore janë skicuar në nivel të ulët (pa ngjyra e pa foto), në mënyrë që diskutimi të përqendrohet te struktura dhe rrjedha, jo te dizajni vizual.")
caps = [("01_kryefaqja", "Wireframe 1. Kryefaqja: kërkim dhe lista e pronave; chatbot-i si buton i qëndrueshëm"),
        ("02_prona", "Wireframe 2. Faqja e pronës me widget-in e rezervimit (çmimi dinamik, totali)"),
        ("03_pagesa", "Wireframe 3. Pagesa e simuluar me paralajmërim të qartë 'Mënyrë provë'"),
        ("04_chatbot", "Wireframe 4. Chatbot-i AI: biseda që përfundon me rezervim"),
        ("05_host", "Wireframe 5. Paneli i host-it: rezervimet dhe rekomandimet e çmimit"),
        ("06_revenue", "Wireframe 6. Revenue Manager: parashikim 90-ditor, 'po sikur', sinjalizime"),
        ("07_simulator", "Wireframe 7. Simulatori i çmimeve me kufizimet e dukshme"),
        ("08_planner", "Wireframe 8. Planifikuesi i udhëtimit me hartë dhe rezervim të përbashkët")]
for n, c in caps: d.IMG(f"{ROOT}/wireframes/{n}.png", 14.5, c)
d.H("3. Rrjedha e përdoruesit (user flow)")
d.T(["Rrjedha", "Hapat", "Faqja/komponenti"], [
    ["Rezervim i drejtpërdrejtë", "Kërko → hap pronën → zgjidh datat → kontrollo disponueshmërinë → Rezervo → (hyrje nëse nuk je i kyçur) → Paguaj → konfirmim", "Index → ListingPage/BookingWidget → CheckoutPage"],
    ["Rezervim me chatbot", "Hap asistentin → përshkruaj kërkesën → AI kërkon e verifikon → konfirmim 'po' → lidhja e pagesës", "ChatWidget → edge function chat → CheckoutPage"],
    ["Host: çmimi", "Hap panelin → zgjidh pronën → shiko rekomandimet → Prano/Refuzo", "HostDashboardPage"],
    ["Host: parashikim", "Revenue Manager → zgjidh datën në grafik → rrëshqitësi 'po sikur'", "RevenueManagerPage"],
    ["Udhëtim me AI", "Përshkruaj → Planifiko → shiko hartën dhe qëndrimet → Rezervo të gjitha", "PlannerPage → edge function trip-planner"],
], [3.3, 9.0, 4.3])
d.H("4. Prototipi i punuar: çfarë mund të provohet")
d.T(["Faqja", "Rruga", "Statusi"], [
    ["Pagesa e simuluar", "/checkout/:id", "Kodi gati; testuar logjika e bazës (SQL) dhe formatimi i kartës (unit)"],
    ["Rezervimet e mia", "/bookings", "Kodi gati; kontrolluar sintaksa"],
    ["Paneli i host-it", "/host", "Kodi gati; kontrolluar sintaksa"],
    ["Revenue Manager", "/host/revenue", "Logjika e parashikimit e testuar (unit + backtest); UI e pa-ekzekutuar në shfletues"],
    ["Simulatori", "/simulator", "Motori i testuar (unit, 100 seed-e); UI e pa-ekzekutuar në shfletues"],
    ["Planifikuesi", "/planner", "Edge function dhe UI të shkruara; kërkon ANTHROPIC_API_KEY dhe deploy"],
], [4.0, 3.5, 9.1])
d.P("Shënim i ndershëm: në mjedisin ku u shkrua kodi nuk ishte e mundur `npm install` dhe hapja e shfletuesit, prandaj ndërfaqja është verifikuar vetëm sintaksisht. Para demos nevojitet `npm install && npm run build` dhe një provë manuale e secilës rrjedhë.")
d.H("5. Plani i punës me Git dhe GitHub Projects")
d.H("5.1 Degët (branching)", 11)
d.UL(["`main`: gjithmonë i vendosshëm (deploy-able); ndryshimet hyjnë vetëm me Pull Request.",
      "`feature/<tema>` për çdo pjesë pune (p.sh. feature/weeks-3-8); `fix/<tema>` për korrigjime.",
      "Një PR për temë të përfunduar, me përshkrim, listën e testeve dhe çfarë NUK është verifikuar.",
      "Merge me 'squash' ose merge commit; degët e mbyllura fshihen."])
d.H("5.2 Mesazhet e commit-eve", 11)
d.P("Format i shkurtër: folje në kohë të tashme + çfarë dhe pse. Shembuj: 'Shton rezervimin me constraint kundër mbivendosjes', 'Rregullon check_availability që nuk shihte rezervimet e të tjerëve'.")
d.H("5.3 Tabela e GitHub Projects", 11)
d.T(["Kolona", "Kuptimi", "Rregull"], [
    ["Backlog", "Të gjitha idetë dhe detyrat e planit 8-javor", "Çdo detyrë ka issue me kriter pranimi"],
    ["Java aktuale", "Detyrat e javës në vazhdim", "Maksimumi 3 të hapura njëkohësisht"],
    ["Në punë", "Dikush po punon (ka degë)", "Lidhet me PR draft"],
    ["Në rishikim", "PR i hapur, pret rishikim/teste", "Teste të gjelbra para merge"],
    ["Gati", "I bashkuar në main", "Mbyllet issue automatikisht (Closes #n)"],
], [3.0, 6.5, 7.1])
d.H("5.4 Milestone-t sipas javëve", 11)
d.T(["Java", "Milestone", "Dorëzimi"], [
    ["1", "Dokumenti fillestar", "Java1_Dokumenti_Fillestar_KosovaBNB.docx"],
    ["2", "Projektimi", "UML, ER, API (Java2_*.docx)"],
    ["3", "Prototipi", "Ky dokument + wireframe-t"],
    ["4", "Backend bazë", "Migrimet, funksionet SQL, RLS"],
    ["5", "Demo 50%", "Rezervim + pagesë e simuluar"],
    ["6", "AI", "Chatbot, rekomandim çmimi, siguria"],
    ["7", "Teste + dokumentim", "Java7_Raporti_Testimit_KosovaBNB.docx"],
    ["8", "Final", "Java8_Raporti_Final_KosovaBNB.docx + slides"],
], [1.5, 5.0, 10.1])
d.save(sys.argv[1])
