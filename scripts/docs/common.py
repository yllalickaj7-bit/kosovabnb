import sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

NAVY = RGBColor(0x1F, 0x3A, 0x5F)
TITLE = "KosovaBNB – Sistem Inteligjent për Menaxhimin e Hotelit"

class Doc:
    def __init__(self, week_label, subtitle):
        d = self.doc = Document()
        s = d.sections[0]; s.page_width, s.page_height = Cm(21), Cm(29.7)
        s.left_margin = s.right_margin = Cm(2.2); s.top_margin = s.bottom_margin = Cm(2)
        st = d.styles["Normal"]; st.font.name = "Calibri"; st.font.size = Pt(10.5)
        st.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri"); st.paragraph_format.space_after = Pt(4)
        c = self.centered
        c("FAKULTETI I SHKENCAVE KOMPJUTERIKE", 16, True, 4, before=40)
        c("INXHINIERI SOFTUERIKE", 14, True, 70)
        c(week_label, 28, True, 12, NAVY)
        c(subtitle, 16, False, 24)
        c(TITLE, 20, True, 80, NAVY)
        c("Mentor: Assoc. Prof. Dr. Engin Melekoğlu", 12, False, 6)
        c("Student: [Emri Mbiemri]", 12, False, 80)
        c("Prishtinë, 2026/2027", 12, True, 0)
        d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

    def centered(self, t, size, bold=False, after=6, color=None, before=0):
        p = self.doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(after); p.paragraph_format.space_before = Pt(before)
        r = p.add_run(t); r.font.size = Pt(size); r.bold = bold
        if color: r.font.color.rgb = color

    def H(self, t, size=13):
        p = self.doc.add_paragraph(); p.paragraph_format.space_before = Pt(10); p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(t); r.bold = True; r.font.size = Pt(size); r.font.color.rgb = NAVY

    def P(self, t): self.doc.add_paragraph(t)

    def UL(self, items):
        for i in items:
            p = self.doc.add_paragraph(i, style="List Bullet"); p.paragraph_format.space_after = Pt(2)

    def CODE(self, t):
        p = self.doc.add_paragraph(); p.paragraph_format.left_indent = Cm(0.5)
        r = p.add_run(t); r.font.name = "Consolas"; r.font.size = Pt(9)

    def IMG(self, path, width, cap):
        p = self.doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next = True
        p.add_run().add_picture(path, width=Cm(width))
        c = self.doc.add_paragraph(); c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = c.add_run(cap); r.italic = True; r.font.size = Pt(9)

    @staticmethod
    def _shade(cell, hexc):
        pr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
        sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hexc); pr.append(sh)

    @staticmethod
    def _cell(c, t, bold=False, color=None):
        c.text = ""; p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(1)
        r = p.add_run(str(t)); r.font.size = Pt(9); r.bold = bold
        if color: r.font.color.rgb = color

    def T(self, header, rows, widths):
        t = self.doc.add_table(rows=1, cols=len(header)); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
        for i, h in enumerate(header):
            self._cell(t.rows[0].cells[i], h, True, RGBColor(255, 255, 255)); self._shade(t.rows[0].cells[i], "1F3A5F")
        for r in rows:
            cs = t.add_row().cells
            for i, v in enumerate(r): self._cell(cs[i], v)
        # LibreOffice ignores cell widths unless tblGrid is set too
        grid = t._tbl.tblGrid
        for i, gc in enumerate(grid.findall(qn("w:gridCol"))): gc.set(qn("w:w"), str(int(widths[i] * 567)))
        for ri, row in enumerate(t.rows):
            pr = row._tr.get_or_add_trPr(); pr.append(OxmlElement("w:cantSplit"))
            if ri == 0: pr.append(OxmlElement("w:tblHeader"))
            for i, c in enumerate(row.cells): c.width = Cm(widths[i])
        self.doc.add_paragraph().paragraph_format.space_after = Pt(2)

    def save(self, path): self.doc.save(path)
