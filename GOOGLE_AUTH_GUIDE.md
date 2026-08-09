# 🔑 Official Google OAuth 2.0 Setup Guide

This guide explains how to enable 1-click **Native Google Sign-In (`accounts.google.com`)** for your **Agri Commission Manager** application.

---

## 🟢 Step 1: Get a Free Google OAuth Client ID

1. Open the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Log in with your Google account.
3. Click the project dropdown at the top bar $\rightarrow$ Click **New Project** $\rightarrow$ Name it `Agri Commission Manager` $\rightarrow$ Click **Create**.
4. In the left menu, navigate to **APIs & Services** $\rightarrow$ **OAuth consent screen**.
   - Select **User Type**: **External** $\rightarrow$ Click **Create**.
   - Enter **App name**: `Agri Commission Manager`.
   - Enter **User support email**: Your email address.
   - Enter **Developer contact information**: Your email address.
   - Click **Save and Continue** through the scopes & test users steps.
5. In the left menu, click **Credentials**.
   - Click **+ CREATE CREDENTIALS** at the top $\rightarrow$ Select **OAuth client ID**.
   - Select **Application type**: **Web application**.
   - Enter **Name**: `Agri Commission Manager Web Client`.
   - Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
     - `http://localhost:5173`
     - `http://localhost:5174`
     - `https://agri-commission-manager.vercel.app` *(Your Vercel URL)*
   - Under **Authorized redirect URIs**, click **+ ADD URI** and add:
     - `http://localhost:5173`
     - `https://agri-commission-manager.vercel.app`
   - Click **Create**.

---

## 🔵 Step 2: Copy Your Client ID

A popup window will display your **Client ID**. It looks like this:
`1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

---

## ⚡ Step 3: Add Client ID to Environment Variables

### Local Development (`frontend/.env`)
Create or edit `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### Production (Vercel Dashboard)
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)** $\rightarrow$ Select **`agri-commission-manager`**.
2. Go to **Settings** $\rightarrow$ **Environment Variables**.
3. Add a new variable:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: *(Paste your Google Client ID)*
4. Click **Save**.

---

## 🎉 Verification

Once added, clicking **Continue with Google** on your site will open the official Google Sign-In popup (`accounts.google.com`), allowing users to click their Google profile picture to sign in!
