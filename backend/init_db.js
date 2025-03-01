const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const db = require("./src/db/index");
require("dotenv").config();

/**
 * Runs the database migrations by invoking the "migrate:up" script.
 */
function runMigrations() {
  return new Promise((resolve, reject) => {
    exec("npm run migrate:up", (error, stdout, stderr) => {
      if (error) {
        console.error("Migration error:", error);
        console.error(stderr);
        return reject(error);
      }
      console.log("Migrations output:", stdout);
      resolve();
    });
  });
}

async function initDB() {
  try {
    // Run migrations as part of the init DB flow
    await runMigrations();
    console.log("Migrations ran successfully.");

    // Insert test data after migrations have applied
    await insertTestData();

    console.log("Test data inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

async function insertTestData() {
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

  // Create 100 products with random stock and status, referencing categories via category_id
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

  // Insert sample customers
  const customers = [
    { identifier: "customer1@example.com" },
    { identifier: "customer2@example.com" },
    { identifier: "customer3@example.com" },
  ];
  for (const customer of customers) {
    await db.query(
      "INSERT INTO customers (identifier) VALUES ($1) ON CONFLICT (identifier) DO NOTHING",
      [customer.identifier]
    );
  }

  // Create orders for each customer (each order includes 10 random products)
  for (let i = 0; i < customers.length; i++) {
    const customerId = i + 1; // Assuming sequential customer IDs
    await db.query("INSERT INTO orders (customer_id, status) VALUES ($1, $2)", [
      customerId,
      "completed",
    ]);
    // Retrieve the latest order ID
    const { rows: orderRows } = await db.query(
      "SELECT id FROM orders ORDER BY id DESC LIMIT 1"
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

initDB();
