import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
ROOT = "/home/claude/kosovabnb/docs"
NAVY = RGBColor(0x1F, 0x3A, 0x5F); RED = RGBColor(0xE6, 0x1E, 0x4D); GREY = RGBColor(0x55, 0x55, 0x55)
p = Presentation(); p.slide_width, p.slide_height = Inches(13.333), Inches(7.5)
blank = p.slide_layouts[6]
def tb(s, x, y, w, h, text, size=20, bold=False, color=None, align=None):
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); f = t.text_frame; f.word_wrap = True
    lines = text if isinstance(text, list) else [text]
    for i, l in enumerate(lines):
        para = f.paragraphs[0] if i == 0 else f.add_paragraph()
        r = para.add_run(); r.text = l; r.font.size = Pt(size); r.font.bold = bold; r.font.name = "Calibri"
        if color: r.font.color.rgb = color
        if align: para.alignment = align
        para.space_after = Pt(8)
    return t
def slide(title, bullets=None, img=None, notes=None):
    s = p.slides.add_slide(blank)
    bar = s.shapes.add_shape(1, 0, 0, p.slide_width, Inches(0.12)); bar.fill.solid(); bar.fill.fore_color.rgb = RED; bar.line.fill.background()
    tb(s, 0.6, 0.35, 12, 0.9, title, 32, True, NAVY)
    if bullets: tb(s, 0.6, 1.5, 6.4 if img else 12, 5.5, ["•  " + b for b in bullets], 20)
    if img: s.shapes.add_picture(img, Inches(7.2), Inches(1.5), width=Inches(5.7))
    if notes: s.notes_slide.notes_text_frame.text = notes
    return s
def table(s, rows, x, y, w, colw, size=16):
    t = s.shapes.add_table(len(rows), len(rows[0]), Inches(x), Inches(y), Inches(w), Inches(0.5 * len(rows))).table
    for j, cw in enumerate(colw): t.columns[j].width = Inches(cw)
    for i, r in enumerate(rows):
        for j, v in enumerate(r):
            c = t.cell(i, j); c.text = str(v)
            for para in c.text_frame.paragraphs:
                for run in para.runs: run.font.size = Pt(size); run.font.bold = (i == 0)
