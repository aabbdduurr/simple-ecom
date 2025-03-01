const db = require("../models/db");

exports.getAllProducts = (req, res) => {
  res.json(db.products);
};

exports.getProductById = (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(product);
};
