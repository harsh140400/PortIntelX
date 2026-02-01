import requests
import re

def detect_tech_stack(target: str):
    """
    Best-effort tech detection based on:
    - response headers
    - HTML patterns
    - CDN hints
    """
    tech = {
        "url_checked": None,
        "reachable": False,
        "server": None,
        "powered_by": None,
        "framework": [],
        "cms": [],
        "cdn_waf": [],
        "notes": []
    }

    urls = [
        f"https://{target}",
        f"http://{target}",
    ]

    response = None
    for url in urls:
        try:
            r = requests.get(url, timeout=10, allow_redirects=True)
            response = r
            tech["url_checked"] = r.url
            tech["reachable"] = True
            break
        except:
            continue

    if not response:
        tech["notes"].append("Target is not reachable via HTTP/HTTPS.")
        return tech

    # ✅ Header-based detections
    server = response.headers.get("Server")
    powered = response.headers.get("X-Powered-By")

    if server:
        tech["server"] = server

        if "nginx" in server.lower():
            tech["framework"].append("Nginx Web Server")
        if "apache" in server.lower():
            tech["framework"].append("Apache HTTP Server")
        if "iis" in server.lower():
            tech["framework"].append("Microsoft IIS")

    if powered:
        tech["powered_by"] = powered

        if "php" in powered.lower():
            tech["framework"].append("PHP Backend")
        if "express" in powered.lower():
            tech["framework"].append("Node.js Express")

    # ✅ CDN / WAF detection
    headers = {k.lower(): v.lower() for k, v in response.headers.items()}

    if "cf-ray" in headers or "cloudflare" in headers.get("server", ""):
        tech["cdn_waf"].append("Cloudflare")
    if "akamai" in headers.get("server", "") or "akamaighost" in headers.get("server", ""):
        tech["cdn_waf"].append("Akamai")
    if "x-sucuri-id" in headers or "sucuri" in headers.get("server", ""):
        tech["cdn_waf"].append("Sucuri WAF")

    # ✅ HTML pattern detection
    html = response.text[:120000]  # limit for speed

    # React / Next.js
    if re.search(r"__NEXT_DATA__", html):
        tech["framework"].append("Next.js")
    if re.search(r"react", html, re.IGNORECASE):
        tech["framework"].append("React (possible)")

    # WordPress
    if "wp-content" in html or "wp-includes" in html:
        tech["cms"].append("WordPress")

    # Laravel
    if "laravel" in html.lower():
        tech["framework"].append("Laravel (possible)")

    # Joomla
    if "joomla" in html.lower():
        tech["cms"].append("Joomla (possible)")

    # Django
    if "csrftoken" in headers or "django" in html.lower():
        tech["framework"].append("Django (possible)")

    tech["framework"] = list(dict.fromkeys(tech["framework"]))
    tech["cms"] = list(dict.fromkeys(tech["cms"]))
    tech["cdn_waf"] = list(dict.fromkeys(tech["cdn_waf"]))

    return tech
