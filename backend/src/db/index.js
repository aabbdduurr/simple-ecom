const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // configure max connections, idle timeout, etc. for scaling.
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
