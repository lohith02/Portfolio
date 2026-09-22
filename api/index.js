const inquiriesHandler = require("./inquiries.js");
const adminInquiriesHandler = require("./admin/inquiries.js");
const adminLoginHandler = require("./admin/login.js");
const adminLogoutHandler = require("./admin/logout.js");
const { setCorsHeaders } = require("./_lib.js");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "/";

  // Route 1: Admin Inquiries
  if (url.includes("admin/inquiries")) {
    return adminInquiriesHandler(req, res);
  }

  // Route 2: Admin Login
  if (url.includes("admin/login")) {
    return adminLoginHandler(req, res);
  }

  // Route 3: Admin Logout
  if (url.includes("admin/logout")) {
    return adminLogoutHandler(req, res);
  }

  // Route 4: Inquiries (client submission or listing)
  if (url.includes("inquiries")) {
    return inquiriesHandler(req, res);
  }

  // Root or health check
  return res.status(200).json({
    success: true,
    message: "Portfolio API is online",
    time: new Date().toISOString()
  });
};
