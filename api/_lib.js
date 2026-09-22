const crypto = require("crypto");
const nodemailer = require("nodemailer");

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getMailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// Stateless HMAC-signed token generation and verification for serverless
function generateAdminToken(sessionSecret) {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${timestamp}.${nonce}`;
  const hmac = crypto.createHmac("sha256", sessionSecret).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

function extractAdminToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === "string") {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) return match[1].trim();
  }
  const cookies = parseCookies(req.headers?.cookie);
  if (cookies.portfolio_admin) return cookies.portfolio_admin.trim();
  return null;
}

function verifyAdminSession(req) {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || "portfolio_secret_secure_key_2026";
  const token = extractAdminToken(req);
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [timestampStr, nonce, receivedHmac] = parts;
  const timestamp = Number(timestampStr);
  if (!timestamp || isNaN(timestamp)) return false;

  // Session expires after 8 hours
  if (Date.now() - timestamp > 8 * 60 * 60 * 1000) {
    return false;
  }

  const payload = `${timestampStr}.${nonce}`;
  const expectedHmac = crypto.createHmac("sha256", sessionSecret).update(payload).digest("hex");

  return safeEqual(receivedHmac, expectedHmac);
}

function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
}

// In-memory fallback
let memoryInquiries = [];

// ================= STORAGE: SUPABASE =================
function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
}

async function saveToSupabase(inquiry) {
  if (!hasSupabase()) return false;
  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        name: inquiry.name,
        email: inquiry.email,
        service: inquiry.service,
        event_date: inquiry.event_date && inquiry.event_date !== "Not specified" ? inquiry.event_date : null,
        location: inquiry.location,
        budget: inquiry.budget,
        details: inquiry.details,
        created_at: inquiry.created_at
      })
    });
    return res.ok;
  } catch (err) {
    console.error("Supabase save error:", err.message);
    return false;
  }
}

async function fetchFromSupabase() {
  if (!hasSupabase()) return null;
  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/inquiries?select=*&order=created_at.desc`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error("Supabase fetch error:", err.message);
  }
  return null;
}

// ================= STORAGE: GOOGLE SHEETS =================
async function syncToGoogleSheets(inquiry) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!sheetsUrl) return false;

  try {
    const response = await fetch(sheetsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addInquiry",
        data: inquiry
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Google Sheets sync error:", error.message);
    return false;
  }
}

async function fetchFromGoogleSheets() {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!sheetsUrl) return null;

  try {
    const response = await fetch(`${sheetsUrl}?action=getInquiries`, {
      method: "GET"
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.inquiries)) return data.inquiries;
    }
  } catch (error) {
    console.error("Google Sheets fetch error:", error.message);
  }
  return null;
}

// ================= UNIFIED INQUIRY RETRIEVAL =================
async function getAllInquiries() {
  // 1. Try Supabase first if configured
  if (hasSupabase()) {
    const supabaseData = await fetchFromSupabase();
    if (Array.isArray(supabaseData)) {
      return supabaseData;
    }
  }

  // 2. Try Google Sheets if configured
  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    const sheetsData = await fetchFromGoogleSheets();
    if (Array.isArray(sheetsData)) {
      return sheetsData;
    }
  }

  // 3. Fallback to in-memory
  return memoryInquiries;
}

module.exports = {
  safeEqual,
  getMailTransporter,
  parseCookies,
  generateAdminToken,
  verifyAdminSession,
  parseRequestBody,
  setCorsHeaders,
  memoryInquiries,
  hasSupabase,
  saveToSupabase,
  fetchFromSupabase,
  syncToGoogleSheets,
  fetchFromGoogleSheets,
  getAllInquiries
};
