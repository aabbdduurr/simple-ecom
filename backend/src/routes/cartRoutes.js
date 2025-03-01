const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.get("/", cartController.getCart); // Pass ?identifier= in query string
router.post("/add", cartController.addToCart);
router.post("/clear", cartController.clearCart);

module.exports = router;
