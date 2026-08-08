# 🚀 Production Deployment Guide: Neon PostgreSQL + Render + Vercel

This guide outlines the exact 3-step deployment procedure for your **S.L.C Lemon Commission Agent Application**.

---

## 🟢 Step 1: Set Up Neon PostgreSQL (Cloud Database)

1. Go to **[Neon Tech (neon.tech)](https://neon.tech)** and sign up for a free account.
2. Click **Create Project** -> Name it `lemon-commission-db`.
3. In your project dashboard, copy your **PostgreSQL Connection String**. It looks like:
   `postgres://username:password@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

## 🔵 Step 2: Deploy Backend API to Render (Flask + Gunicorn)

1. Push your project repository to **GitHub**.
2. Log in to **[Render (render.com)](https://render.com)**.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the Web Service details:
   - **Name**: `lemon-commission-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn wsgi:app`
6. Scroll down to **Environment Variables** and add:
   - **Key**: `DATABASE_URL`
   - **Value**: *(Paste your Neon PostgreSQL connection string from Step 1)*
7. Click **Create Web Service**.
8. Once deployed, copy your Render API URL (e.g., `https://lemon-commission-backend.onrender.com`).

---

## ⚡ Step 3: Deploy Frontend to Vercel (React SPA)

1. Log in to **[Vercel (vercel.com)](https://vercel.com)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set the Root Directory to `frontend`.
5. Under **Environment Variables**, add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://lemon-commission-backend.onrender.com` *(Your Render backend URL)*
6. Click **Deploy**.

---

## 🎉 Verification Checklist

- [x] **Frontend SPA Routing**: Handled automatically via `frontend/vercel.json`.
- [x] **Database Auto-Initialization**: `db.init_db()` automatically runs on Render startup, creating all tables and default Admin user (`username: admin`, `password: admin`) in Neon PostgreSQL.
- [x] **Production WSGI Server**: Uses `Gunicorn` on Render and `Waitress` on Windows.
