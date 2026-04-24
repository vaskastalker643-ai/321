const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth.routes");
const appointmentsRoutes = require("./src/routes/appointments.routes");
const reviewsRoutes = require("./src/routes/reviews.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/reviews", reviewsRoutes);

// Serve existing frontend files as static assets.
app.use(express.static(ROOT_DIR));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/services", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "services.html"));
});

app.get("/reviews", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "reviews.html"));
});

app.get("/color-analyzer", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "color_analyzer.html"));
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "admin.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
