import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useParams } from "react-router-dom";
import { apiGet } from "../api";

import SeverityChart from "../components/SeverityChart.jsx";
import RiskGauge from "../components/RiskGauge.jsx";
import RiskyPortsChart from "../components/RiskyPortsChart.jsx";
import SeverityBreakdownChart from "../components/SeverityBreakdownChart.jsx";

export default function Report() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  // ✅ Client branding inputs
  const [clientName, setClientName] = useState("Confidential Client");
  const [projectName, setProjectName] = useState("External Exposure & Risk Assessment");
  const [engagementId, setEngagementId] = useState(`PX-${id}`);

  // ✅ NEW: Logo upload state (Base64 so it works inside PDF)
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    async function loadReport() {
      const res = await apiGet(`/history/${id}`);
      setData(res || null);
    }
    loadReport();
  }, [id]);

  function exportPDF() {
    window.print();
  }

  function nowIST() {
    const d = new Date();
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Allow only images
    if (!file.type.startsWith("image/")) {
      alert("⚠️ Please upload a valid image file (PNG/JPG).");
      return;
    }

    // ✅ keep size safe for PDF (recommended < 1MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ Logo is too large. Please upload under 2MB for best PDF quality.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    setLogoBase64("");
  }

  function portSeverity(port) {
    const critical = [445, 3389, 3306, 5432, 27017, 1433];
    const high = [21, 23];
    const medium = [22, 80, 8080];
    const low = [443];

    if (critical.includes(port)) return "CRITICAL";
    if (high.includes(port)) return "HIGH";
    if (medium.includes(port)) return "MEDIUM";
    if (low.includes(port)) return "LOW";
    return "MEDIUM";
  }

  function countSeverity(openPorts) {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    openPorts.forEach((p) => {
      counts[portSeverity(p.port)] += 1;
    });
    return counts;
  }

  function bannerSafeText(b) {
    if (!b) return "—";
    const s = String(b).replace(/\s+/g, " ").trim();
    return s.length > 160 ? s.slice(0, 160) + "..." : s;
  }

  const pageTitles = useMemo(() => {
    return [
      "Cover Page",
      "Executive Summary",
      "Scope & Methodology",
      "Risk Overview (Charts)",
      "Top Risky Ports",
      "Severity Totals",
      "SSL/TLS Analyzer",
      "Security Headers Scan",
      "Tech Stack Detection",
      "CVE Mapping",
      "Open Ports & Services",
      "Running Services (Deep Scan)",
      "Disclaimer",
    ];
  }, []);

  if (!data) {
    return (
      <div className="container">
        <Navbar />
        <div className="card">
          <div className="title">📄 Loading Report...</div>
          <p className="sub">Please wait...</p>
        </div>
      </div>
    );
  }

  const openPorts = data.open_ports || [];
  const runningServices = data.running_services || [];
  const cveGroups = data.cve_findings || [];
  const cveNotes = data.cve_notes || [];

  const sslInfo = data.ssl_tls || {};
  const headers = data.security_headers || {};
  const tech = data.tech_stack || {};

  const sevCounts = countSeverity(openPorts);
  const totalPages = pageTitles.length;

  function PageHeader({ pageNo, title }) {
    return (
      <div className="pxPrintHeader">
        <div className="pxPrintHeaderLeft">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {logoBase64 ? (
              <img
                src={logoBase64}
                alt="Company Logo"
                className="pxPrintLogo"
              />
            ) : (
              <div className="pxPrintBrand">PortIntelX</div>
            )}
          </div>

          <div className="pxPrintMeta">
            {clientName} • {projectName}
          </div>
        </div>

        <div className="pxPrintHeaderRight">
          <div className="pxPrintPage">
            Page {pageNo} of {totalPages}
          </div>
          <div className="pxPrintSection">{title}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Navbar />

      {/* ✅ Controls (not printed) */}
      <div className="card noPrint">
        <div className="title">📄 PortIntelX Multi-Page Report</div>
        <p className="sub">
          ✅ Every section will be printed on a separate PDF page (Enterprise format).
        </p>

        <div style={{ marginTop: 14 }} className="grid2">
          <div className="card" style={{ padding: 14 }}>
            <div className="badge">🏢 Client / Branding</div>

            <label style={{ marginTop: 10, display: "block" }}>Client Name</label>
            <input
              className="input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />

            <label style={{ marginTop: 10, display: "block" }}>Project Name</label>
            <input
              className="input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <label style={{ marginTop: 10, display: "block" }}>Engagement ID</label>
            <input
              className="input"
              value={engagementId}
              onChange={(e) => setEngagementId(e.target.value)}
            />

            {/* ✅ Logo Upload */}
            <label style={{ marginTop: 10, display: "block" }}>Company Logo (PNG/JPG)</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />

            {logoBase64 ? (
              <div style={{ marginTop: 12 }}>
                <div className="badge">✅ Logo Preview</div>
                <div style={{ marginTop: 10 }}>
                  <img
                    src={logoBase64}
                    alt="Logo Preview"
                    className="pxLogoPreview"
                  />
                </div>

                <button
                  className="btn btnDanger"
                  style={{ marginTop: 12 }}
                  onClick={clearLogo}
                >
                  🗑️ Remove Logo
                </button>
              </div>
            ) : (
              <p style={{ marginTop: 10, opacity: 0.75 }}>
                Upload a logo to show it on Cover Page + PDF Header.
              </p>
            )}
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div className="badge">📌 Report Details</div>

            <p style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.7 }}>
              <b>Target:</b> {data.target} <br />
              <b>Resolved IP:</b> {data.ip} <br />
              <b>Scan Mode:</b> {(data.scan_mode || "quick").toUpperCase()} <br />
              <b>Port Range:</b> {data.port_range} <br />
              <b>Duration:</b> {data.duration_seconds}s <br />
              <b>Generated:</b> {nowIST()} (IST)
            </p>

            <button className="btn btnPrimary" style={{ marginTop: 12 }} onClick={exportPDF}>
              ⬇️ Download PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* ✅ PAGE 1 — COVER */}
      <div className="printPage">
        <div className="card pxCover">
          <div className="pxCoverTop">
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              {logoBase64 ? (
                <img src={logoBase64} alt="Company Logo" className="pxCoverLogo" />
              ) : (
                <div className="pxCoverLogoFallback">LOGO</div>
              )}

              <div>
                <div className="pxCoverTitle">PortIntelX</div>
                <div className="pxCoverSub">Enterprise Security Assessment Report</div>
              </div>
            </div>

            <div className="pxCoverRight">
              <div className="badge">🆔 Engagement: {engagementId}</div>
              <div style={{ marginTop: 8 }} className="badge">
                🕒 Generated: {nowIST()} (IST)
              </div>
            </div>
          </div>

          <div className="pxCoverBox">
            <div className="pxCoverRow">
              <div className="pxCoverKey">Client</div>
              <div className="pxCoverVal">{clientName}</div>
            </div>

            <div className="pxCoverRow">
              <div className="pxCoverKey">Project</div>
              <div className="pxCoverVal">{projectName}</div>
            </div>

            <div className="pxCoverRow">
              <div className="pxCoverKey">Target</div>
              <div className="pxCoverVal">{data.target}</div>
            </div>

            <div className="pxCoverRow">
              <div className="pxCoverKey">Resolved IP</div>
              <div className="pxCoverVal">{data.ip}</div>
            </div>

            <div className="pxCoverRow">
              <div className="pxCoverKey">Scan Type</div>
              <div className="pxCoverVal">{(data.scan_mode || "quick").toUpperCase()}</div>
            </div>

            <div className="pxCoverRow">
              <div className="pxCoverKey">Port Range</div>
              <div className="pxCoverVal">{data.port_range}</div>
            </div>

            <div className="pxCoverRow">
              <div className="pxCoverKey">Overall Risk</div>
              <div className="pxCoverVal">
                {data.risk_level} ({data.risk_score}/100)
              </div>
            </div>
          </div>

          <div className="pxCoverFooter">
            ⚠️ Confidential — This report is intended only for authorized security review.
          </div>
        </div>
      </div>

      {/* ✅ PAGE 2 — EXEC SUMMARY */}
      <div className="printPage">
        <PageHeader pageNo={2} title="Executive Summary" />
        <div className="card">
          <div className="title">📌 Executive Summary</div>
          <p className="sub">
            Business-focused overview of exposure, risk posture and remediation priorities.
          </p>

          <div style={{ marginTop: 14 }}>
            <span className="badge">🔓 Open Ports: {openPorts.length}</span>{" "}
            <span className="badge">🧨 CVE Groups: {cveGroups.length}</span>{" "}
            <span className="badge">🛡️ Risk: {data.risk_level}</span>{" "}
            <span className="badge">🎯 Score: {data.risk_score}/100</span>
          </div>

          <p style={{ marginTop: 14, opacity: 0.92, lineHeight: 1.85 }}>
            PortIntelX identified <b>{openPorts.length}</b> exposed services on the target and{" "}
            <b>{cveGroups.length}</b> mapped vulnerability groups. The overall posture is classified as{" "}
            <b>{data.risk_level}</b>. Priority actions include restricting remote access services,
            enforcing HTTPS, and strengthening security headers.
          </p>
        </div>
      </div>

      {/* ✅ PAGE 3 — Scope & Methodology */}
      <div className="printPage">
        <PageHeader pageNo={3} title="Scope & Methodology" />
        <div className="card">
          <div className="title">🧪 Scope & Methodology</div>
          <p className="sub">Defines scan scope, techniques used and limitations.</p>
          <ul style={{ marginTop: 14, paddingLeft: 20, opacity: 0.92, lineHeight: 1.95 }}>
            <li><b>Scope:</b> Target domain/IP ({data.target})</li>
            <li><b>Resolved IP:</b> {data.ip}</li>
            <li><b>Port Range:</b> {data.port_range}</li>
            <li><b>Scan Mode:</b> {(data.scan_mode || "quick").toUpperCase()}</li>
            <li><b>Techniques:</b> TCP connect scan + banner grabbing</li>
            <li><b>Limitations:</b> WAF/CDN/firewall restrictions may impact detection</li>
          </ul>
        </div>
      </div>

      {/* ✅ PAGE 4 — Risk Overview */}
      <div className="printPage">
        <PageHeader pageNo={4} title="Risk Overview (Charts)" />
        <div className="card">
          <div className="title">📊 Risk Overview</div>
          <p className="sub">Charts and severity indicators for management visibility.</p>

          <div className="grid2" style={{ marginTop: 14 }}>
            <SeverityChart openPorts={openPorts.length} cveFindings={cveGroups.length} />
            <RiskGauge score={data.risk_score || 0} />
          </div>

          <div style={{ marginTop: 14 }}>
            <SeverityBreakdownChart riskScore={data.risk_score || 0} />
          </div>
        </div>
      </div>

      {/* ✅ PAGE 5 — Top Risky Ports */}
      <div className="printPage">
        <PageHeader pageNo={5} title="Top Risky Ports" />
        <div className="card">
          <div className="title">📈 Top Risky Ports</div>
          <p className="sub">Most impactful exposed ports contributing to risk score.</p>

          <div style={{ marginTop: 14 }}>
            <RiskyPortsChart openPorts={openPorts} />
          </div>
        </div>
      </div>

      {/* ✅ PAGE 6 — Severity Totals */}
      <div className="printPage">
        <PageHeader pageNo={6} title="Severity Totals" />
        <div className="card">
          <div className="title">📊 Severity Totals</div>
          <p className="sub">CRITICAL/HIGH/MEDIUM/LOW distribution table.</p>

          <table className="table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ fontWeight: 900 }}>🚨 CRITICAL</td><td style={{ fontWeight: 900 }}>{sevCounts.CRITICAL}</td></tr>
              <tr><td style={{ fontWeight: 900 }}>🔥 HIGH</td><td style={{ fontWeight: 900 }}>{sevCounts.HIGH}</td></tr>
              <tr><td style={{ fontWeight: 900 }}>⚠️ MEDIUM</td><td style={{ fontWeight: 900 }}>{sevCounts.MEDIUM}</td></tr>
              <tr><td style={{ fontWeight: 900 }}>✅ LOW</td><td style={{ fontWeight: 900 }}>{sevCounts.LOW}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ PAGE 7 — SSL/TLS */}
      <div className="printPage">
        <PageHeader pageNo={7} title="SSL/TLS Analyzer" />
        <div className="card">
          <div className="title">🔒 SSL/TLS Analyzer</div>
          <p className="sub">Certificate info + TLS version + expiry status.</p>

          {sslInfo.enabled ? (
            <div style={{ marginTop: 12, opacity: 0.92, lineHeight: 1.95 }}>
              <p><b>TLS Enabled:</b> ✅ Yes</p>
              <p><b>TLS Version:</b> {sslInfo.tls_version || "Unknown"}</p>
              <p><b>Issuer:</b> {sslInfo.cert_issuer || "Unknown"}</p>
              <p><b>Subject:</b> {sslInfo.cert_subject || "Unknown"}</p>
              <p><b>Valid Until:</b> {sslInfo.not_after || "Unknown"}</p>
              <p><b>Days Remaining:</b> <b>{typeof sslInfo.days_remaining === "number" ? sslInfo.days_remaining : "Unknown"}</b></p>
            </div>
          ) : (
            <p style={{ marginTop: 12, opacity: 0.85 }}>
              ❌ TLS not detected or handshake failed: <b>{sslInfo.error || "Not reachable on 443"}</b>
            </p>
          )}
        </div>
      </div>

      {/* ✅ PAGE 8 — Security Headers */}
      <div className="printPage">
        <PageHeader pageNo={8} title="Security Headers Scan" />
        <div className="card">
          <div className="title">🧩 Security Headers Scan</div>
          <p className="sub">Web hardening evaluation using security header checks.</p>

          <p style={{ marginTop: 12, opacity: 0.92, lineHeight: 1.9 }}>
            <b>Checked URL:</b> {headers.url_checked || "Not reachable"} <br />
            <b>Score:</b> <b>{typeof headers.score === "number" ? headers.score : 0}/100</b>
          </p>

          <div className="grid2" style={{ marginTop: 12 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="badge">✅ Present</div>
              {headers.present && Object.keys(headers.present).length > 0 ? (
                <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.92, lineHeight: 1.9 }}>
                  {Object.keys(headers.present).map((h, idx) => (
                    <li key={idx}><b>{h}</b></li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: 10, opacity: 0.75 }}>No headers detected.</p>
              )}
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="badge">❌ Missing</div>
              {headers.missing && headers.missing.length > 0 ? (
                <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.92, lineHeight: 1.9 }}>
                  {headers.missing.map((h, idx) => (
                    <li key={idx}><b>{h}</b></li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: 10, opacity: 0.75 }}>✅ Nothing missing.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PAGE 9 — Tech Stack */}
      <div className="printPage">
        <PageHeader pageNo={9} title="Tech Stack Detection" />
        <div className="card">
          <div className="title">🛰️ Tech Stack Detection</div>
          <p className="sub">Identifies server/platform hints used for risk context.</p>

          <p style={{ marginTop: 12, opacity: 0.92, lineHeight: 1.95 }}>
            <b>Checked URL:</b> {tech.url_checked || "Not reachable"} <br />
            <b>Server:</b> {tech.server || "Unknown"} <br />
            <b>X-Powered-By:</b> {tech.powered_by || "Not detected"} <br />
          </p>
        </div>
      </div>

      {/* ✅ PAGE 10 — CVE Mapping */}
      <div className="printPage">
        <PageHeader pageNo={10} title="CVE Mapping" />
        <div className="card">
          <div className="title">🧨 CVE Mapping</div>
          <p className="sub">CVE mapping with fallback query logic and notes.</p>

          {cveGroups.length === 0 ? (
            <div style={{ marginTop: 12 }}>
              <p style={{ opacity: 0.85, lineHeight: 1.9 }}>
                ✅ No CVEs were mapped from detected services. <br />
                ⚠️ This does NOT guarantee safety — API mismatch/version unknown possible.
              </p>

              {cveNotes.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="badge">📌 Mapping Notes</div>
                  <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.92, lineHeight: 1.9 }}>
                    {cveNotes.map((x, idx) => (
                      <li key={idx}>
                        Service: <b>{x.service}</b> | Port: <b>{x.port}</b> — {x.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            cveGroups.map((g, idx) => (
              <div key={idx} style={{ marginTop: 14 }}>
                <div className="badge">🔎 Query: {g.query}</div>
                <p style={{ marginTop: 10, opacity: 0.9 }}>
                  <b>Port:</b> {g.port} | <b>Service:</b> {g.service || "—"}
                </p>

                <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.92, lineHeight: 1.9 }}>
                  {(g.cves || []).slice(0, 12).map((c, i2) => (
                    <li key={i2}>
                      <b>{c.cve}</b> (CVSS: {c.cvss}) —{" "}
                      <span style={{ opacity: 0.85 }}>{c.summary}</span>
                    </li>
                  ))}
                </ul>

                <hr style={{ opacity: 0.12, margin: "14px 0" }} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ PAGE 11 — Open Ports */}
      <div className="printPage">
        <PageHeader pageNo={11} title="Open Ports & Services" />
        <div className="card">
          <div className="title">🔓 Open Ports & Services</div>
          <p className="sub">Detected open ports with banners and severity.</p>

          {openPorts.length === 0 ? (
            <p style={{ marginTop: 12, opacity: 0.85 }}>✅ No open ports detected.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Service</th>
                  <th>Banner (trimmed)</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {openPorts.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 900 }}>{p.port}</td>
                    <td>{p.service || "Unknown"}</td>
                    <td style={{ opacity: 0.85 }}>{bannerSafeText(p.banner)}</td>
                    <td style={{ fontWeight: 900 }}>{portSeverity(p.port)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ✅ PAGE 12 — Running Services */}
      <div className="printPage">
        <PageHeader pageNo={12} title="Running Services (Deep Scan)" />
        <div className="card">
          <div className="title">🧩 Running Services (Deep Scan)</div>
          <p className="sub">Service fingerprinting results from deep scan mode.</p>

          {runningServices.length === 0 ? (
            <p style={{ marginTop: 12, opacity: 0.85 }}>
              No services fingerprinted. Run <b>Deep Scan</b> for details.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Service</th>
                  <th>Product</th>
                  <th>Version</th>
                  <th>Extra</th>
                </tr>
              </thead>
              <tbody>
                {runningServices.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.port}</td>
                    <td>{s.name || "—"}</td>
                    <td>{s.product || "—"}</td>
                    <td>{s.version || "—"}</td>
                    <td style={{ opacity: 0.8 }}>{s.extrainfo || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ✅ PAGE 13 — Disclaimer */}
      <div className="printPage printLastPage">
        <PageHeader pageNo={13} title="Disclaimer" />
        <div className="card">
          <div className="title">⚠️ Disclaimer</div>
          <p style={{ marginTop: 12, opacity: 0.8, lineHeight: 1.95 }}>
            PortIntelX is designed for authorized scanning only. This report is generated for security visibility,
            remediation planning, and governance support. Results may vary due to firewall/WAF behavior and
            network conditions.
          </p>

          <p style={{ marginTop: 12, opacity: 0.7 }}>
            © {new Date().getFullYear()} PortIntelX • Confidential • Engagement: {engagementId}
          </p>
        </div>
      </div>
    </div>
  );
}
