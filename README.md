# Testovex Tools

Free developer utilities built by [Testovex](https://testovex.com) — the enterprise no-code test automation platform.

Every tool in this repository is free forever. If you find them useful and your team needs test automation at scale, come see us at [testovex.com](https://testovex.com).

---

## Available tools

<table>
  <tr>
    <td width="140" valign="top" align="center">
      <img src="./prod-guard/icons/icon128.png" width="96" alt="PROD Guard">
    </td>
    <td valign="top">
      <h3><a href="./prod-guard/">PROD Guard</a></h3>
      <p>A Chrome extension that shows a big red banner when you visit production URLs. Prevents accidentally deleting prod data, sending test emails to real users, or clicking the wrong button on a live admin panel.</p>
      <ul>
        <li><strong>Type:</strong> Chrome Extension (Manifest V3)</li>
        <li><strong>Platform:</strong> Chrome, Edge, Brave (any Chromium browser)</li>
        <li><strong>Status:</strong> ✅ Live on Chrome Web Store</li>
        <li><strong>Install:</strong> <a href="https://chrome.google.com/webstore/detail/bfpiapnhpeglfkpebbhoplimjojjblci">Chrome Web Store →</a></li>
        <li><a href="./prod-guard/README.md">Read more →</a></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="140" valign="top" align="center">
      <img src="./testdata-genie-india/icons/icon128.png" width="96" alt="TestData Genie for India">
    </td>
    <td valign="top">
      <h3><a href="./testdata-genie-india/">TestData Genie — India</a></h3>
      <p>Chrome extension that generates realistic Indian PII test data — PAN, GST, Aadhaar, IFSC, and mobile numbers. Format-valid so your regex/UI validators accept them, checksum-invalid so they fail real KYC. One click to copy, right-click any form field to fill it directly, batch export to CSV/JSON for load testing.</p>
      <ul>
        <li><strong>Type:</strong> Chrome Extension (Manifest V3)</li>
        <li><strong>Platform:</strong> Chrome, Edge, Brave (any Chromium browser)</li>
        <li><strong>Status:</strong> v1.0.0 — ready for Chrome Web Store submission</li>
        <li><strong>Install:</strong> Load unpacked via <code>chrome://extensions/</code></li>
        <li><a href="./testdata-genie-india/README.md">Read more →</a></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="140" valign="top" align="center">
      <img src="./entra-password-warner/icons/icon128.png" width="96" alt="Entra Password Warner">
    </td>
    <td valign="top">
      <h3><a href="./entra-password-warner/">Entra Password Warner</a></h3>
      <p>Windows utility that warns you before your Microsoft Entra ID (Azure AD) password expires. Runs silently via Task Scheduler, shows a native Windows toast with a one-click "Change password now" button. IT-admin friendly — deploy fleet-wide via Intune or GPO with a preset config.</p>
      <ul>
        <li><strong>Type:</strong> Windows Utility (PowerShell)</li>
        <li><strong>Platform:</strong> Windows 10/11 joined to Entra ID</li>
        <li><strong>Status:</strong> v1.0.0 — ready for Windows testing</li>
        <li><strong>Install:</strong> Right-click <code>Install.ps1</code> → Run with PowerShell</li>
        <li><a href="./entra-password-warner/README.md">Read more →</a></li>
      </ul>
    </td>
  </tr>
</table>

---

## Coming soon

- More tools in the pipeline. Watch this repo or [follow Testovex on LinkedIn](https://linkedin.com/company/testovex) for launch notifications.

---

## Contributing

These tools are maintained by the Testovex team. If you spot a bug or have a feature request, please open an issue. Pull requests are welcome for bug fixes.

## License

MIT — see [LICENSE](./LICENSE). Do what you want with the code. If you fork, please leave the Testovex attribution in place.

## About Testovex

Testovex is a no-code, Playwright-backed enterprise test automation platform built for ACOE (Automation Center of Excellence) teams. Record tests in your browser, run at scale, get video + traces on every failure. [Learn more →](https://testovex.com)

---

Made with care by [Puneet Kamboj](https://linkedin.com/in/puneetkamboj) · Founder, Testovex
