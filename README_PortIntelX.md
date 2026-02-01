# PortIntelX 🔥  
**AI-Powered Network Recon + Port Scanner + Risk Intelligence Platform (Enterprise-Style)**

PortIntelX is an industry-grade **network & website exposure assessment tool** that performs:

✅ Port scanning (Quick + Deep)  
✅ Service fingerprinting (Nmap deep scan)  
✅ IP resolution for domains  
✅ SSL/TLS certificate analysis  
✅ Security headers scanning (CSP/HSTS/etc.)  
✅ Tech stack detection (server/framework/CDN/WAF hints)  
✅ CVE mapping with fallback logic  
✅ Risk scoring engine (0–100) + severity breakdown  
✅ Beautiful dashboard + downloadable **multi-page PDF reports with charts**  
✅ Admin panel with scan report deletion controls

> ⚠️ Use only on assets you own or have explicit permission to test.

---

## ✨ Key Features

### 🔍 Scanning Engine
- **Quick Scan**: checks common ports for fast recon  
- **Deep Scan**: detects **OS guess + services + versions** using Nmap fingerprinting

### 🌐 Domain → IP Resolution
- Automatically resolves the **IP address of any domain**
- Displays it in UI + includes it inside the PDF report

### 🔒 SSL/TLS Analyzer
- TLS enabled status
- TLS version (example: TLSv1.3)
- Certificate issuer/subject
- Validity start/end
- Days remaining until expiry

### 🛡️ Security Headers Scanner
Checks for important security headers:
- Content-Security-Policy
- X-Frame-Options
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy

Also generates a **headers score** out of 100.

### 🛰️ Tech Stack Detection
Detects web stack signals like:
- Web server: Nginx / Apache / LiteSpeed / IIS
- Framework hints: React / WordPress / Laravel etc.
- CDN/WAF hints: Cloudflare etc.

### 🧨 CVE Mapping (Improved)
- Maps CVEs against detected services and versions
- **Fallback search logic** if versions are missing or mismatched
- Adds **CVE mapping notes** when CVEs are not detected (explains why)

### 📊 Risk Scoring Engine (Enterprise)
- Risk score: **0–100**
- Risk label: LOW / MEDIUM / HIGH / CRITICAL
- Weighted scoring logic:
  - Remote access services (RDP/SMB) = higher risk
  - Database ports exposed = higher risk
  - Missing security headers = higher risk
  - CVE groups = very high risk impact

### 📄 Multi-Page PDF Report (Client Ready)
Report includes:
✅ Cover page  
✅ Executive summary  
✅ Scope & methodology  
✅ Risk score gauge chart  
✅ Severity breakdown charts  
✅ Top risky ports chart  
✅ SSL/TLS section  
✅ Security headers section  
✅ Tech stack detection  
✅ CVE findings + fallback notes  
✅ Open ports & services table  
✅ Disclaimer  

### 🛡️ Admin Panel (Enterprise Control)
Admin can:
- View all users
- View all scan reports
- **Delete any scan report permanently** (authorization protected)

---

## 🧱 Tech Stack

### Backend
- **FastAPI**
- SQLAlchemy + SQLite
- Uvicorn
- Nmap (deep scan)
- Passlib / JWT auth
- CVE lookup module
- Custom Risk Engine

### Frontend
- **React + Vite**
- Modern SaaS UI styling (glass effect)
- Dashboard widgets + charts
- Multi-page PDF printing

---

## 📁 Project Structure

```
PortIntelX/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   ├── scanner.py
│   ├── cve_lookup.py
│   ├── risk_engine.py
│   ├── security_headers.py
│   ├── tech_detection.py
│   ├── ssl_analyzer.py
│   ├── report_generator.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api.js
│   │   ├── styles.css
│   │   └── ...
│   └── package.json
│
└── README.md
```

---

## ✅ Setup Instructions (Windows + VS Code)

### 1️⃣ Clone Repo
```bash
git clone <your-repo-url>
cd PortIntelX
```

---

## ⚙️ Backend Setup

### 2️⃣ Create Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### 3️⃣ Install Requirements
```bash
pip install -r requirements.txt
```

> If requirements.txt is missing:
```bash
pip install fastapi uvicorn sqlalchemy python-dotenv passlib[bcrypt] python-jose slowapi requests python-nmap
```

### 4️⃣ Run Backend
```bash
uvicorn main:app --reload --port 8000
```

Backend will run at:
✅ `http://127.0.0.1:8000`

---

## 🎨 Frontend Setup

### 5️⃣ Install Frontend Packages
```bash
cd ../frontend
npm install
```

### 6️⃣ Run Frontend
```bash
npm run dev
```

Frontend will run at:
✅ `http://localhost:5173`

---

## 🔐 Admin Login (Only for You)
✅ Default Admin:
- **Email:** `admin@portintelx.com`
- **Password:** `Admin@123`

> ⚠️ Do NOT expose this publicly. Change it after deployment.

---

## 🧪 How to Use PortIntelX

1. Login (Admin or User)
2. Go to **Scanner**
3. Enter:
   - Domain or IP (example: `example.com`)
   - Scan Mode: Quick / Deep
   - Port Range: quick / full / 1-1000
4. Run scan
5. View report
6. Download PDF (multi-page report)

---

## 🧾 API Endpoints (Important)

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Scanning
- `POST /scan`
- `GET /history`
- `GET /history/{scan_id}`

### Admin
- `GET /admin/users`
- `GET /admin/scans`
- `DELETE /admin/scans/{scan_id}` ✅

---

## 🛑 Troubleshooting

### ❌ Blank White Screen in Frontend
✅ Fix by:
- Open DevTools Console (F12)
- Look for wrong imports like:
  - `import { logout } from "../api"`
  - `import { register } from "../api"`
  - `import { Login } from "../api"`
- Use only:
  - `apiGet`
  - `apiPost`
  - `apiDelete`

---

### ❌ Scan takes too much time
✅ Reasons:
- Deep scan uses Nmap which is slow
- Target may block probes
- Full port scan = heavy

✅ Use:
- `quick` first
- then deep scan only if needed

---

## 🚀 Future Improvements (Enterprise Roadmap)
✅ API Keys per client  
✅ Rate limit per user plan  
✅ Scheduled scans  
✅ Compare 2 reports  
✅ Dark web leak check (HIBP API)  
✅ Export PDF + JSON + CSV  
✅ Cloud deployment with Docker + HTTPS  

---

## 📜 Disclaimer
This tool is intended for **authorized security testing only**.  
The author is not responsible for misuse or illegal activity.

---

## ⭐ Support
If you like this project, give it a ⭐ on GitHub and share it with your cybersecurity community!
