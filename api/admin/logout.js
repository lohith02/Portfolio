const { setCorsHeaders } = require("../_lib.js");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.setHeader("Set-Cookie", "portfolio_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Secure");
  return res.status(200).json({ success: true });
};
