import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

const PORT = process.env.PORT || 5000;

// --- PostgreSQL connection ---
console.log("🧩 DATABASE_URL:", process.env.DATABASE_URL ? "Loaded ✅" : "Missing ❌");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true, // ✅ Required for Render PostgreSQL
    rejectUnauthorized: false,
  },
});

// --- Test DB connection ---
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL successfully!"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// --- Example route ---
app.get("/", (req, res) => {
  res.send("🏋️‍♀️ Fitness App Backend is running!");
});

// --- Sample route to test DB query ---
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (error) {
    console.error("DB Test Error:", error.message);
    res.status(500).json({ success: false, message: "Database test failed" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
