const {
  setCorsHeaders,
  parseRequestBody,
  safeEqual,
  generateAdminToken
} = require("../_lib.js");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const adminUsername = process.env.ADMIN_USERNAME || "PreethamShetty";
  const adminPassword = process.env.ADMIN_PASSWORD || "Sinchana$006";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || "default_session_secret_portfolio_key";

  const body = parseRequestBody(req);
  const { username, password } = body;

  if (!safeEqual(username, adminUsername) || !safeEqual(password, adminPassword)) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }

  const token = generateAdminToken(sessionSecret);
  const isHttps = Boolean(req.secure || req.headers?.["x-forwarded-proto"] === "https");

  res.setHeader(
    "Set-Cookie",
    `portfolio_admin=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${isHttps ? "; Secure" : ""}`
  );
  return res.status(200).json({ success: true, token });
};
