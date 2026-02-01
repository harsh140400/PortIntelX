import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { apiPost } from "../api";

import LoadingOverlay from "../components/LoadingOverlay.jsx";
import ScanCard from "../components/ScanCard.jsx";
import ResultTable from "../components/ResultTable.jsx";
import SeverityChart from "../components/SeverityChart.jsx";

export default function Scanner() {
  const [target, setTarget] = useState("");
  const [portRange, setPortRange] = useState("quick");
  const [scanMode, setScanMode] = useState("quick"); // quick or deep
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function cleanTarget(input) {
    let t = input.trim();
    t = t.replace(/^https?:\/\//i, "");
    t = t.split("/")[0];
    t = t.replace(/\s+/g, "");
    return t;
  }

  function riskStyle(level) {
    const lv = (level || "").toUpperCase();
    if (lv === "CRITICAL") return { bg: "rgba(255,59,107,0.22)", border: "rgba(255,59,107,0.45)" };
    if (lv === "HIGH") return { bg: "rgba(255,0,70,0.16)", border: "rgba(255,0,70,0.35)" };
    if (lv === "MEDIUM") return { bg: "rgba(255,170,0,0.18)", border: "rgba(255,170,0,0.35)" };
    return { bg: "rgba(34,197,94,0.18)", border: "rgba(34,197,94,0.35)" };
  }

  async function runScan() {
    if (!target.trim()) {
      alert("⚠️ Enter target (IP/Domain)");
      return;
    }

    const cleanedTarget = cleanTarget(target);

    setLoading(true);
    setResult(null);

    const data = await apiPost("/scan", {
      target: cleanedTarget,
      port_range: portRange,
      scan_mode: scanMode
    });

    setLoading(false);

    if (!data.success) {
      setResult({ error: data.detail || "Scan failed" });
      return;
    }

    setResult(data.data);
  }

  const riskLV = result?.risk_level || "LOW";
  const riskScore = result?.risk_score ?? 0;
  const tech = result?.tech_stack || {};
  const headers = result?.security_headers || {};

  return (
    <div className="container">
      <LoadingOverlay
        show={loading}
        text={scanMode === "deep" ? "🧠 Deep Scanning (OS + Services)..." : "⚡ Quick Scan Running..."}
      />

      <Navbar />

      <div className="card">
        <div className="title">🔍 Scanner</div>
        <div className="sub">
          Scan open ports + OS/service detection + CVE mapping + security headers + tech fingerprinting
        </div>

        <div className="grid2" style={{ marginTop: 16 }}>
          <div>
            <label>Target (IP / Domain)</label>
            <input
              className="input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="example: scanme.nmap.org"
            />
            <p style={{ marginTop: 6, opacity: 0.65, fontSize: "0.9rem" }}>
              ✅ You can paste full URL like <b>https://example.com</b>
            </p>
          </div>

          <div>
            <label>Port Range</label>
            <input
              className="input"
              value={portRange}
              onChange={(e) => setPortRange(e.target.value)}
              placeholder="quick | full | 1-1000"
            />
            <p style={{ marginTop: 6, opacity: 0.65, fontSize: "0.9rem" }}>
              ✅ Tip: Use <b>quick</b> for common ports (80/443 included)
            </p>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 14 }}>
          <div>
            <label>Scan Mode</label>
            <select
              className="input"
              value={scanMode}
              onChange={(e) => setScanMode(e.target.value)}
            >
              <option value="quick">⚡ Quick Scan (Fast)</option>
              <option value="deep">🧠 Deep Scan (OS + Service Versions)</option>
            </select>
          </div>

          <div>
            <label>Scan Notes</label>
            <div className="card" style={{ padding: 14 }}>
              <p style={{ opacity: 0.85, lineHeight: 1.6 }}>
                ✅ Quick Scan uses common ports list for best results <br />
                ✅ Deep Scan may take more time due to service & OS fingerprinting
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn btnPrimary"
          style={{ marginTop: 14, width: "100%" }}
          onClick={runScan}
          disabled={loading}
        >
          {loading ? "Scanning..." : "🚀 Start Scan"}
        </button>

        <div style={{ marginTop: 16 }}>
          {!result && <p className="sub">No scan yet.</p>}

          {result?.error && (
            <div className="card" style={{ marginTop: 12 }}>
              <div className="badge">❌ Error</div>
              <p style={{ marginTop: 10 }}>{result.error}</p>
            </div>
          )}

          {result && !result.error && (
            <>
              {/* ✅ Target Intelligence */}
              <div className="card" style={{ marginTop: 14 }}>
                <div className="badge">🎯 Target Intelligence</div>

                <p style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.8 }}>
                  <b>Target:</b> {result.target || "—"} <br />
                  <b>Resolved IP:</b> <b>{result.ip || "Not resolved"}</b> <br />
                  <b>Scan Mode:</b> {result.scan_mode || "quick"} <br />
                  <b>OS Guess:</b> {result.os_guess || "Unknown"} <br />
                  <b>Duration:</b> {result.duration_seconds || 0}s
                </p>

                {/* ✅ Enterprise Risk Badge */}
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1px solid ${riskStyle(riskLV).border}`,
                      background: riskStyle(riskLV).bg,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 900, letterSpacing: 0.4 }}>
                          🛡️ Enterprise Risk Level: {riskLV}
                        </div>
                        <div style={{ opacity: 0.85, marginTop: 4 }}>
                          Risk Score: <b>{riskScore}/100</b>
                        </div>
                      </div>

                      <span className="badge">
                        {riskLV === "CRITICAL" ? "🚨" : riskLV === "HIGH" ? "🔥" : riskLV === "MEDIUM" ? "⚠️" : "✅"}{" "}
                        {riskLV}
                      </span>
                    </div>

                    {result.risk_reasons && result.risk_reasons.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div className="badge">📌 Risk Reasons</div>
                        <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.92, lineHeight: 1.7 }}>
                          {result.risk_reasons.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Summary Cards */}
              <div className="grid2" style={{ marginTop: 14 }}>
                <ScanCard
                  title="Open Ports"
                  icon="🔓"
                  value={result.total_open_ports || 0}
                  subtitle="Exposed services detected on the target"
                />

                <ScanCard
                  title="CVE Groups"
                  icon="🧨"
                  value={(result.cve_findings || []).length}
                  subtitle="Mapped vulnerabilities based on detected services"
                />
              </div>

              {/* ✅ Risk Overview + AI */}
              <div className="grid2" style={{ marginTop: 14 }}>
                <SeverityChart
                  openPorts={result.total_open_ports || 0}
                  cveFindings={(result.cve_findings || []).length}
                />

                <div className="card">
                  <div className="badge">🤖 AI Security Analyst</div>
                  <p style={{ marginTop: 10, opacity: 0.9 }}>
                    {result.ai_analysis?.summary || "No AI analysis available."}
                  </p>

                  <hr style={{ opacity: 0.15, margin: "14px 0" }} />

                  <div className="badge">✅ Recommendations</div>
                  <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7 }}>
                    {(result.ai_analysis?.recommendations || []).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ✅ Security Headers Scanner */}
              <div className="card" style={{ marginTop: 14 }}>
                <div className="badge">🧩 Security Headers Scanner</div>

                <p style={{ marginTop: 10, opacity: 0.9 }}>
                  <b>Checked URL:</b> {headers.url_checked || "Not reachable"} <br />
                  <b>Header Security Score:</b> <b>{headers.score ?? 0}/100</b>
                </p>

                <div className="grid2" style={{ marginTop: 12 }}>
                  <div className="card" style={{ padding: 14 }}>
                    <div className="badge">✅ Present Headers</div>
                    {headers.present && Object.keys(headers.present).length > 0 ? (
                      <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7 }}>
                        {Object.keys(headers.present).map((h, idx) => (
                          <li key={idx}>
                            <b>{h}</b>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ marginTop: 10, opacity: 0.75 }}>No security headers detected.</p>
                    )}
                  </div>

                  <div className="card" style={{ padding: 14 }}>
                    <div className="badge">❌ Missing Headers</div>
                    {headers.missing && headers.missing.length > 0 ? (
                      <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7 }}>
                        {headers.missing.map((h, idx) => (
                          <li key={idx}>
                            <b>{h}</b>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ marginTop: 10, opacity: 0.75 }}>
                        ✅ No missing headers detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Tech Stack Detection */}
              <div className="card" style={{ marginTop: 14 }}>
                <div className="badge">🛰️ Website Tech Detection</div>

                <p style={{ marginTop: 10, opacity: 0.9 }}>
                  <b>Checked URL:</b> {tech.url_checked || "Not reachable"} <br />
                  <b>Server Header:</b> {tech.server || "Unknown"} <br />
                  <b>X-Powered-By:</b> {tech.powered_by || "Not detected"}
                </p>

                <div className="grid2" style={{ marginTop: 12 }}>
                  <div className="card" style={{ padding: 14 }}>
                    <div className="badge">🧠 Framework / Stack</div>
                    {tech.framework && tech.framework.length > 0 ? (
                      <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7 }}>
                        {tech.framework.map((x, idx) => (
                          <li key={idx}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ marginTop: 10, opacity: 0.75 }}>
                        No framework hints found.
                      </p>
                    )}
                  </div>

                  <div className="card" style={{ padding: 14 }}>
                    <div className="badge">🛡️ CDN / WAF</div>
                    {tech.cdn_waf && tech.cdn_waf.length > 0 ? (
                      <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7 }}>
                        {tech.cdn_waf.map((x, idx) => (
                          <li key={idx}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ marginTop: 10, opacity: 0.75 }}>
                        No CDN/WAF detected.
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="badge">🧩 CMS Detection</div>
                  {tech.cms && tech.cms.length > 0 ? (
                    <ul style={{ marginTop: 10, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7 }}>
                      {tech.cms.map((x, idx) => (
                        <li key={idx}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ marginTop: 10, opacity: 0.75 }}>
                      No CMS detected.
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Open Ports Table */}
              <div className="card" style={{ marginTop: 14 }}>
                <div className="badge">📌 Open Ports Details</div>
                <ResultTable rows={result.open_ports || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
