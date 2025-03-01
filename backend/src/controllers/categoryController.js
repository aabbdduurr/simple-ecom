const db = require("../db");

exports.getCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  const categoryId = parseInt(req.params.categoryId);
  try {
    const productRes = await db.query(
      "SELECT * FROM products WHERE category_id = $1 ORDER BY id",
      [categoryId]
    );

    // Fetch images for each product
    for (let product of productRes.rows) {
      const imagesRes = await db.query(
        "SELECT image_url FROM product_images WHERE product_id = $1",
        [product.id]
      );
      product.images = imagesRes.rows.map((row) => row.image_url);
    }

    res.json(productRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
