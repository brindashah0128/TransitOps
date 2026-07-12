/**
 * TransitOps AI - Co-Pilot Chat Assistant controller
 */

let conversationHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-input-form");
  const inputEl = document.getElementById("chat-user-message");

  if (form && inputEl) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = inputEl.value.trim();
      if (!message) return;

      inputEl.value = "";
      await sendChatMessage(message);
    });
  }

  // Bind shortcut suggestions buttons
  const shortcutButtons = document.querySelectorAll(".shortcut-prompt-btn");
  shortcutButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const promptText = btn.getAttribute("data-prompt");
      if (promptText) {
        sendChatMessage(promptText);
      }
    });
  });
});

async function sendChatMessage(promptText) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  // Append user bubble
  appendChatBubble("user", promptText);

  // Append thinking typing indicator
  const typingId = appendThinkingIndicator();

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;

  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: promptText,
        history: conversationHistory
      })
    });

    const data = await response.json();

    // Remove thinking indicator
    const indicatorEl = document.getElementById(typingId);
    if (indicatorEl) indicatorEl.remove();

    if (response.ok && data.text) {
      appendChatBubble("model", data.text);
      
      // Update local history
      conversationHistory.push({ role: "user", text: promptText });
      conversationHistory.push({ role: "model", text: data.text });
    } else {
      appendChatBubble("model", "Co-Pilot could not process telemetry stream. Check API credentials.");
    }
  } catch (err) {
    const indicatorEl = document.getElementById(typingId);
    if (indicatorEl) indicatorEl.remove();
    appendChatBubble("model", "Network failure. Co-Pilot currently offline.");
  }

  container.scrollTop = container.scrollHeight;
}

function appendChatBubble(role, rawText) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;

  const bubbleWrapper = document.createElement("div");
  
  if (role === "user") {
    bubbleWrapper.className = "flex justify-end gap-3 max-w-2xl ml-auto";
    bubbleWrapper.innerHTML = `
      <div class="p-3 rounded-2xl bg-blue-600 text-xs text-white shadow-md leading-relaxed font-medium">
        ${escapeHtml(rawText)}
      </div>
      <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-300">
        ME
      </div>
    `;
  } else {
    bubbleWrapper.className = "flex gap-3 max-w-2xl";
    bubbleWrapper.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
        <i data-lucide="sparkles" class="w-4 h-4"></i>
      </div>
      <div class="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed markdown-bubble">
        ${parseSimpleMarkdown(rawText)}
      </div>
    `;
  }

  container.appendChild(bubbleWrapper);
  lucide.createIcons();
}

function appendThinkingIndicator() {
  const container = document.getElementById("chat-messages-container");
  const id = `typing-${Date.now()}`;
  
  const div = document.createElement("div");
  div.id = id;
  div.className = "flex gap-3 max-w-2xl animate-pulse";
  div.innerHTML = `
    <div class="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
      <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>
    </div>
    <div class="p-3 rounded-2xl bg-[#1E293B]/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-1">
      <span class="font-semibold text-[10px] uppercase font-mono">Co-Pilot analyzing fleet telemetry</span>
      <span class="flex gap-0.5 ml-1">
        <span class="w-1 h-1 rounded-full bg-slate-500 animate-bounce"></span>
        <span class="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
      </span>
    </div>
  `;
  container.appendChild(div);
  lucide.createIcons();
  return id;
}

// Escapes raw input to prevent injection
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Simple client-side Markdown parser for beautiful chat layout
function parseSimpleMarkdown(markdown) {
  let html = escapeHtml(markdown);

  // Bold headings
  html = html.replace(/### (.*?)\n/g, '<h3 class="text-xs font-bold text-white border-b border-slate-800 pb-1.5 mb-2 mt-3">$1</h3>');
  html = html.replace(/## (.*?)\n/g, '<h2 class="text-sm font-bold text-white border-b border-slate-800 pb-1.5 mb-2 mt-4">$1</h2>');

  // Bold highlights
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Bullet items
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 mt-1">$1</li>');
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 mt-1">$1</li>');
  html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal text-slate-300 mt-1">$1</li>');

  // Code snippets
  html = html.replace(/`(.*?)`/g, '<code class="font-mono bg-slate-900 text-cyan-400 px-1 py-0.5 rounded border border-slate-800">$1</code>');

  return html;
}
