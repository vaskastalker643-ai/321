const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/users.model");

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice("Bearer ".length).trim();
}

async function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const secret = process.env.SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ message: "Server secret is not configured." });
  }

  try {
    const payload = jwt.verify(token, secret);
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "Invalid token user." });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for your role." });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
