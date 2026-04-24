const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/users.model");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

function getReadableErrorMessage(error) {
  if (!error) {
    return "Unknown error.";
  }
  if (error.code === "ECONNREFUSED") {
    return "Database connection refused. Start PostgreSQL or update DATABASE_URL.";
  }
  if (error.message) {
    return error.message;
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    const nested = error.errors[0];
    if (nested?.message) {
      return nested.message;
    }
  }
  return "Unexpected server error.";
}

function issueToken(user) {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error("SECRET_KEY is required.");
  }

  return jwt.sign(
    {
      role: user.role,
      email: user.email,
    },
    secret,
    {
      subject: String(user.id),
      expiresIn: "7d",
    }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "name, email, phone and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      passwordHash,
      role: "user",
    });

    const token = issueToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed.",
      error: getReadableErrorMessage(error),
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = issueToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed.",
      error: getReadableErrorMessage(error),
    });
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

router.get("/admin", requireAuth, requireRole("admin"), (_req, res) => {
  return res.json({ message: "Admin access granted." });
});

module.exports = router;
