const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.getCategories);
router.get("/:categoryId/products", categoryController.getProductsByCategory);

module.exports = router;
