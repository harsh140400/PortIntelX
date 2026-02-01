def calculate_risk(open_ports: list, cve_groups: list, security_headers: dict, tech: dict):
    """
    Enterprise-style risk scoring.
    Returns risk_score (0-100), level, and reasons.
    """
    score = 0
    reasons = []

    # ✅ base risk from open ports
    score += len(open_ports) * 3
    if len(open_ports) > 0:
        reasons.append(f"{len(open_ports)} open ports increase exposure.")

    # ✅ high-risk remote access ports
    remote_high = {22: "SSH", 23: "TELNET", 3389: "RDP", 445: "SMB"}
    for p in open_ports:
        port = p.get("port")
        if port in remote_high:
            score += 18
            reasons.append(f"High-risk remote service exposed: {remote_high[port]} on port {port}.")

    # ✅ exposed DB ports
    db_ports = {3306: "MySQL", 5432: "PostgreSQL", 27017: "MongoDB", 1433: "MSSQL"}
    for p in open_ports:
        port = p.get("port")
        if port in db_ports:
            score += 20
            reasons.append(f"Database port exposed: {db_ports[port]} on port {port}.")

    # ✅ HTTP without HTTPS penalty
    ports = [x.get("port") for x in open_ports]
    if 80 in ports and 443 not in ports:
        score += 12
        reasons.append("HTTP detected without HTTPS. Traffic may be unencrypted.")

    # ✅ CVEs are VERY HIGH risk
    cve_count = len(cve_groups)
    if cve_count > 0:
        score += (cve_count * 15)
        reasons.append(f"{cve_count} CVE groups mapped from detected services.")

    # ✅ security headers score effect
    header_score = security_headers.get("score", 0) if security_headers else 0
    if header_score < 60:
        score += 10
        reasons.append("Security headers are missing/weak (recommended for website hardening).")

    # ✅ CDN/WAF reduces risk slightly (not always, but helps)
    if tech and tech.get("cdn_waf"):
        score -= 6
        reasons.append(f"CDN/WAF detected: {', '.join(tech.get('cdn_waf'))} (may reduce attack surface).")

    # clamp 0-100
    score = max(0, min(100, score))

    # ✅ level
    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 35:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons[:8]  # keep clean
    }
