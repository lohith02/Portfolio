const {
  setCorsHeaders,
  verifyAdminSession,
  getAllInquiries
} = require("../_lib.js");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json({ success: false, message: "Admin authentication required" });
  }

  try {
    const inquiries = await getAllInquiries();
    return res.status(200).json({
      success: true,
      inquiries: (inquiries || []).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    });
  } catch (error) {
    console.error("Failed to load inquiries:", error);
    return res.status(500).json({ success: false, message: "Unable to load inquiries" });
  }
};
