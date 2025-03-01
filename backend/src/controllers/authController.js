const db = require("../models/db");

exports.sendOtp = (req, res) => {
  const { phone, email } = req.body;
  const identifier = phone || email;

  if (!identifier) {
    return res.status(400).json({ error: "Phone or email is required." });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  // Remove any existing OTPs for this identifier and save the new one
  db.otps = db.otps.filter((entry) => entry.identifier !== identifier);
  db.otps.push({ identifier, otp, expiresAt });

  // Mock third-party OTP send (replace with real SMS/Email service)
  console.log(`Mock: Sending OTP ${otp} to ${identifier}`);

  res.json({ success: true, message: "OTP sent (mock)." });
};

exports.verifyOtp = (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ error: "Identifier and OTP are required." });
  }

  const entry = db.otps.find(
    (e) => e.identifier === identifier && e.otp === otp
  );
  if (!entry) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: "OTP expired." });
  }

  // In a full system, create a session or JWT token here.
  res.json({ success: true, message: "OTP verified." });
};
