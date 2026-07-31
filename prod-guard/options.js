// PROD Guard — options page logic

(async function () {
  "use strict";

  const rulesListEl = document.getElementById("pg-rules-list");
  const addRuleBtn = document.getElementById("pg-add-rule");
  const enabledEl = document.getElementById("pg-enabled");
  const soundEl = document.getElementById("pg-sound");
  const welcomeEl = document.getElementById("pg-welcome");
  const testUrlInput = document.getElementById("pg-test-url");
  const testBtn = document.getElementById("pg-test-btn");
  const testResultEl = document.getElementById("pg-test-result");
  const ruleTemplate = document.getElementById("pg-rule-template");

  // Show welcome on first-install visit
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("welcome") === "true") {
    welcomeEl.style.display = "block";
  }

  // Inject version from manifest so footer never drifts from actual release
  const versionEl = document.getElementById("pg-version");
  if (versionEl) {
    versionEl.textContent = chrome.runtime.getManifest().version;
  }

  // Load state
  let { rules = [], settings = {} } = await chrome.storage.sync.get(["rules", "settings"]);

  // Initial render
  enabledEl.checked = settings.enabled !== false;
  soundEl.checked = settings.soundAlert === true;
  renderRules();

  // ---------- Settings save handlers ----------

  enabledEl.addEventListener("change", async () => {
    settings.enabled = enabledEl.checked;
    await chrome.storage.sync.set({ settings });
  });

  soundEl.addEventListener("change", async () => {
    settings.soundAlert = soundEl.checked;
    await chrome.storage.sync.set({ settings });
  });

  // Test sound — sends a playAlert message just like a real match would
  const testSoundBtn = document.getElementById("pg-test-sound");
  const testSoundStatus = document.getElementById("pg-test-sound-status");
  if (testSoundBtn) {
    testSoundBtn.addEventListener("click", async () => {
      testSoundStatus.textContent = "playing…";
      testSoundStatus.style.color = "#2C5E8E";
      try {
        await chrome.runtime.sendMessage({ action: "playAlert", severity: "critical" });
        setTimeout(() => {
          testSoundStatus.textContent = "✓ played — if you didn't hear it, check system volume";
          testSoundStatus.style.color = "#10B981";
        }, 500);
      } catch (e) {
        testSoundStatus.textContent = "✗ failed: " + (e && e.message ? e.message : "unknown");
        testSoundStatus.style.color = "#DC2626";
      }
      setTimeout(() => { testSoundStatus.textContent = ""; }, 5000);
    });
  }

  // ---------- Add rule ----------

  addRuleBtn.addEventListener("click", async () => {
    const newRule = {
      id: "user-" + Date.now(),
      label: "New rule",
      pattern: "",
      type: "substring",
      caseSensitive: false,
      enabled: true,
      severity: "critical"
    };
    rules.push(newRule);
    await saveRules();
    renderRules();
    // Focus the label of the new rule for immediate editing
    const lastRule = rulesListEl.lastElementChild;
    if (lastRule) {
      lastRule.querySelector(".pg-rule-label").focus();
    }
  });

  // ---------- Test URL ----------

  testBtn.addEventListener("click", () => runUrlTest());
  testUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runUrlTest();
  });

  function runUrlTest() {
    const url = testUrlInput.value.trim();
    if (!url) {
      testResultEl.textContent = "Enter a URL to test";
      testResultEl.className = "pg-test-result";
      return;
    }
    const matches = rules.filter(r => r.enabled && matchesRule(url, r));
    if (matches.length === 0) {
      testResultEl.textContent = "✓ No rule matches. Safe URL.";
      testResultEl.className = "pg-test-result pg-match-none";
    } else {
      const critical = matches.some(m => m.severity === "critical");
      const severity = critical ? "critical" : "warning";
      const icon = critical ? "⚠" : "⚡";
      const heading = critical ? "PROD Guard would trigger CRITICAL warning" : "PROD Guard would trigger WARNING";
      testResultEl.innerHTML =
        icon + " " + heading + "\n\nMatched rules:\n  · " +
        matches.map(m => escapeHtml(m.label)).join("\n  · ");
      testResultEl.style.whiteSpace = "pre-line";
      testResultEl.className = "pg-test-result pg-match-" + severity;
    }
  }

  // ---------- Rule rendering ----------

  function renderRules() {
    rulesListEl.innerHTML = "";
    if (rules.length === 0) {
      rulesListEl.innerHTML =
        '<div style="text-align:center; padding: 32px; color: #6B7280;">' +
        'No rules yet. Click "+ Add rule" to create your first one.</div>';
      return;
    }
    rules.forEach((rule, index) => {
      const node = ruleTemplate.content.cloneNode(true);
      const ruleEl = node.querySelector(".pg-rule");
      ruleEl.dataset.ruleId = rule.id;

      const labelInput = node.querySelector(".pg-rule-label");
      const patternInput = node.querySelector(".pg-rule-pattern");
      const typeSelect = node.querySelector(".pg-rule-type");
      const severitySelect = node.querySelector(".pg-rule-severity");
      const enabledCheckbox = node.querySelector(".pg-rule-enabled");
      const caseCheckbox = node.querySelector(".pg-rule-case");
      const deleteBtn = node.querySelector(".pg-rule-delete");

      labelInput.value = rule.label;
      patternInput.value = rule.pattern;
      typeSelect.value = rule.type;
      severitySelect.value = rule.severity || "critical";
      enabledCheckbox.checked = rule.enabled;
      caseCheckbox.checked = rule.caseSensitive;

      // Change handlers
      labelInput.addEventListener("input", async () => {
        rules[index].label = labelInput.value;
        await saveRules();
      });
      patternInput.addEventListener("input", async () => {
        rules[index].pattern = patternInput.value;
        await saveRules();
      });
      typeSelect.addEventListener("change", async () => {
        rules[index].type = typeSelect.value;
        await saveRules();
      });
      severitySelect.addEventListener("change", async () => {
        rules[index].severity = severitySelect.value;
        await saveRules();
      });
      enabledCheckbox.addEventListener("change", async () => {
        rules[index].enabled = enabledCheckbox.checked;
        await saveRules();
      });
      caseCheckbox.addEventListener("change", async () => {
        rules[index].caseSensitive = caseCheckbox.checked;
        await saveRules();
      });
      deleteBtn.addEventListener("click", async () => {
        if (confirm(`Delete rule "${rule.label}"?`)) {
          rules.splice(index, 1);
          await saveRules();
          renderRules();
        }
      });

      rulesListEl.appendChild(node);
    });
  }

  async function saveRules() {
    await chrome.storage.sync.set({ rules });
  }

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

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
