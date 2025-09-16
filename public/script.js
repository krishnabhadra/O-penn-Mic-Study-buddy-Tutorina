// script.js - Study Buddy core logic

// Grab DOM nodes
const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");

// helper: create and append a message bubble
function appendMessage(text, who = "bot") {
  const el = document.createElement("div");
  el.className = "msg " + (who === "user" ? "user" : "bot");
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// --- DUMMY reply fallback (if backend not available) ---
function botReplyTo(userText) {
  const text = userText.toLowerCase();

  if (text.includes("hi") || text.includes("hello")) {
    return "Hello! I'm your Study Buddy 👩🏻‍🏫 — focus, darling. What topic are we slaying today?";
  }
  if (text.includes("help") || text.includes("how") || text.includes("explain")) {
    return "Sure — give me the topic (e.g., 'Laplace transform', 'osmosis', or 'git push') and I'll break it down step-by-step.";
  }
  if (text.includes("quiz")) {
    return "Quiz mode activated. I'll ask 3 rapid-fire Qs. Ready? (type 'ready')";
  }
  return "Mmm, interesting. I'm your Study Buddy 👩🏻‍🏫 — ask me to 'explain', 'quiz', or say the topic name.";
}

// --- Send message to backend Gemini API ---
async function fetchAIReply(userText) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    return data.reply || "I’m speechless for once, darling 😏";
  } catch (err) {
    console.warn("⚠️ Backend not available, using dummy reply.");
    return botReplyTo(userText); // fallback to local logic
  }
}

// --- handle form submit ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, "user"); // show user message
  input.value = "";

  // show "typing..." placeholder
  const typing = document.createElement("div");
  typing.className = "msg bot";
  typing.textContent = "Study Buddy is thinking... 💭";
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // fetch reply (either Gemini API or dummy fallback)
  const reply = await fetchAIReply(text);

  // remove typing bubble
  typing.remove();

  // append bot reply
  appendMessage(reply, "bot");
});
