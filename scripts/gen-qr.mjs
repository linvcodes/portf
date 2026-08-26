/* Regenerates the business-card QR.

   Run: node scripts/gen-qr.mjs

   Two settings here exist for print, not for screen:

   - margin: 4. The QR spec requires a "quiet zone" of 4 clear modules on every
     side. Scanners use it to find the code's edges; without it a printed code
     sitting against artwork fails to acquire far more often than it should.
     The library defaults to 4 but is commonly called with margin:1, which is
     what produced the previous asset.

   - errorCorrectionLevel: "Q" (25% recoverable). Print is a lossy channel —
     ink spread, trim drift, a fold or a thumbprint all eat modules. Q is the
     usual recommendation for anything physical; M is a screen default.

   Q pushes this URL to a 33x33 grid (v4). Combined with the quiet zone the
   drawn image is 41x41 modules, which is why card.css sizes the QR at 0.8in:
   0.8 / 41 = 0.0195in per module, comfortably over the 0.0157in (0.4mm)
   minimum module size that print shops quote for reliable scanning. */

import { writeFileSync } from "node:fs";
import QRCode from "qrcode";

const URL = "https://linvcodes.github.io/portf/";
const OUT = "public/assets/qr-site.svg";

const svg = await QRCode.toString(URL, {
  type: "svg",
  errorCorrectionLevel: "Q",
  margin: 4,
  color: { dark: "#0a1729", light: "#ffffff" },
});

writeFileSync(OUT, svg);
console.log(`${OUT} <- ${URL}`);
