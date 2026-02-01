import asyncio
import socket
import nmap

COMMON_SERVICES = {
    21: "FTP",
    22: "SSH",
    23: "TELNET",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    139: "NETBIOS",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    8080: "HTTP-ALT"
}

# -----------------------------
# ✅ FAST ASYNC PORT SCANNER
# -----------------------------
async def check_port(target_ip: str, port: int, timeout: float = 0.35):
    try:
        conn = asyncio.open_connection(target_ip, port)
        reader, writer = await asyncio.wait_for(conn, timeout=timeout)

        banner = ""
        try:
            # simple banner request (works best for HTTP ports)
            writer.write(b"HEAD / HTTP/1.0\r\n\r\n")
            await writer.drain()
            data = await asyncio.wait_for(reader.read(140), timeout=0.5)
            banner = data.decode(errors="ignore").strip()
        except:
            banner = ""

        writer.close()
        try:
            await writer.wait_closed()
        except:
            pass

        return {
            "port": port,
            "service": COMMON_SERVICES.get(port, "Unknown Service"),
            "banner": banner[:140] if banner else ""
        }

    except:
        return None


async def scan_ports(target: str, start_port: int, end_port: int, concurrency: int = 250):
    target_ip = socket.gethostbyname(target)

    ports = list(range(start_port, end_port + 1))
    sem = asyncio.Semaphore(concurrency)
    open_ports = []

    async def sem_task(p):
        async with sem:
            return await check_port(target_ip, p)

    tasks = [asyncio.create_task(sem_task(p)) for p in ports]
    results = await asyncio.gather(*tasks)

    for r in results:
        if r:
            open_ports.append(r)

    return target_ip, open_ports


# -----------------------------
# ✅ NMAP INDUSTRY SCANNER
# (Services + Versions + OS Guess)
# -----------------------------
def nmap_deep_scan(target: str):
    """
    Returns:
    - os_guess: string (best effort)
    - services: list of dict {port, name, product, version, extrainfo, state}
    """

    scanner = nmap.PortScanner()

    # -sV = service/version detection
    # -O = OS guess (needs permission sometimes)
    # --osscan-guess makes OS guessing more aggressive
    args = "-sV -O --osscan-guess"

    try:
        scanner.scan(target, arguments=args)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "os_guess": "Unknown",
            "services": []
        }

    os_guess = "Unknown"
    services = []

    try:
        hosts = scanner.all_hosts()
        if not hosts:
            return {
                "success": True,
                "os_guess": "Unknown",
                "services": []
            }

        host = hosts[0]

        # ✅ OS detection (best effort)
        if "osmatch" in scanner[host]:
            osmatches = scanner[host]["osmatch"]
            if osmatches and len(osmatches) > 0:
                os_guess = osmatches[0].get("name", "Unknown")

        # ✅ Service/version detection
        if "tcp" in scanner[host]:
            for port, info in scanner[host]["tcp"].items():
                services.append({
                    "port": port,
                    "state": info.get("state", ""),
                    "name": info.get("name", ""),
                    "product": info.get("product", ""),
                    "version": info.get("version", ""),
                    "extrainfo": info.get("extrainfo", "")
                })

        services = sorted(services, key=lambda x: x["port"])

        return {
            "success": True,
            "os_guess": os_guess,
            "services": services
        }

    except Exception:
        return {
            "success": True,
            "os_guess": "Unknown",
            "services": []
        }
