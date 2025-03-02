const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateJWT } = require("../middleware/authMiddleware");

router.get("/", cartController.getCart); // Pass ?identifier= in query string
router.post("/add", cartController.addToCart);
router.post("/clear", cartController.clearCart);

module.exports = router;
