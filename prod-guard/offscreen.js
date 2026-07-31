// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Testovex — https://testovex.com

// PROD Guard — offscreen audio player
// Runs inside a hidden extension document so Web Audio can play
// without a page user-gesture. Reachable only via chrome.runtime messages
// with { target: "offscreen" }.

"use strict";

let audioCtx = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== "offscreen") return;
  if (msg.action === "playAlert") {
    playAlert(msg.severity || "critical");
    sendResponse({ ok: true });
  }
  return true;
});

function ensureContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playAlert(severity) {
  try {
    const ctx = ensureContext();

    // Critical: two beeps at 1000 Hz (attention-grabbing)
    // Warning:  one beep at 700 Hz  (milder)
    const isCritical = severity === "critical";
    const beeps = isCritical ? 2 : 1;
    const freq = isCritical ? 1000 : 700;
    const gap = 0.18;      // seconds between beeps
    const dur = 0.14;      // beep length
    const attack = 0.008;  // envelope attack (avoids clicks)
    const release = 0.03;
    const peakGain = 0.25;

    for (let i = 0; i < beeps; i++) {
      const start = ctx.currentTime + i * (dur + gap - 0.05);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peakGain, start + attack);
      gain.gain.setValueAtTime(peakGain, start + dur - release);
      gain.gain.linearRampToValueAtTime(0, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    }
  } catch (e) {
    console.error("PROD Guard offscreen — audio failed:", e);
  }
}
