# PROD Guard

**Never break production again.**

A Chrome extension that shows a big red warning banner when you visit production URLs — so you don't accidentally delete real customer data, run destructive scripts, or send test emails from a prod inbox.

Free forever. Built by [Testovex](https://testovex.com).

---

## Why PROD Guard?

Every engineer has done it at least once:
- Ran `DELETE FROM users` on the wrong tab.
- Sent a "hey testing" email to 40,000 real customers.
- Deployed staging config to prod.
- Truncated a table thinking it was the local DB.

PROD Guard is a lightweight visual seatbelt. It watches every tab you open. If the URL matches one of your rules (default: `prod`, `production`, `/admin`, `live.`), it pins a bright red banner to the top of the page. You can't miss it.

---

## Features

- **Zero-config out of the box** — 3 default rules cover the most common cases.
- **Fully customizable rules** — substring or regex, case-sensitive or not, critical (red) or warning (orange).
- **Live URL tester** — paste any URL to see which rules match, before you commit.
- **Session-scoped dismiss** — click "Dismiss" and the banner hides until you reload or open a new tab. Won't survive a fresh visit.
- **Optional sound alert** — subtle beep on critical matches.
- **Syncs across your Chrome instances** via `chrome.storage.sync` — set up once, protected everywhere you sign in.
- **No tracking, no analytics, no external network calls.** Everything runs locally.

---

## Installation (Developer Mode)

Until it's live on the Chrome Web Store, install it manually:

1. Download or clone this folder to your computer.
2. Open Chrome → `chrome://extensions/`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked**.
5. Select this `prod-guard/` folder.
6. Done. The 🛡️ icon appears in your toolbar. The options page opens automatically on first install with 3 pre-seeded rules.

---

## Default Rules

| # | Label | Type | Pattern | Severity |
|---|-------|------|---------|----------|
| 1 | Prod / Production keywords | regex | `\b(prod\|production)\b` | Critical |
| 2 | Admin panels | substring | `/admin` | Warning |
| 3 | Live subdomains | regex | `//live[.\-]` | Warning |

Edit, delete, disable, or add your own from the options page.

---

## Adding Custom Rules

Common examples:

| What to protect | Type | Pattern |
|---|---|---|
| Real AWS Console | substring | `console.aws.amazon.com` |
| Company production app | substring | `app.acme.com` |
| Any `.com` domain (broad) | regex | `\.com($\|/)` |
| Stripe live mode | substring | `dashboard.stripe.com` |
| Airflow prod DAGs | substring | `airflow.prod` |
| Datadog prod org | substring | `app.datadoghq.com/dashboard/prod` |

Tip: For team-shared rules, take a screenshot of your options page and share with new hires as a starting config.

---

## Architecture (for the curious)

- **Manifest V3.** Service worker + content script + popup + options.
- **content_script.js** runs on every page (`<all_urls>`), matches the URL against your rules, and injects a fixed-position banner with `z-index: 2147483647` so it always sits on top.
- **CSS is namespaced** with `prod-guard-` prefix and uses `!important` to survive host-page styles.
- **No external assets** — the banner draws itself, the alert sound is Web Audio API, icons are embedded. Nothing is fetched over the network at runtime.
- **Storage** uses `chrome.storage.sync` (~100 KB budget, plenty for hundreds of rules).

Files:

```
prod-guard/
├── manifest.json          Extension manifest (v3)
├── background.js          Service worker: defaults + install hook
├── content_script.js      URL matcher + banner injector
├── banner.css             Injected banner styles (namespaced, !important)
├── popup.html/css/js      Toolbar popup: current tab status + toggles
├── options.html/css/js    Settings page: rules CRUD + URL tester
├── icons/                 16/48/128 PNG icons
├── build-icons.py         Regenerate icons if you want to tweak the design
└── README.md              This file
```

---

## Chrome Web Store Submission

When you're ready to publish:

1. **Zip the folder** (excluding `build-icons.py` and `README.md` if you want):
   ```bash
   cd prod-guard
   zip -r ../prod-guard.zip . -x "build-icons.py" "README.md"
   ```
2. Sign in at https://chrome.google.com/webstore/devconsole (one-time $5 developer fee; if you already paid it for another extension like Testovex, you don't pay again).
3. **New item** → upload the zip.
4. Fill in the store listing:
   - **Short description (132 chars max):** *"Big red banner on production URLs. Never accidentally delete prod data or send test emails to real users again."*
   - **Detailed description:** paste the "Why" + "Features" sections from this README.
   - **Screenshots (1280×800 or 640×400, at least 1):** capture the banner on a fake prod page + the options page + the popup.
   - **Category:** Developer Tools
   - **Privacy policy URL:** create one on testovex.com (`/privacy-prodguard`) — required because of `<all_urls>` host permission. Template: "PROD Guard does not collect, transmit, or store any personal data. All rules and settings are stored locally in your browser via `chrome.storage.sync`. We make zero external network requests."
5. **Justify permissions** in the review notes:
   - `storage` — persist user rules across sessions
   - `activeTab` — read current tab URL for popup status
   - `<all_urls>` — must match rules against any URL the user visits

Review typically takes 1–3 business days.

---

## Marketing / Growth

Since this is free forever, the win is the top-of-funnel to Testovex:

- **Extension footer** links to https://testovex.com on the banner, popup, and options page.
- **Blog post** on testovex.com: *"I built PROD Guard after deleting a prod table. Here's the story."* Link the extension.
- **LinkedIn post** (Puneet's account): screenshot of the red banner + a war story. Devs love this — it's a shame post they can nod along to.
- **Hacker News Show HN** when it's live on the store.
- **Reddit** r/programming, r/webdev, r/devops — post the war story, not the product.
- **Product Hunt** launch on a Tuesday morning PT.

---

## Roadmap (post-v1.0)

- **Team rules** — sync rules via a shared JSON URL or Testovex account.
- **Auto-import from environment variables** — read `NODE_ENV=production` cues from meta tags.
- **Slack/Teams webhook** on critical matches (opt-in).
- **Read-only mode** — inject CSS that greys out `<button>` elements matching a pattern (e.g., all buttons containing "Delete").
- **Right-click context menu** to add current URL as a rule in one click.

---

## License

MIT. Do what you want with it. If you fork it, please leave the Testovex footer in place.

---

## About Testovex

PROD Guard is a free companion to [Testovex](https://testovex.com) — the enterprise no-code test automation platform for QA teams that ship faster without hiring 40 automation engineers.

If you like the "guardrails for engineers" philosophy behind PROD Guard, you'll love what we do for regression testing at scale.

— Puneet Kamboj, Founder
