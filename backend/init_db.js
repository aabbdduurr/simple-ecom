async function insertTestData() {
  // Remove existing data
  await db.query("DELETE FROM order_items");
  await db.query("DELETE FROM orders");
  await db.query("DELETE FROM cart_items");
  await db.query("DELETE FROM carts");
  await db.query("DELETE FROM customers");
  await db.query("DELETE FROM product_images");
  await db.query("DELETE FROM products");
  await db.query("DELETE FROM categories");

  // Reset ID sequences
  await db.query("ALTER SEQUENCE customers_id_seq RESTART WITH 1");
  await db.query("ALTER SEQUENCE orders_id_seq RESTART WITH 1");
  await db.query("ALTER SEQUENCE categories_id_seq RESTART WITH 1");
  await db.query("ALTER SEQUENCE products_id_seq RESTART WITH 1");
  await db.query("ALTER SEQUENCE order_items_id_seq RESTART WITH 1");

  // Insert sample categories
  const categories = ["Electronics", "Books", "Clothing", "Home", "Toys"];
  for (const cat of categories) {
    await db.query(
      "INSERT INTO categories (name, status) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
      [cat, "active"]
    );
  }

  // Retrieve inserted categories with their IDs
  const { rows: categoryRows } = await db.query("SELECT * FROM categories");

  // Create 100 products
  for (let i = 1; i <= 100; i++) {
    const catIndex = i % categoryRows.length;
    const category = categoryRows[catIndex];
    await db.query(
      "INSERT INTO products (name, description, price, category_id, stock_qty, status) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        `Product ${i}`,
        `Description for product ${i}`,
        (Math.random() * 100).toFixed(2),
        category.id,
        Math.floor(Math.random() * 100),
        "active",
      ]
    );
  }

  // Insert sample customers and retrieve their assigned IDs
  const customerEmails = [
    "customer1@example.com",
    "customer2@example.com",
    "customer3@example.com",
  ];

  let customerIds = [];
  for (const email of customerEmails) {
    const res = await db.query(
      "INSERT INTO customers (identifier) VALUES ($1) RETURNING id",
      [email]
    );
    customerIds.push(res.rows[0].id);
  }

  // Create orders for each customer
  for (const customerId of customerIds) {
    await db.query("INSERT INTO orders (customer_id, status) VALUES ($1, $2)", [
      customerId,
      "completed",
    ]);

    // Retrieve the latest order ID
    const { rows: orderRows } = await db.query(
      "SELECT id FROM orders WHERE customer_id = $1 ORDER BY id DESC LIMIT 1",
      [customerId]
    );
    const orderId = orderRows[0].id;

    // Select 10 random products for the order
    const { rows: products } = await db.query(
      "SELECT id, price FROM products ORDER BY random() LIMIT 10"
    );
    for (const product of products) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, product.id, 1, product.price]
      );
    }
  }
}
