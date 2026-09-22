const crypto = require("crypto");

const {
  setCorsHeaders,
  parseRequestBody,
  saveToSupabase,
  syncToGoogleSheets,
  getMailTransporter,
  memoryInquiries,
  getAllInquiries,
  verifyAdminSession
} = require("./_lib.js");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Admin can retrieve inquiries
  // Otherwise return a health check
  if (req.method === "GET") {
    if (verifyAdminSession(req)) {
      try {
        const inquiries = await getAllInquiries();

        return res.status(200).json({
          success: true,
          inquiries
        });
      } catch (error) {
        console.error("Error fetching inquiries:", error.message);

        return res.status(500).json({
          success: false,
          message: "Unable to load inquiries"
        });
      }
    }

    return res.status(200).json({
      success: true,
      status: "Inquiries service is active"
    });
  }

  // POST: Client submits new inquiry
  if (req.method === "POST") {
    const body = parseRequestBody(req);

    const {
      name,
      email,
      service,
      date,
      location,
      budget,
      details
    } = body;

    const fields = [name, email, service, details];

    const validEmail =
      typeof email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (
      fields.some(
        (field) => typeof field !== "string" || !field.trim()
      ) ||
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

    // Temporary fallback storage
    memoryInquiries.push(inquiry);

    // Save to Supabase and Google Sheets
    await Promise.allSettled([
      saveToSupabase(inquiry),
      syncToGoogleSheets(inquiry)
    ]);

    // Send email notification
    const transporter = getMailTransporter();

    if (
      transporter &&
      process.env.CONTACT_EMAIL &&
      process.env.SMTP_USER
    ) {
      try {
        await transporter.sendMail({
          from: `Portfolio Inquiries <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL,
          replyTo: email.trim(),
          subject: `New ${service.trim()} inquiry from ${name.trim()}`,
          text: [
            `Name: ${name.trim()}`,
            `Email: ${email.trim()}`,
            `Service: ${service.trim()}`,
            `Shoot date: ${date || "Not specified"}`,
            `Location: ${location || "Not specified"}`,
            `Budget: ${budget || "Not specified"}`,
            "",
            "Project details:",
            details.trim()
          ].join("\n")
        });
      } catch (error) {
        console.error(
          "Email notification failed:",
          error.message
        );
      }
    }

    return res.status(201).json({
      success: true,
      inquiry
    });
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed"
  });
};