const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/ecomm",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