s = p.slides.add_slide(blank)
tb(s, 0.8, 2.0, 11.5, 1.2, "KosovaBNB", 54, True, RED)
tb(s, 0.8, 3.1, 11.5, 1.0, "Sistem Inteligjent për Menaxhimin e Hotelit", 34, True, NAVY)
tb(s, 0.8, 4.3, 11.5, 1.5, ["AI chatbot · rekomandim çmimi · rezervim · pagesë e simuluar", "Inxhinieri Softuerike · Prishtinë 2026/2027", "Mentor: Assoc. Prof. Dr. Engin Melekoğlu · Student: [Emri Mbiemri]"], 20, False, GREY)
slide("Problemi", ["Pronarët e vegjël çmojnë 'me ndjesi': humbin të ardhura në sezon, mbeten bosh jashtë sezonit", "Mysafirët humbin kohë duke krahasuar dhe kontrolluar disponueshmërinë", "Dyfishimi i rezervimeve dhe pagesat e pasigurta janë rreziqe reale", "Pyetja jonë: a mund të ndihmojë AI pa shpikur të dhëna dhe a mund ta provojmë?"])
slide("Çfarë ndërtuam", ["Rezervim me kontroll disponueshmërie dhe çmim nga serveri", "Pagesë e simuluar (karta provë)", "Chatbot AI që kërkon, kontrollon dhe rezervon", "Rekomandim çmimi i shpjegueshëm për host-in", "Simulator, Revenue Manager dhe planifikues udhëtimi me AI"], notes="Tre të fundit shkojnë përtej kërkesës minimale të lëndës.")
slide("Arkitektura", ["React + Supabase (PostgreSQL, Auth, RLS)", "Rregullat e biznesit në funksione SQL", "Edge Functions me Claude API; çelësi vetëm në server", "Çmimi dhe disponueshmëria nuk vijnë kurrë nga klienti"], img=f"{ROOT}/diagrams/arch.png")
slide("Integriteti i të dhënave", ["Constraint EXCLUDE: dy rezervime të mbivendosura janë të pamundura", "Back-to-back lejohet (check-out = check-in)", "RLS: mysafiri sheh vetëm të tijat; hosti vetëm pronat e veta", "Pagesa: vetëm last4; numri i plotë nuk ruhet kurrë"], img=f"{ROOT}/diagrams/er.png")
slide("AI që nuk shpik", ["Modeli thërret funksione: kërkim, disponueshmëri, çmim, rezervim", "Rezervon vetëm pas 'po' të qartë nga mysafiri", "Çmimi = rregulla × zënia, brenda [min, max]; AI vetëm e shpjegon", "Planifikuesi: serveri rivlerëson çdo qëndrim dhe hedh poshtë të pavlefshmit"])
s = slide("Simulatori: a funksionon vërtet çmimi dinamik?", ["Mysafirë sintetikë rezervojnë 10 dhoma për një vit", "Të njëjtët mysafirë, tri strategji; 100 simulime; interval besimi 95%"])
table(s, [["Strategjia", "Të ardhura/vit", "Zënia"], ["Çmim fiks", "€189,988 ± 989", "65.1%"], ["Rregulla sezonale", "€195,382 ± 1,166", "59.6%"], ["AI dinamik", "€196,821 ± 1,135", "60.9%"]], 0.6, 3.6, 8.5, [3.3, 3.2, 2.0])
slide("Gjetja e ndershme", ["AI vs çmim fiks: +3.6% (98 nga 100 simulime)", "AI vs rregulla sezonale: vetëm +0.74%", "Kur hoteli mbushet (≥72%), AI nuk shton gjë mbi rregullat", "Kur kërkesa është shumë e dobët, rregullat mund të dëmtojnë (−1.9%)", "Kufizim: kërkesa është sintetike; nuk provon tregun real"], notes="Theksoni që raportojmë edhe rezultatin modest; kjo është pika metodologjike.")
slide("Revenue Manager", ["Parashikim 90-ditor: rezervimet reale afër datës, sezonaliteti larg", "Interval pasigurie, sinjalizime dhe skenari 'po sikur'", "Backtest: gabimi 6.3 pp në 0–7 ditë, 10–16 pp në 8–60 ditë", "Në 61–89 ditë nuk është më i mirë se a-priori: e raportojmë"])
slide("Testimi", ["44 teste njësie (Vitest) kalojnë", "15 grupe kontrollesh SQL (T1–T15) kalojnë mbi PostgreSQL të pastër", "Testet gjetën defekte reale (p.sh. disponueshmëria e gabuar nga RLS)", "Nuk është bërë ende: prova në shfletues, Claude real, 2–3 përdorues"])
slide("Kufizimet", ["Simulator me të dhëna sintetike; parametra të supozuar", "UI e verifikuar vetëm sintaksisht; Edge Functions pa provë me API real", "Planifikuesi nuk rezervon transaksionalisht", "Pagesa është simulim; pa PCI/3-D Secure/email"])
slide("Përfundimi dhe hapat e ardhshëm", ["Sistem rezervimi i sigurt + AI e matur kundrejt bazave të thjeshta", "Hapi 1: npm install, build, provë manuale e rrjedhave", "Hapi 2: testim me përdorues; kalibrim me të dhëna reale", "Hapi 3: pagesë reale (Stripe) dhe njoftime me email"])
slide("Pyetje?", ["Kodi: github.com/yllalickaj7-bit/kosovabnb", "Dokumentet: docs/ (Java 1–8), testet: supabase/tests dhe src/lib/__tests__"])
p.save(sys.argv[1])
