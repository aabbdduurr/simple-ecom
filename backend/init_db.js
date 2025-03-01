const fs = require("fs");
const path = require("path");
const db = require("./src/db/index");
require("dotenv").config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function initDB(retries = 0) {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await db.query(schema);
    console.log("Database initialized successfully.");

    // Insert test data
    await insertTestData();

    console.log("Test data inserted successfully.");
    process.exit(0);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.error(
        `Error initializing database. Retrying in ${
          RETRY_DELAY / 1000
        } seconds...`,
        error
      );
      setTimeout(() => initDB(retries + 1), RETRY_DELAY);
    } else {
      console.error("Error initializing database:", error);
      process.exit(1);
    }
  }
}

async function insertTestData() {
  const categories = ["Electronics", "Books", "Clothing", "Home", "Toys"];
  const customers = [
    { identifier: "customer1@example.com" },
    { identifier: "customer2@example.com" },
    { identifier: "customer3@example.com" },
  ];
  const products = [];

  // Generate 100 products
  for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    products.push({
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: (Math.random() * 100).toFixed(2),
      category,
    });
  }

  // Insert products
  for (const product of products) {
    await db.query(
      "INSERT INTO products (name, description, price, category) VALUES ($1, $2, $3, $4)",
      [product.name, product.description, product.price, product.category]
    );
  }

  // Insert customers
  for (const customer of customers) {
    await db.query("INSERT INTO customers (identifier) VALUES ($1)", [
      customer.identifier,
    ]);
  }

  // Insert orders for customers
  for (let i = 0; i < customers.length; i++) {
    const customerId = i + 1; // Assuming the customer IDs are sequential starting from 1
    await db.query("INSERT INTO orders (customer_id, status) VALUES ($1, $2)", [
      customerId,
      "completed",
    ]);

    // Insert order items
    const orderId = i + 1; // Assuming the order IDs are sequential starting from 1
    const orderItems = products.slice(i * 10, (i + 1) * 10); // 10 products per order
    for (const item of orderItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.id, 1, item.price]
      );
    }
  }
}

initDB();
