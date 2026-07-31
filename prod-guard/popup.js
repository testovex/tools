// PROD Guard — popup logic

(async function () {
  "use strict";

  const enabledEl = document.getElementById("pg-enabled");
  const soundEl = document.getElementById("pg-sound");
  const statusEl = document.getElementById("pg-status");
  const statusDetailEl = document.getElementById("pg-status-detail");
  const configureBtn = document.getElementById("pg-configure");

  // Load current settings + rules
  const { rules = [], settings = {} } = await chrome.storage.sync.get(["rules", "settings"]);

  enabledEl.checked = settings.enabled !== false;
  soundEl.checked = settings.soundAlert === true;

  // Check current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    const url = tab.url;
    const matches = rules.filter(r => r.enabled && matchesRule(url, r));

    if (matches.length > 0) {
      const severity = matches.some(m => m.severity === "critical") ? "danger" : "warning";
      statusEl.classList.add("pg-" + severity);
      const heading = severity === "danger" ? "⚠ Production detected" : "⚡ Sensitive URL detected";
      statusDetailEl.innerHTML =
        "<strong>" + heading + "</strong><br>" +
        "Matched: " + escapeHtml(matches.map(m => m.label).join(" · "));
    } else {
      statusEl.classList.add("pg-safe");
      statusDetailEl.innerHTML =
        "<strong>✓ Safe — no rule matched</strong><br>" +
        "<span style='opacity: 0.7; font-weight: normal;'>" + escapeHtml(shortenUrl(url)) + "</span>";
    }
  } else {
    statusDetailEl.textContent = "No active tab";
  }

  // Save settings on change
  enabledEl.addEventListener("change", async () => {
    const { settings = {} } = await chrome.storage.sync.get("settings");
    settings.enabled = enabledEl.checked;
    await chrome.storage.sync.set({ settings });
  });

  soundEl.addEventListener("change", async () => {
    const { settings = {} } = await chrome.storage.sync.get("settings");
    settings.soundAlert = soundEl.checked;
    await chrome.storage.sync.set({ settings });
  });

  configureBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // ---------- Helpers ----------

  function matchesRule(url, rule) {
    if (!rule.pattern) return false;
    if (rule.type === "regex") {
      try {
        const flags = rule.caseSensitive ? "" : "i";
        return new RegExp(rule.pattern, flags).test(url);
      } catch (e) { return false; }
    }
    const h = rule.caseSensitive ? url : url.toLowerCase();
    const n = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();
    return h.includes(n);
  }

  function shortenUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname.slice(0, 30);
    } catch (e) {
      return url.slice(0, 50);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
