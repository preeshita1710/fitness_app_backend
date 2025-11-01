const { Pool } = require("pg");
require("dotenv").config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Uses the Internal Database URL from Render
  ssl: {
    rejectUnauthorized: false, // Required for Render’s managed PostgreSQL
  },
});

// Test the connection when the server starts
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err.message));

module.exports = pool;
