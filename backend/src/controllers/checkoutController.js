const db = require("../db");

// Simulated external vendor process function
async function processThirdPartyPayment(paymentDetails) {
  // Simulate an external call delay and response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, confirmationCode: "VENDOR12345" });
    }, 1000);
  });
}

exports.processCheckout = async (req, res) => {
  // The paymentMethod should be one of: "cod", "credit", "third_party"
  const { paymentMethod, paymentDetails } = req.body;
  if (!paymentMethod) {
    return res.status(400).json({ error: "Payment method is required" });
  }

  // Get customer identifier from JWT token (set by authenticateJWT)
  const { identifier } = req.user;
  try {
    // Ensure customer exists and has an active cart
    const customerRes = await db.query(
      "SELECT * FROM customers WHERE identifier = $1",
      [identifier]
    );
    if (customerRes.rows.length === 0) {
      return res.status(400).json({ error: "Customer not found" });
    }
    const customer = customerRes.rows[0];

    const cartRes = await db.query(
      "SELECT * FROM carts WHERE customer_id = $1",
      [customer.id]
    );
    if (cartRes.rows.length === 0) {
      return res.status(400).json({ error: "No active cart found" });
    }
    const cart = cartRes.rows[0];

    const itemsRes = await db.query(
      `SELECT ci.*, p.price FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );
    const items = itemsRes.rows;
    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Create a new order registering the selected payment method with a "pending" status
    const orderRes = await db.query(
      "INSERT INTO orders (customer_id, payment_method, status) VALUES ($1, $2, $3) RETURNING *",
      [customer.id, paymentMethod, "pending"]
    );
    const order = orderRes.rows[0];

    // Insert each item as an order item
    for (let item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    // Process the payment based on the method selected
    let paymentResult = { success: false };
    if (paymentMethod === "cod") {
      paymentResult = { success: true, message: "Cash on Delivery selected" };
      // COD: payment to be collected on delivery
    } else if (paymentMethod === "credit") {
      // Simulate on-site credit card processing
      if (!paymentDetails || !paymentDetails.cardNumber) {
        return res
          .status(400)
          .json({ error: "Credit card details are required" });
      }
      paymentResult = {
        success: true,
        message: "Credit card payment processed",
      };
    } else if (paymentMethod === "third_party") {
      // Process payment via a third party vendor
      if (!paymentDetails || !paymentDetails.signedInfo) {
        return res
          .status(400)
          .json({ error: "Third party payment details are required" });
      }
      paymentResult = await processThirdPartyPayment(paymentDetails);
      if (!paymentResult.success) {
        return res.status(400).json({ error: "Third party payment failed" });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    // Update order status based on the payment outcome:
    const finalStatus = paymentMethod === "cod" ? "pending" : "paid";
    await db.query("UPDATE orders SET status = $1 WHERE id = $2", [
      finalStatus,
      order.id,
    ]);

    // Clear the cart once checkout is complete
    await db.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);

    res.json({
      success: true,
      orderId: order.id,
      paymentResult,
      status: finalStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
