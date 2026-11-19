// middleware to authenticate JWT tokens
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  // No Authorization header
  if (!header) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Extract token — support both "Bearer <token>" and raw token
  const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : header.trim();

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    // ✅ FIX: verification fail হলে 401 — next() নয়
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;