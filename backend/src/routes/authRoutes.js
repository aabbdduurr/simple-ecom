const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/otp", authController.sendOtp);
router.post("/verify", authController.verifyOtp);

module.exports = router;
