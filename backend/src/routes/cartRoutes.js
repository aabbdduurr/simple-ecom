const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.get("/", authenticateJWT, cartController.getCart); // Pass ?identifier= in query string
router.post("/add", authenticateJWT, cartController.addToCart);
router.post("/clear", authenticateJWT, cartController.clearCart);

module.exports = router;
