// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3000;

// Parse JSON request bodies (for later)
app.use(express.json());

// --- Supabase setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Home check
app.get("/", (req, res) => {
  res.send("TradesAI + Supabase server is running ✅");
});

// --- Get recent messages ---
app.get("/messages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Supabase select error:", error);
      return res.status(500).json({ ok: false, error: "Failed to fetch messages" });
    }

    res.json({ ok: true, messages: data });
  } catch (e) {
    console.error("Unexpected error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Add test message ---
app.get("/add-test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ from: "Andy", text: "Test message from /add-test" }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ ok: false, error: "Failed to save message" });
    }

    console.log("✅ Saved test message:", data);
    res.json({ ok: true, saved: data });
  } catch (e) {
    console.error("Unexpected error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
