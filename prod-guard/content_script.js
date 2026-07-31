// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Testovex — https://testovex.com

// PROD Guard — content script
// Runs on every page. Checks the current URL against user rules.
// If any rule matches, injects a warning banner at the top of the page.

(async function () {
  "use strict";

  // Don't run in extension pages, about:blank, or chrome-internal URLs
  const href = window.location.href || "";
  if (href.startsWith("chrome-extension://") || href.startsWith("chrome://") || href === "about:blank") {
    return;
  }

  // Load rules + settings from storage
  const { rules = [], settings = {} } = await chrome.storage.sync.get(["rules", "settings"]);

  if (settings.enabled === false) return;

  // Check if this URL was dismissed in this session (dismissed URLs stored in session)
  try {
    const dismissedKey = `pg_dismissed_${window.location.host}`;
    const dismissed = sessionStorage.getItem(dismissedKey);
    if (dismissed) return;
  } catch (e) {
    // sessionStorage may not be available on some pages — ignore
  }

  // Evaluate rules
  const matches = rules.filter(rule => {
    if (!rule.enabled) return false;
    return matchesRule(href, rule);
  });

  if (matches.length === 0) return;

  // Determine highest severity
  const severity = matches.some(m => m.severity === "critical") ? "critical" : "warning";
  const matchedLabels = matches.map(m => m.label).slice(0, 3).join(" · ");

  // Inject banner
  injectBanner(severity, matchedLabels);

  // Optional sound alert — delegated to background/offscreen so it plays
  // reliably without hitting the page's autoplay restrictions.
  if (settings.soundAlert && severity === "critical") {
    try {
      chrome.runtime.sendMessage({ action: "playAlert", severity: "critical" });
    } catch (e) {
      playAlertSoundInline();
    }
  }

  // ---------- Helper functions ----------

  function matchesRule(url, rule) {
    if (!rule.pattern) return false;
    if (rule.type === "regex") {
      try {
        const flags = rule.caseSensitive ? "" : "i";
        const re = new RegExp(rule.pattern, flags);
        return re.test(url);
      } catch (e) {
        console.warn("PROD Guard: invalid regex in rule", rule.id, e);
        return false;
      }
    } else {
      const haystack = rule.caseSensitive ? url : url.toLowerCase();
      const needle = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();
      return haystack.includes(needle);
    }
  }

  function injectBanner(severity, ruleLabels) {
    if (document.getElementById("prod-guard-banner")) return;

    const bg = severity === "critical" ? "#DC2626" : "#F59E0B";
    const icon = severity === "critical" ? "⚠️" : "⚡";
    const heading = severity === "critical" ? "PRODUCTION ENVIRONMENT" : "SENSITIVE ENVIRONMENT";

    const banner = document.createElement("div");
    banner.id = "prod-guard-banner";
    banner.className = "prod-guard-banner prod-guard-" + severity;
    banner.style.backgroundColor = bg;

    banner.innerHTML = `
      <div class="prod-guard-inner">
        <span class="prod-guard-icon">${icon}</span>
        <div class="prod-guard-text">
          <div class="prod-guard-heading">${heading}</div>
          <div class="prod-guard-sub">Matched: ${escapeHtml(ruleLabels)}</div>
        </div>
        <div class="prod-guard-actions">
          <button id="prod-guard-dismiss" class="prod-guard-btn">Dismiss for session</button>
          <button id="prod-guard-configure" class="prod-guard-btn prod-guard-btn-secondary">Configure</button>
        </div>
        <div class="prod-guard-footer">
          Built by <a href="https://testovex.com" target="_blank" rel="noopener">Testovex</a>
        </div>
      </div>
    `;

    document.documentElement.style.paddingTop = "60px";
    document.body.insertBefore(banner, document.body.firstChild);

    document.getElementById("prod-guard-dismiss").addEventListener("click", () => {
      try {
        sessionStorage.setItem(`pg_dismissed_${window.location.host}`, String(Date.now()));
      } catch (e) {}
      banner.remove();
      document.documentElement.style.paddingTop = "";
    });

    document.getElementById("prod-guard-configure").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "openOptions" });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function playAlertSoundInline() {
    // Last-resort fallback — Chrome autoplay policy usually blocks this on
    // first navigation; the primary path routes to the offscreen document.
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 1000;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { /* swallow */ }
  }
})();
