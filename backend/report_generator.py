from fpdf import FPDF
from datetime import datetime
import json

def create_pdf_report(filename: str, data: dict):
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.title_section("PortIntelX - Network Scan Report")

    pdf.key_value("Target", data.get("target", "N/A"))
    pdf.key_value("Resolved IP", data.get("ip", "N/A"))
    pdf.key_value("Port Range", data.get("port_range", "N/A"))
    pdf.key_value("Scan Time", str(datetime.utcnow()) + " UTC")

    pdf.line_break()

    open_ports = data.get("open_ports", [])
    pdf.title_section(f"Open Ports Found ({len(open_ports)})")

    if not open_ports:
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(0, 8, "No open ports detected in the given range.")
    else:
        for p in open_ports:
            txt = f"Port {p.get('port')} - {p.get('service')} | Banner: {p.get('banner','')}"
            pdf.set_font("Arial", "", 11)
            pdf.multi_cell(0, 7, txt)

    pdf.line_break()

    ai = data.get("ai_analysis", {})
    pdf.title_section("AI Security Analyst Summary")
    pdf.set_font("Arial", "", 11)
    pdf.multi_cell(0, 7, ai.get("summary", "No AI analysis available."))

    pdf.line_break()
    pdf.title_section("Recommendations")
    for rec in ai.get("recommendations", []):
        pdf.set_font("Arial", "", 11)
        pdf.multi_cell(0, 7, f"- {rec}")

    pdf.output(filename)


class PDF(FPDF):
    def title_section(self, text):
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, text, ln=True)

    def key_value(self, k, v):
        self.set_font("Arial", "B", 11)
        self.cell(45, 8, f"{k}:", 0, 0)
        self.set_font("Arial", "", 11)
        self.cell(0, 8, str(v), ln=True)

    def line_break(self):
        self.ln(6)
