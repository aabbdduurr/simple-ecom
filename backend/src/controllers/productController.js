const db = require("../db");

exports.getAllProducts = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY id");
    const products = result.rows;
    // For each product, retrieve images
    for (let product of products) {
      const imagesRes = await db.query(
        "SELECT image_url FROM product_images WHERE product_id = $1",
        [product.id]
      );
      product.images = imagesRes.rows.map((row) => row.image_url);
    }
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const productRes = await db.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (productRes.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const product = productRes.rows[0];
    const imagesRes = await db.query(
      "SELECT image_url FROM product_images WHERE product_id = $1",
      [id]
    );
    product.images = imagesRes.rows.map((row) => row.image_url);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
