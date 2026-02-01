from fastapi import FastAPI, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import User, ScanHistory
from auth import hash_password, verify_password, create_access_token, get_current_user, admin_only
from scanner import scan_ports, nmap_deep_scan
from cve_lookup import search_cves, build_cve_query
from ai_engine import generate_ai_report
from report_generator import create_pdf_report
from fastapi.middleware.cors import CORSMiddleware
import json
import time
import socket
import os
from dotenv import load_dotenv

from security_headers import scan_security_headers
from tech_detection import detect_tech_stack
from risk_engine import calculate_risk
from ssl_analyzer import ssl_tls_analyze

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

load_dotenv()

API_ACCESS_KEY = os.getenv("PORTINTELX_API_KEY", "PORTINTELX_DEMO_KEY")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="PortIntelX API", version="3.2.0")
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"success": False, "detail": "Rate limit exceeded. Try again later."}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def create_default_admin(db: Session):
    admin_email = "admin@portintelx.com"
    exists = db.query(User).filter(User.email == admin_email).first()
    if not exists:
        admin_user = User(
            full_name="PortIntelX Admin",
            email=admin_email,
            password_hash=hash_password("Admin@123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    create_default_admin(db)

COMMON_PORTS = [
    21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 3306, 3389, 8080
]

# ------------------ Schemas ------------------

class RegisterSchema(BaseModel):
    full_name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class ScanSchema(BaseModel):
    target: str
    port_range: str
    scan_mode: str = "quick"

# ------------------ API KEY CHECK ------------------

def check_api_key(x_api_key: str = Header(default="")):
    if x_api_key and x_api_key == API_ACCESS_KEY:
        return True
    return False

# ------------------ AUTH ROUTES ------------------

@app.post("/auth/register")
def register_user(payload: RegisterSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    return {"success": True, "message": "User registered successfully"}

@app.post("/auth/login")
def login_user(payload: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials or account disabled")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": user.id, "role": user.role})
    return {
        "success": True,
        "token": token,
        "role": user.role,
        "user": {"id": user.id, "full_name": user.full_name, "email": user.email}
    }

@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }

# ------------------ SCAN ROUTES ------------------

@app.post("/scan")
@limiter.limit("10/minute")
async def run_scan(
    request: Request,
    payload: ScanSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resolved_ip = socket.gethostbyname(payload.target)
    except Exception:
        raise HTTPException(status_code=400, detail="Target domain/IP could not be resolved")

    scan_mode = (payload.scan_mode or "quick").lower()
    if scan_mode not in ["quick", "deep"]:
        raise HTTPException(status_code=400, detail="scan_mode must be quick or deep")

    pr = payload.port_range.strip().lower()
    start_time = time.time()

    open_ports = []

    # ✅ Quick scan uses common ports
    if pr == "quick":
        for p in COMMON_PORTS:
            ip, result = await scan_ports(payload.target, p, p)
            if result:
                open_ports.extend(result)
    else:
        try:
            if pr == "full":
                start_port, end_port = 1, 65535
            else:
                start_port, end_port = pr.split("-")
                start_port, end_port = int(start_port.strip()), int(end_port.strip())
        except:
            raise HTTPException(status_code=400, detail="Invalid port range. Use quick OR full OR 1-1000")

        if start_port < 1 or end_port > 65535 or start_port > end_port:
            raise HTTPException(status_code=400, detail="Port range must be between 1-65535")

        ip, open_ports = await scan_ports(payload.target, start_port, end_port)

    os_guess = "Unknown"
    running_services = []

    # ✅ Deep scan (OS + services)
    if scan_mode == "deep":
        deep = nmap_deep_scan(payload.target)
        os_guess = deep.get("os_guess", "Unknown")
        running_services = deep.get("services", [])

    # ✅ Website checks
    sec_headers = scan_security_headers(payload.target)
    tech = detect_tech_stack(payload.target)

    # ✅ SSL/TLS analysis
    ssl_info = ssl_tls_analyze(payload.target, 443)

    # ✅ CVE mapping with fallback
    cve_findings = []
    cve_notes = []

    if running_services:
        for svc in running_services[:12]:
            base_query = build_cve_query(svc)
            service_name = svc.get("name", "")

            queries_to_try = []
            if base_query:
                queries_to_try.append(base_query)

            # ✅ Fallback if product/version not found
            if service_name and service_name not in queries_to_try:
                queries_to_try.append(service_name)

            found_any = False

            for q in queries_to_try:
                cves = search_cves(q)
                if cves:
                    found_any = True
                    cve_findings.append({
                        "query": q,
                        "service": svc.get("name", ""),
                        "product": svc.get("product", ""),
                        "version": svc.get("version", ""),
                        "port": svc.get("port", ""),
                        "cves": cves
                    })
                    break

            if not found_any:
                cve_notes.append({
                    "service": svc.get("name", ""),
                    "port": svc.get("port", ""),
                    "reason": "No CVEs matched (may be hardened or API lookup mismatch)."
                })

    risk = calculate_risk(open_ports, cve_findings, sec_headers, tech)

    scan_result = {
        "target": payload.target,
        "ip": resolved_ip,
        "port_range": payload.port_range,
        "scan_mode": scan_mode,

        "os_guess": os_guess,
        "running_services": running_services,

        "security_headers": sec_headers,
        "tech_stack": tech,
        "ssl_tls": ssl_info,

        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "risk_reasons": risk["reasons"],

        "total_open_ports": len(open_ports),
        "open_ports": open_ports,

        "cve_findings": cve_findings,
        "cve_notes": cve_notes,

        "duration_seconds": round(time.time() - start_time, 2),
    }

    scan_result["ai_analysis"] = generate_ai_report(scan_result)

    history = ScanHistory(
        user_id=current_user.id,
        target=payload.target,
        port_range=payload.port_range,
        result_json=json.dumps(scan_result)
    )
    db.add(history)
    db.commit()

    return {"success": True, "data": scan_result}

@app.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).order_by(ScanHistory.id.desc()).all()
    return [{
        "id": s.id,
        "target": s.target,
        "port_range": s.port_range,
        "created_at": str(s.created_at)
    } for s in scans]

@app.get("/history/{scan_id}")
def get_history_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return json.loads(scan.result_json)

# ------------------ ADMIN ROUTES ------------------

@app.get("/admin/users")
def admin_get_users(db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    users = db.query(User).order_by(User.id.desc()).all()
    return [{
        "id": u.id,
        "full_name": u.full_name,
        "email": u.email,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": str(u.created_at)
    } for u in users]

@app.get("/admin/scans")
def admin_all_scans(db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    scans = db.query(ScanHistory).order_by(ScanHistory.id.desc()).limit(100).all()
    return [{
        "id": s.id,
        "user_id": s.user_id,
        "target": s.target,
        "port_range": s.port_range,
        "created_at": str(s.created_at)
    } for s in scans]

@app.delete("/admin/scans/{scan_id}")
def admin_delete_scan(scan_id: int, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan report not found")

    db.delete(scan)
    db.commit()
    return {"success": True, "message": f"Scan report {scan_id} deleted successfully"}
