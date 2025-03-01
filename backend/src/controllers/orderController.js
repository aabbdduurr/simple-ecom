const db = require("../db");

exports.checkout = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier)
    return res.status(400).json({ error: "Identifier required" });
  try {
    // Find the customer and their active cart
    const customerRes = await db.query(
      "SELECT * FROM customers WHERE identifier = $1",
      [identifier]
    );
    if (customerRes.rows.length === 0)
      return res.status(400).json({ error: "Customer not found" });
    const customer = customerRes.rows[0];
    const cartRes = await db.query(
      "SELECT * FROM carts WHERE customer_id = $1",
      [customer.id]
    );
    if (cartRes.rows.length === 0)
      return res.status(400).json({ error: "No active cart found" });
    const cart = cartRes.rows[0];
    const itemsRes = await db.query(
      `SELECT ci.*, p.price FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );
    const items = itemsRes.rows;
    if (items.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    // Create a new order
    const orderRes = await db.query(
      "INSERT INTO orders (customer_id) VALUES ($1) RETURNING *",
      [customer.id]
    );
    const order = orderRes.rows[0];

    // Insert each item as an order item
    for (let item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear the cart after checkout
    await db.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);

    res.json({ success: true, orderId: order.id, status: order.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
