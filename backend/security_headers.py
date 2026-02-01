import requests

SECURITY_HEADERS = [
    "Content-Security-Policy",
    "X-Frame-Options",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "Referrer-Policy"
]

def scan_security_headers(target: str):
    """
    Checks security headers for a domain/IP.
    Tries HTTPS first, then HTTP.
    """
    headers_result = {
        "url_checked": None,
        "reachable": False,
        "present": {},
        "missing": [],
        "score": 0
    }

    urls = [
        f"https://{target}",
        f"http://{target}",
    ]

    response = None
    used_url = None

    for url in urls:
        try:
            r = requests.get(url, timeout=8, allow_redirects=True)
            response = r
            used_url = r.url
            break
        except:
            continue

    if not response:
        headers_result["missing"] = SECURITY_HEADERS
        return headers_result

    headers_result["reachable"] = True
    headers_result["url_checked"] = used_url

    found = 0
    for h in SECURITY_HEADERS:
        if h in response.headers:
            headers_result["present"][h] = response.headers.get(h, "")
            found += 1
        else:
            headers_result["missing"].append(h)

    # ✅ Score out of 100
    headers_result["score"] = int((found / len(SECURITY_HEADERS)) * 100)

    return headers_result
