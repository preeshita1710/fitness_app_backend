import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import OpenAI from "openai";

dotenv.config();
const { Pool } = pkg;

// --- Express setup ---
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ local + Render
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// --- PostgreSQL connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true, // ✅ Required for Render PostgreSQL
    rejectUnauthorized: false,
  },
});

// --- Test DB connection on startup ---
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database successfully!"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// --- Initialize OpenAI client ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Root Route ---
app.get("/", (req, res) => {
  res.json({ message: "🏋️‍♀️ Fitness App Backend is running!" });
});

// --- Test DB Endpoint ---
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "✅ Connected to PostgreSQL successfully!",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("❌ Database test error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// --- Users API ---
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Users API error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// --- Workouts API ---
app.get("/api/workouts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM workouts");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Workouts API error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// --- Consultations API ---
app.get("/api/consultations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM consultations");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Consultations API error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// --- Payments API ---
app.get("/api/payments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Payments API error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// --- 🧠 AI Ingredient Analyzer API ---
app.post("/api/analyze-ingredients", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.trim().length === 0) {
      return res.status(400).json({ error: "Ingredients text is required" });
    }

    const prompt = `
You are a nutritionist AI. Analyze the following ingredients:
"${ingredients}"

Provide:
1. A simple summary of what this product is likely to be.
2. Potential dietary restrictions (vegan, lactose intolerant, gluten-free, nut allergies, etc.).
3. Healthiness rating from 1–10.
4. Suggested portion size and usage tips.

Return the answer in a friendly, readable format.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;
    res.json({ analysis });
  } catch (err) {
    console.error("❌ Error in AI analysis:", err.message);
    res.status(500).json({ error: "Failed to analyze ingredients" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected at:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Database test on startup failed:", err.message);
  }
});
8