const db = require("../models/db");

exports.createOrder = (req, res) => {
  const { customerIdentifier, cart } = req.body;

  if (
    !customerIdentifier ||
    !cart ||
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return res.status(400).json({ error: "Invalid order data." });
  }

  // Find or create customer (using phone or email as identifier)
  let customer = db.customers.find((c) => c.identifier === customerIdentifier);
  if (!customer) {
    customer = {
      id: db.customers.length + 1,
      identifier: customerIdentifier,
      createdAt: new Date(),
    };
    db.customers.push(customer);
  }

  const order = {
    id: db.orders.length + 1,
    customerId: customer.id,
    cart,
    status: "pending",
    createdAt: new Date(),
  };
  db.orders.push(order);

  res.json({ success: true, orderId: order.id, status: order.status });
};

exports.getOrder = (req, res) => {
  const { customerIdentifier, orderId } = req.query;
  const order = db.orders.find((o) => o.id === parseInt(orderId));

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  // Verify that the customer requesting the order owns it
  const customer = db.customers.find((c) => c.id === order.customerId);
  if (customer.identifier !== customerIdentifier) {
    return res.status(403).json({ error: "Unauthorized access." });
  }

  res.json(order);
};
