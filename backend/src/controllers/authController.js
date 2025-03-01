const db = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.sendOtp = async (req, res) => {
  const { phone, email } = req.body;
  const identifier = phone || email;
  if (!identifier) {
    return res.status(400).json({ error: "Phone or email is required" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  try {
    await db.query("DELETE FROM otps WHERE identifier = $1", [identifier]);
    await db.query(
      "INSERT INTO otps (identifier, otp, expires_at) VALUES ($1, $2, $3)",
      [identifier, otp, expiresAt]
    );
    // Mock OTP send (replace with real SMS/Email service)
    console.log(`Mock: Sending OTP ${otp} to ${identifier}`);
    res.json({ success: true, message: "OTP sent (mock)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ error: "Identifier and OTP are required." });
  }
  try {
    const otpRes = await db.query(
      "SELECT * FROM otps WHERE identifier = $1 AND otp = $2",
      [identifier, otp]
    );
    if (otpRes.rows.length === 0)
      return res.status(400).json({ error: "Invalid OTP" });
    const otpEntry = otpRes.rows[0];
    if (new Date() > otpEntry.expires_at)
      return res.status(400).json({ error: "OTP expired" });

    // Generate JWT token for stateless authentication
    const token = jwt.sign({ identifier }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ success: true, message: "OTP verified", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
