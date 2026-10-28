require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const NETLIFY_FRONTEND_URL = "https://glowing-cajeta-8abf0f.netlify.app";
const allowedOrigins = [
  NETLIFY_FRONTEND_URL,
  process.env.CLIENT_URL,
  /^https?:\/\/localhost(?::\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "Signup API is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Copy .env.example to .env and configure it.");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    app.listen(PORT, () => {
      console.log(`Task 2 API running at http://localhost:${PORT}`);
      console.log("Connected to MongoDB.");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

