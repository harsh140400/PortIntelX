import ssl
import socket
import datetime

def ssl_tls_analyze(target: str, port: int = 443):
    """
    Simple TLS analyzer:
    - checks if TLS connection possible
    - extracts certificate issuer / subject
    - calculates days remaining
    """
    result = {
        "enabled": False,
        "port": port,
        "error": None,
        "cert_subject": None,
        "cert_issuer": None,
        "not_before": None,
        "not_after": None,
        "days_remaining": None,
        "tls_version": None,
    }

    try:
        context = ssl.create_default_context()
        with socket.create_connection((target, port), timeout=8) as sock:
            with context.wrap_socket(sock, server_hostname=target) as ssock:
                result["enabled"] = True
                result["tls_version"] = ssock.version()

                cert = ssock.getpeercert()
                if not cert:
                    return result

                subject = cert.get("subject", [])
                issuer = cert.get("issuer", [])

                def parse_name(x):
                    parts = []
                    for item in x:
                        for k, v in item:
                            parts.append(f"{k}={v}")
                    return ", ".join(parts)

                result["cert_subject"] = parse_name(subject) if subject else None
                result["cert_issuer"] = parse_name(issuer) if issuer else None

                nb = cert.get("notBefore")
                na = cert.get("notAfter")

                result["not_before"] = nb
                result["not_after"] = na

                # Convert expiry to days remaining
                if na:
                    exp = datetime.datetime.strptime(na, "%b %d %H:%M:%S %Y %Z")
                    now = datetime.datetime.utcnow()
                    result["days_remaining"] = (exp - now).days

    except Exception as e:
        result["error"] = str(e)

    return result
