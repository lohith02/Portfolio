# Vercel Deployment & Inquiries Storage Guide

## 1. What was causing the "File not found" / JSON Error
On Vercel, the admin page previously showed:
`Unexpected token 'F', "File not f"... is not valid JSON`

This occurred because:
1. **Legacy Vercel Configuration**: `vercel.json` used legacy `"routes"` with `"outputDirectory": "dist"`. On Vercel, this caused requests to `/api/admin/inquiries` and `/api/inquiries` to look for non-existent static files in `dist/` rather than invoking Serverless Functions. Vercel responded with `404 "File not found"`.
2. **JSON Parsing on Error Text**: `response.json()` crashed when trying to parse the plain text `"File not found"`.
3. **Dedicated Endpoints**: We now have dedicated Vercel Serverless Functions:
   - `api/inquiries.js` &rarr; `POST /api/inquiries` (Client submits shoot request)
   - `api/admin/inquiries.js` &rarr; `GET /api/admin/inquiries` (Admin fetches inquiries)
   - `api/admin/login.js` &rarr; `POST /api/admin/login` (Admin signs in with HMAC session)
   - `api/admin/logout.js` &rarr; `POST /api/admin/logout` (Admin logs out)
   - `api/index.js` &rarr; master API fallback

---

## 2. Inquiries Storage: Supabase & Google Sheets
Your inquiries are now saved directly and persistently to **Supabase** (with optional Google Sheets sync).

### Environment Variables for Vercel
Go to **Vercel Dashboard &rarr; Your Project &rarr; Settings &rarr; Environment Variables** and add the following:

| Key | Recommended / Configured Value | Purpose |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://ldnmeggusmbgdrsgfgwt.supabase.co` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase Service Role Key)* | Full read/write access to `inquiries` table |
| `ADMIN_USERNAME` | `admin` | Your admin username |
| `ADMIN_PASSWORD` | `admin123` | Your admin password |
| `ADMIN_SESSION_SECRET` | `portfolio_secret_secure_key_2026` | Key used to sign stateless auth cookies |
| `CONTACT_EMAIL` | `bilimaggalohith2005@gmail.com` | Receives instant email notifications |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | TLS |
| `SMTP_USER` | `bilimaggalohith2005@gmail.com` | Your Gmail address |
| `SMTP_PASSWORD` | `knzpcepmkxssstta` | Your Gmail App Password |
| `GOOGLE_SHEETS_WEBHOOK_URL` | *(Optional Apps Script Webhook URL)* | Optional duplicate sync to Google Sheets |

---

## 3. How to Deploy to Vercel

### Option A: If connected via GitHub
If your Vercel project is linked to your GitHub repository, push your changes:
```bash
git push origin main
```
Vercel will immediately build and deploy the new Serverless Functions.

### Option B: Deploying directly via Vercel CLI
From the root of your project directory in terminal:
```bash
npx vercel --prod
```
Log in when prompted, select your existing Vercel project, and it will deploy instantly.
