# 🍋 S.L.C Lemon & Fruit Exports - Enterprise ERP & Accounting Platform

A full-stack, enterprise-grade Commission Agent & ERP Management Platform built for **S.L.C Lemon Company (Lemon & Fruit Exports Commission Agent, Nakrekal)**.

Modernized from legacy PHP into a high-performance **React Single Page Application**, **Modular Flask Python Backend API**, and **Neon Cloud Serverless PostgreSQL** database architecture.

---

## 🌟 Key Features

### 📋 Bill & Commission Management
- **Add Bill & Multi-Channel Lots**: Add farmers' lemon bag lots across multiple dynamic channels (bags count, price per bag) in a single transaction.
- **Form Alignment & Styling**: Precision left-aligned forms with standard `.form-label` layout matching original agency standards.
- **Bill Modal Receipts**: View printable PDF receipts with **PDF Download (`jsPDF`/`html2canvas`)**, **SMS generation & Clipboard utilities**, and **Print View**.
- **Interactive Delete Confirmation**: In-app modal dialog prevents accidental deletions.
- **Date & 12-Hour AM/PM Time Formatting**: Live 12-hour AM/PM clock picker with database persistence.

### 💰 Financial Ledgers & Reports
- **Balance Sheet**: Automated daily total buy calculations, hamali deductions (₹5/bag or custom rate), commission rates (4-5%), damaged goods deductions, expenditures, and net payable amounts.
- **Buyers Details & Local Sale**: Track local buyers, bag lots, and cash settlements.
- **Expenditures & Cash Collection**: Track daily operational expenses and cash collected at the counter.
- **Beat Paper Loading Reports**: Automated loading summaries for transportation.
- **Farmer (Kisan) Balances**: Real-time balance tracking per farmer by year and search filters.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 19, React Router v7, Axios, Vanilla CSS System |
| **Backend API** | Python 3.11, Flask, Flask-CORS, Gunicorn WSGI |
| **Database** | Neon Cloud PostgreSQL (Production) / SQLite (Offline Local Dev) |
| **Document Export** | jsPDF, html2canvas |
| **Hosting & Deployment** | Vercel (Frontend SPA) + Render (Flask Web Service) |

---

## 🏗️ Project Architecture

```
Free-Lancer/
├── frontend/                  # React Single Page Application
│   ├── src/
│   │   ├── api/config.js      # Centralized environment API config
│   │   ├── components/        # Header, BillModal, TimePicker, Layout
│   │   ├── pages/             # Home, BuyersDetails, Expenditures, CashCollection, BalanceSheet, etc.
│   │   └── styles/            # Modal, table, and global design system
│   ├── vercel.json            # Vercel SPA routing rewrites
│   └── package.json
├── backend/                   # Python Flask Modular REST API
│   ├── app.py                 # Main Flask application entrypoint & Blueprint registry
│   ├── db.py                  # Dual PostgreSQL (Neon) & SQLite connection handler
│   ├── wsgi.py                # Gunicorn/Waitress production runner
│   ├── requirements.txt       # Production dependencies
│   └── routes/                # Feature Blueprints (bills, auth, cash, expenditures, etc.)
├── Dockerfile                 # Root production Docker container config
├── render.yaml                # Render cloud deployment specification
└── DEPLOYMENT_GUIDE.md        # Step-by-step deployment guide
```

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Backend server runs at:* `http://127.0.0.1:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs at:* `http://localhost:5173`

---

## ☁️ Production Deployment

Follow the detailed step-by-step guide in [DEPLOYMENT_GUIDE.md](file:///c:/Users/pavan/Desktop/Free%20Lancer/DEPLOYMENT_GUIDE.md) to deploy:
1. **Neon PostgreSQL Cloud Database**
2. **Render Python Web Service Backend**
3. **Vercel React SPA Frontend**

---

## 📜 License
Privately built for S.L.C Lemon Company. All rights reserved.
