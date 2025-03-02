const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateJWT } = require("../middleware/authMiddleware");

router.post("/checkout", orderController.checkout);

module.exports = router;
