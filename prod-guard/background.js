// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Testovex — https://testovex.com

// PROD Guard — service worker
// - First-install setup + default rules
// - Message router (openOptions, playAlert)
// - Manages the offscreen document that owns audio playback (MV3-safe)

"use strict";

const OFFSCREEN_URL = "offscreen.html";

const DEFAULT_RULES = [
  {
    id: "default-prod",
    label: "URL contains 'prod' or 'production'",
    pattern: "(prod|production)",
    type: "regex",
    caseSensitive: false,
    enabled: true,
    severity: "critical"
  },
  {
    id: "default-admin",
    label: "URL contains '/admin'",
    pattern: "/admin",
    type: "substring",
    caseSensitive: false,
    enabled: true,
    severity: "warning"
  },
  {
    id: "default-live",
    label: "URL contains 'live.' subdomain",
    pattern: "live\\.",
    type: "regex",
    caseSensitive: false,
    enabled: false,
    severity: "warning"
  }
];

const DEFAULT_SETTINGS = {
  enabled: true,
  soundAlert: false,
  bannerHeight: "60px",
  requireDoubleConfirm: false,
  dismissedPerSession: {}
};

// ---------- Offscreen document lifecycle ----------

async function hasOffscreen() {
  // hasDocument() lives on chrome.offscreen in Chrome 116+.
  if (chrome.offscreen && chrome.offscreen.hasDocument) {
    try { return await chrome.offscreen.hasDocument(); } catch (e) {}
  }
  // Fallback: enumerate contexts (Chrome 116+)
  try {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"]
    });
    return contexts.length > 0;
  } catch (e) {
    return false;
  }
}

async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play an alert sound when a production URL is detected."
    });
  } catch (e) {
    // Race: another handler already created it — safe to ignore
    if (!String(e && e.message).includes("Only a single offscreen")) {
      console.error("PROD Guard — failed to create offscreen doc:", e);
    }
  }
}

async function playAlert(severity) {
  await ensureOffscreen();
  try {
    await chrome.runtime.sendMessage({
      target: "offscreen",
      action: "playAlert",
      severity: severity || "critical"
    });
  } catch (e) {
    console.error("PROD Guard — sendMessage to offscreen failed:", e);
  }
}

// ---------- Message router ----------

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;

  if (msg.action === "openOptions") {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === "playAlert") {
    // Fire-and-forget: don't block sender
    playAlert(msg.severity).then(() => sendResponse({ ok: true }));
    return true; // keep channel open for async sendResponse
  }
});

// ---------- Install / update hooks ----------

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === "install") {
    await chrome.storage.sync.set({
      rules: DEFAULT_RULES,
      settings: DEFAULT_SETTINGS
    });
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html?welcome=true") });
  } else if (reason === "update") {
    const { settings = {} } = await chrome.storage.sync.get("settings");
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    await chrome.storage.sync.set({ settings: merged });
  }
});
