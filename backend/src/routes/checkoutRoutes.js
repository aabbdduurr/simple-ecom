const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// POST /api/checkout requires a valid JWT (from OTP verification)
router.post("/", authenticateJWT, checkoutController.processCheckout);

module.exports = router;
