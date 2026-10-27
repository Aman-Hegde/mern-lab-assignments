const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup", async (req, res) => {
  try {
    const body = req.body || {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });

    // Do not include the user document because it contains the password hash.
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // MongoDB error code 11000 means a unique index was violated.
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    console.error("Signup error:", error.message);
    return res.status(500).json({ message: "Unable to register user. Please try again later." });
  }
});

module.exports = router;
