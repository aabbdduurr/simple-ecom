require("dotenv").config();

module.exports = {
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://myuser:mypassword@localhost:5432/ecomm",
  migrationsTable: "pgmigrations",
  dir: "migrations",
  // You can configure additional options if needed
  verbose: true,
};
