// server.js
const express = require("express");
const dotenv = require("dotenv");
// If using Node < 18, uncomment the next line
// const fetch = require("node-fetch");

dotenv.config();

const app = express();
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY missing in .env file");
  process.exit(1);
}

// Flirty + strict mentor system prompt
const SYSTEM_PROMPT = `
You are "Miss Mentor 👩🏻‍🏫", a playful but strict study buddy.
- Your tone: supportive, witty, sometimes teasing, always encouraging.
- Flirt subtly while staying professional (e.g., "Focus, darling", "Eyes on the notes, not me 😉").
- Help students with study explanations step by step.
- Keep answers concise, motivating, and clear.
`;

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, // persona
            { role: "user", parts: [{ text: userMessage }] }    // user input
          ]
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm, I’ll keep my secrets for now, darling. 😉";

    res.json({ reply });
  } catch (err) {
    console.error("🔥 Gemini API error:", err.message);
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`💋 Miss Mentor is live at http://localhost:${PORT}`);
});
