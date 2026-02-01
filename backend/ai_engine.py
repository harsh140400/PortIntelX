import os
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def rule_based_ai(scan_result: dict):
    """
    Works without OpenAI key.
    Generates useful SOC-style report based on detected ports/services.
    """
    open_ports = scan_result.get("open_ports", [])
    services = scan_result.get("running_services", [])
    os_guess = scan_result.get("os_guess", "Unknown")

    recommendations = []
    risk_notes = []

    # ✅ Basic risk logic
    for p in open_ports:
        port = p.get("port")

        if port == 21:
            risk_notes.append("FTP detected: plaintext authentication possible.")
            recommendations.append("Disable FTP or migrate to SFTP/FTPS.")
        if port == 22:
            recommendations.append("Restrict SSH access to trusted IPs and disable password login.")
        if port == 23:
            risk_notes.append("TELNET detected: insecure remote access.")
            recommendations.append("Disable TELNET and use SSH instead.")
        if port == 80:
            recommendations.append("Redirect HTTP to HTTPS and enable secure headers.")
        if port == 443:
            recommendations.append("Ensure strong TLS configuration and enable HSTS.")
        if port == 3306:
            risk_notes.append("Database port exposed: risk of brute force and leakage.")
            recommendations.append("Block DB ports from public access and allow only internal network.")
        if port == 3389:
            risk_notes.append("RDP exposed: highly targeted for brute-force attacks.")
            recommendations.append("Use VPN + MFA for RDP and restrict by firewall allowlist.")

    if len(open_ports) == 0:
        recommendations.append("No open ports detected in the scanned range. Maintain firewall baseline & monitoring.")
    else:
        recommendations.append("Close all unused ports and enforce least exposure policy.")
        recommendations.append("Enable IDS/IPS monitoring to detect suspicious port scans.")

    # ✅ OS guess note
    if os_guess and os_guess != "Unknown":
        risk_notes.append(f"OS fingerprint guess: {os_guess}")
    else:
        risk_notes.append("OS fingerprint could not be reliably detected (limited external visibility).")

    # ✅ services info note
    if services:
        recommendations.append("Update exposed services to the latest stable patched versions.")
    else:
        recommendations.append("Enable service version detection for deeper visibility (Nmap -sV).")

    # remove duplicates (clean)
    recommendations = list(dict.fromkeys(recommendations))
    risk_notes = list(dict.fromkeys(risk_notes))

    summary = (
        f"Scan completed successfully. Detected {len(open_ports)} open ports. "
        f"PortIntelX generated a security posture summary based on network exposure and service hints."
    )

    if risk_notes:
        summary += " Key notes: " + " | ".join(risk_notes[:4])

    return {
        "ai_enabled": False,
        "summary": summary,
        "recommendations": recommendations
    }


def generate_ai_report(scan_result: dict):
    """
    If OpenAI key exists: we can later implement actual LLM calls.
    If not: rule-based AI still generates useful output.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY.startswith("PUT_"):
        return rule_based_ai(scan_result)

    # ✅ placeholder for real OpenAI integration
    return {
        "ai_enabled": True,
        "summary": "AI Engine enabled (API key detected). Full AI responses can be integrated.",
        "recommendations": [
            "Use least privilege network exposure policy.",
            "Patch exposed services and enforce firewall allowlists.",
            "Enable continuous monitoring and alerting."
        ]
    }
