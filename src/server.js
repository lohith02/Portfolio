const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { rateLimit } = require("express-rate-limit");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4173;
const frontendDir = path.resolve(__dirname, "../../frontend ");
const dataDir = path.resolve(__dirname, "../data");
const inquiriesFile = path.join(dataDir, "inquiries.json");

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const mailTransporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
  : null;

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || "default_session_secret_key";
const adminSessions = new Map();

async function readLocalInquiries() {
  try {
    return JSON.parse(await fs.promises.readFile(inquiriesFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalInquiries(inquiries) {
  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.writeFile(inquiriesFile, `${JSON.stringify(inquiries, null, 2)}\n`, "utf8");
}

async function syncToGoogleSheets(inquiry) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!sheetsUrl) return;

  try {
    await fetch(sheetsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addInquiry",
        data: inquiry
      })
    });
  } catch (err) {
    console.error("Google Sheets sync error:", err.message);
  }
}

async function fetchFromGoogleSheets() {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!sheetsUrl) return null;

  try {
    const res = await fetch(`${sheetsUrl}?action=getInquiries`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.inquiries)) return data.inquiries;
    }
  } catch (err) {
    console.error("Google Sheets fetch error:", err.message);
  }
  return null;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createAdminToken() {
  const nonce = crypto.randomBytes(32).toString("hex");
  return `${nonce}.${crypto.createHmac("sha256", sessionSecret).update(nonce).digest("hex")}`;
}

function requireAdmin(req, res, next) {
  const token = req.headers.cookie?.match(/portfolio_admin=([^;]+)/)?.[1];
  const createdAt = token && adminSessions.get(token);
  if (!token || !createdAt || Date.now() - createdAt > 8 * 60 * 60 * 1000) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ success: false, message: "Admin authentication required" });
  }
  next();
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
}));
app.use(express.json({ limit: "10kb" }));

app.get("/admin.html", (req, res) => {
  const token = req.headers.cookie?.match(/portfolio_admin=([^;]+)/)?.[1];
  if (!token || !adminSessions.has(token)) {
    return res.sendFile(path.join(frontendDir, "admin-login.html"));
  }
  res.sendFile(path.join(frontendDir, "admin.html"));
});

app.use(express.static(frontendDir));

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!safeEqual(username, adminUsername) || !safeEqual(password, adminPassword)) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }

  const token = createAdminToken();
  adminSessions.set(token, Date.now());
  res.setHeader(
    "Set-Cookie",
    `portfolio_admin=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
  );
  res.json({ success: true });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const token = req.headers.cookie?.match(/portfolio_admin=([^;]+)/)?.[1];
  if (token) adminSessions.delete(token);
  res.setHeader("Set-Cookie", "portfolio_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  res.json({ success: true });
});

app.get("/api/admin/inquiries", requireAdmin, async (req, res) => {
  try {
    const sheetsData = await fetchFromGoogleSheets();
    const inquiries = sheetsData || await readLocalInquiries();
    res.json({
      success: true,
      inquiries: inquiries.sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
    });
  } catch (error) {
    console.error("Unable to read inquiries:", error.message);
    res.status(500).json({ success: false, message: "Unable to load inquiries" });
  }
});

app.post("/api/inquiries", async (req, res) => {
  const { name, email, service, date, location, budget, details } = req.body || {};

  const fields = [name, email, service, details];
  const validEmail = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  if (
    fields.some((field) => typeof field !== "string" || !field.trim()) ||
    !validEmail ||
    name.length > 120 ||
    email.length > 254 ||
    service.length > 80 ||
    details.length > 5000
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid inquiry details"
    });
  }

  try {
    const inquiries = await readLocalInquiries();
    const inquiry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      service: service.trim(),
      event_date: date || "Not specified",
      location: location?.trim() || "Not specified",
      budget: budget?.trim() || "Not specified",
      details: details.trim(),
      created_at: new Date().toISOString()
    };

    inquiries.push(inquiry);
    await writeLocalInquiries(inquiries);
    await syncToGoogleSheets(inquiry);

    if (mailTransporter && process.env.CONTACT_EMAIL && process.env.SMTP_USER) {
      try {
        await mailTransporter.sendMail({
          from: `Portfolio Inquiries <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL,
          replyTo: email.trim(),
          subject: `New ${service} inquiry from ${name.trim()}`,
          text: [
            `Name: ${name.trim()}`,
            `Email: ${email.trim()}`,
            `Service: ${service}`,
            `Shoot date: ${date || "Not specified"}`,
            `Location: ${location || "Not specified"}`,
            `Budget: ${budget || "Not specified"}`,
            "",
            "Project details:",
            details.trim()
          ].join("\n")
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError.message);
      }
    }

    res.status(201).json({ success: true, inquiry: { id: inquiry.id, created_at: inquiry.created_at } });
  } catch (error) {
    console.error("Unable to process inquiry:", error.message);
    res.status(500).json({ success: false, message: "Unable to process inquiry right now" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});