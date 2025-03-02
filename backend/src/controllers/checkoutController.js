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
  const {
    paymentMethod,
    paymentDetails,
    billingInfo,
    shippingInfo,
    orderItems,
  } = req.body;
  if (!paymentMethod) {
    return res.status(400).json({ error: "Payment method is required" });
  }

  // Get customer identifier from JWT (set by authenticateJWT)
  const { identifier } = req.user;
  try {
    // Ensure customer exists
    const customerRes = await db.query(
      "SELECT * FROM customers WHERE identifier = $1",
      [identifier]
    );
    if (customerRes.rows.length === 0) {
      // create a new customer if not found
      const newCustomerRes = await db.query(
        "INSERT INTO customers (identifier) VALUES ($1) RETURNING *",
        [identifier]
      );
      if (newCustomerRes.rows.length === 0) {
        return res.status(500).json({ error: "Failed to create customer" });
      }
      // Use the newly created customer
      customerRes.rows.push(newCustomerRes.rows[0]);
    }
    const customer = customerRes.rows[0];

    // Try to get a persisted cart from the database.
    const cartRes = await db.query(
      "SELECT * FROM carts WHERE customer_id = $1",
      [customer.id]
    );
    let items = [];
    if (cartRes.rows.length > 0) {
      // If the cart exists, grab the items
      const cart = cartRes.rows[0];
      const itemsRes = await db.query(
        `SELECT ci.*, p.price FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cart.id]
      );
      items = itemsRes.rows;
    }
    // If no cart items exist on server, use orderItems provided from the client.
    if (items.length === 0 && orderItems && orderItems.length > 0) {
      // For each order item, verify the current price from the database.
      for (const item of orderItems) {
        const productRes = await db.query(
          "SELECT price FROM products WHERE id = $1",
          [item.product_id]
        );
        if (productRes.rows.length === 0) {
          return res
            .status(400)
            .json({ error: `Product ${item.id} not found` });
        }
        // Use the latest price from the product table.
        items.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: productRes.rows[0].price,
        });
      }
    }

    // Fail if no items available to order.
    if (items.length === 0) {
      return res.status(400).json({ error: "No items to checkout" });
    }

    // Process payment based on paymentMethod
    let paymentResult = { success: false };
    if (paymentMethod === "cod") {
      paymentResult = { success: true, message: "Cash on Delivery selected" };
    } else if (paymentMethod === "credit") {
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

    // Create a new order including billing and shipping info
    const orderRes = await db.query(
      `INSERT INTO orders 
       (customer_id, payment_method, status, billing_info, shipping_info) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        customer.id,
        paymentMethod,
        paymentMethod === "cod" ? "pending" : "paid",
        JSON.stringify(billingInfo),
        JSON.stringify(shippingInfo),
      ]
    );
    const order = orderRes.rows[0];

    // Insert each order item
    for (let item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    // If a persisted cart exists, clear it after checkout
    if (cartRes.rows.length > 0) {
      const cart = cartRes.rows[0];
      await db.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
    }

    res.json({
      success: true,
      orderId: order.id,
      paymentResult,
      status: order.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
