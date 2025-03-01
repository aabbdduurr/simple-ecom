const db = require("../db");

// Helper: get or create customer by identifier (phone/email)
async function getOrCreateCustomer(identifier) {
  let customerRes = await db.query(
    "SELECT * FROM customers WHERE identifier = $1",
    [identifier]
  );
  if (customerRes.rows.length === 0) {
    const insertRes = await db.query(
      "INSERT INTO customers (identifier) VALUES ($1) RETURNING *",
      [identifier]
    );
    return insertRes.rows[0];
  }
  return customerRes.rows[0];
}

// Helper: get or create active cart for a customer
async function getOrCreateCart(customerId) {
  let cartRes = await db.query("SELECT * FROM carts WHERE customer_id = $1", [
    customerId,
  ]);
  if (cartRes.rows.length === 0) {
    const insertRes = await db.query(
      "INSERT INTO carts (customer_id) VALUES ($1) RETURNING *",
      [customerId]
    );
    return insertRes.rows[0];
  }
  return cartRes.rows[0];
}

exports.getCart = async (req, res) => {
  const { identifier } = req.query;
  if (!identifier)
    return res.status(400).json({ error: "Identifier required" });

  try {
    const customer = await getOrCreateCustomer(identifier);
    const cart = await getOrCreateCart(customer.id);
    const itemsRes = await db.query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.description, p.price
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.cart_id = $1`,
      [cart.id]
    );
    res.json({ cartId: cart.id, items: itemsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addToCart = async (req, res) => {
  const { identifier, productId, quantity } = req.body;
  if (!identifier || !productId) {
    return res
      .status(400)
      .json({ error: "Identifier and productId are required" });
  }
  const qty = quantity ? parseInt(quantity) : 1;
  try {
    const customer = await getOrCreateCustomer(identifier);
    const cart = await getOrCreateCart(customer.id);
    // If the product is already in the cart, update its quantity
    let itemRes = await db.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cart.id, productId]
    );
    if (itemRes.rows.length > 0) {
      const newQty = itemRes.rows[0].quantity + qty;
      await db.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
        newQty,
        itemRes.rows[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
        [cart.id, productId, qty]
      );
    }
    res.json({ success: true, message: "Product added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier)
    return res.status(400).json({ error: "Identifier required" });
  try {
    const customer = await getOrCreateCustomer(identifier);
    const cart = await getOrCreateCart(customer.id);
    await db.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
