import requests

def search_cves(query: str):
    """
    Uses CIRCL CVE Search API (free) to find CVEs.
    Returns top 8 results.
    """
    if not query or len(query.strip()) < 3:
        return []

    url = f"https://cve.circl.lu/api/search/{query}"

    try:
        r = requests.get(url, timeout=8)
        if r.status_code != 200:
            return []

        data = r.json()
        results = []

        for item in data.get("data", [])[:8]:
            results.append({
                "cve": item.get("id", "N/A"),
                "summary": item.get("summary", "No description"),
                "cvss": item.get("cvss", "N/A")
            })

        return results

    except:
        return []


def build_cve_query(service: dict):
    """
    Create best query from detected service info.
    Example: "nginx 1.18" or "OpenSSH 8.2"
    """
    name = (service.get("name") or "").strip()
    product = (service.get("product") or "").strip()
    version = (service.get("version") or "").strip()
    extrainfo = (service.get("extrainfo") or "").strip()

    # ✅ Best search order:
    # product + version (best)
    if product and version:
        return f"{product} {version}"

    # product alone
    if product:
        return product

    # name alone (weak but fallback)
    if name:
        return name

    # extrainfo fallback
    if extrainfo:
        return extrainfo

    return ""
