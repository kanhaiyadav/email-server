require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sendContactEmail } = require("./mailer");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Rate limiter: max 5 requests per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many messages sent. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, email, message) are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Message must be at least 10 characters.",
    });
  }

  try {
    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent! Kanhaiya will get back to you soon.",
    });
  } catch (error) {
    console.error("Email send error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Email server running on http://localhost:${PORT}`);
  console.log(`   Sending emails to: ${process.env.EMAIL_TO}`);
  console.log(`   Allowed origin:    ${process.env.ALLOWED_ORIGIN || "*"}`);
});
