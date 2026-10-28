
const palettes = [
  ["#eef2ff", "#6366f1"],
  ["#fdf2f8", "#db2777"],
  ["#fff7ed", "#ea580c"],
  ["#ecfdf5", "#059669"],
  ["#f5f3ff", "#8b5cf6"],
  ["#ecfeff", "#0891b2"],
  ["#fefce8", "#ca8a04"],
  ["#f8fafc", "#475569"],
];

function hashText(text) {
  let hash = 0;
  for (const char of String(text || "")) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function getIllustration(name) {
  const n = name.toLowerCase();

  if (/earbud|headphone|headset/.test(n)) {
    return `
      <ellipse cx="250" cy="365" rx="105" ry="18" fill="#64748b" opacity=".13"/>
      <path d="M160 245 V205 C160 105 340 105 340 205 V245"
        fill="none" stroke="#334155" stroke-width="25" stroke-linecap="round"/>
      <path d="M160 225 V245 M340 225 V245" stroke="#64748b" stroke-width="9"/>
      <rect x="133" y="220" width="55" height="112" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="5"/>
      <rect x="312" y="220" width="55" height="112" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="5"/>
      <rect x="146" y="237" width="29" height="72" rx="14" fill="#c7d2fe"/>
      <rect x="325" y="237" width="29" height="72" rx="14" fill="#c7d2fe"/>
      <circle cx="160" cy="273" r="7" fill="#6366f1"/>
      <circle cx="340" cy="273" r="7" fill="#6366f1"/>`;
  }

  if (/speaker/.test(n)) {
    return `
      <ellipse cx="250" cy="380" rx="100" ry="18" fill="#64748b" opacity=".15"/>
      <rect x="157" y="145" width="186" height="225" rx="32" fill="#334155"/>
      <rect x="169" y="157" width="162" height="201" rx="25" fill="#475569"/>
      <circle cx="250" cy="225" r="49" fill="#cbd5e1"/>
      <circle cx="250" cy="225" r="37" fill="#94a3b8"/>
      <circle cx="250" cy="225" r="19" fill="#e2e8f0"/>
      <circle cx="250" cy="310" r="31" fill="#cbd5e1"/>
      <circle cx="250" cy="310" r="20" fill="#94a3b8"/>
      <circle cx="250" cy="310" r="9" fill="#e2e8f0"/>
      <circle cx="190" cy="176" r="4" fill="#a5b4fc"/>`;
  }

  if (/mouse/.test(n)) {
    return `
      <ellipse cx="250" cy="370" rx="85" ry="17" fill="#64748b" opacity=".15"/>
      <path d="M250 135 C190 135 160 180 160 252 V285 C160 340 200 365 250 365
        C300 365 340 340 340 285 V252 C340 180 310 135 250 135Z"
        fill="#e2e8f0" stroke="#94a3b8" stroke-width="5"/>
      <path d="M250 140 V220" stroke="#94a3b8" stroke-width="4"/>
      <rect x="238" y="168" width="24" height="39" rx="11" fill="#6366f1"/>
      <path d="M180 245 Q250 260 320 245" fill="none" stroke="#cbd5e1" stroke-width="3"/>`;
  }

  if (/keyboard/.test(n)) {
    let keys = "";
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        keys += `<rect x="${135 + c * 24}" y="${190 + r * 30}" width="19" height="22" rx="4" fill="${(r + c) % 4 === 0 ? "#a5b4fc" : "#f8fafc"}"/>`;
      }
    }
    return `
      <ellipse cx="250" cy="340" rx="140" ry="17" fill="#64748b" opacity=".13"/>
      <rect x="112" y="160" width="276" height="148" rx="16" fill="#334155"/>
      ${keys}
      <rect x="199" y="315" width="102" height="13" rx="6" fill="#94a3b8"/>`;
  }

  if (/watch/.test(n)) {
    return `
      <ellipse cx="250" cy="360" rx="78" ry="15" fill="#64748b" opacity=".14"/>
      <path d="M215 90 Q250 75 285 90 L300 175 H200Z" fill="#64748b"/>
      <path d="M200 325 H300 L285 410 Q250 425 215 410Z" fill="#64748b"/>
      <rect x="155" y="145" width="190" height="190" rx="48" fill="#334155"/>
      <rect x="169" y="159" width="162" height="162" rx="38" fill="#0f172a"/>
      <rect x="180" y="170" width="140" height="140" rx="30" fill="#c7d2fe"/>
      <circle cx="250" cy="240" r="47" fill="#6366f1"/>
      <path d="M250 205 V241 L278 258" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>`;
  }

  if (/phone|mobile|smartphone/.test(n)) {
    return `
      <ellipse cx="250" cy="385" rx="76" ry="16" fill="#64748b" opacity=".15"/>
      <rect x="170" y="95" width="160" height="290" rx="28" fill="#334155"/>
      <rect x="179" y="105" width="142" height="270" rx="21" fill="#c7d2fe"/>
      <path d="M180 280 L240 205 L280 248 L321 170 V354 H180Z" fill="#818cf8"/>
      <path d="M180 310 L240 255 L280 285 L321 235 V354 H180Z" fill="#4f46e5"/>
      <rect x="220" y="113" width="60" height="8" rx="4" fill="#334155"/>
      <circle cx="250" cy="361" r="5" fill="#ffffff"/>`;
  }

  if (/bottle|water bottle|sports bottle/.test(n)) {
    return `
      <ellipse cx="250" cy="380" rx="63" ry="16" fill="#64748b" opacity=".13"/>
      <rect x="220" y="95" width="60" height="35" rx="8" fill="#334155"/>
      <rect x="210" y="122" width="80" height="34" rx="12" fill="#94a3b8"/>
      <path d="M205 150 Q180 165 180 200 V325 Q180 365 220 365 H280 Q320 365 320 325 V200 Q320 165 295 150Z"
        fill="#67e8f9" stroke="#0891b2" stroke-width="5"/>
      <path d="M198 220 Q250 240 302 220 V320 Q302 345 278 345 H222 Q198 345 198 320Z" fill="#cffafe"/>
      <path d="M206 195 H294" stroke="#ffffff" stroke-width="6" opacity=".8"/>`;
  }

  if (/mug|coffee cup/.test(n)) {
    return `
      <ellipse cx="240" cy="355" rx="100" ry="17" fill="#64748b" opacity=".13"/>
      <path d="M285 175 H320 Q365 175 365 225 Q365 275 320 275 H285"
        fill="none" stroke="#b45309" stroke-width="18"/>
      <rect x="150" y="150" width="155" height="190" rx="20" fill="#f8fafc" stroke="#cbd5e1" stroke-width="5"/>
      <rect x="165" y="170" width="125" height="150" rx="12" fill="#fed7aa"/>
      <path d="M185 215 Q227 190 270 215" fill="none" stroke="#ea580c" stroke-width="7" stroke-linecap="round"/>
      <path d="M192 245 Q227 225 262 245" fill="none" stroke="#ea580c" stroke-width="7" stroke-linecap="round"/>`;
  }

  if (/lamp|light/.test(n)) {
    return `
      <ellipse cx="250" cy="370" rx="105" ry="16" fill="#64748b" opacity=".13"/>
      <path d="M170 170 L250 105 L330 170 L310 235 H190Z" fill="#fde68a" stroke="#d97706" stroke-width="5" stroke-linejoin="round"/>
      <path d="M245 235 L245 325" stroke="#64748b" stroke-width="16" stroke-linecap="round"/>
      <path d="M255 235 L255 325" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
      <path d="M195 340 Q250 320 305 340 L325 360 H175Z" fill="#334155"/>
      <path d="M194 175 L306 175" stroke="#ffffff" stroke-width="6" opacity=".65"/>`;
  }

  if (/shirt|t-shirt|tshirt|cotton t-shirt/.test(n)) {
    return `
      <ellipse cx="250" cy="375" rx="100" ry="16" fill="#64748b" opacity=".12"/>
      <path d="M205 125 L170 145 L125 205 L165 238 L195 207 L195 350
        Q250 370 305 350 L305 207 L335 238 L375 205 L330 145 L295 125
        Q250 165 205 125Z"
        fill="#818cf8" stroke="#4f46e5" stroke-width="5" stroke-linejoin="round"/>
      <path d="M205 127 Q250 185 295 127" fill="none" stroke="#c7d2fe" stroke-width="8"/>
      <path d="M218 210 H282" stroke="#c7d2fe" stroke-width="5" stroke-linecap="round"/>`;
  }

  if (/shoe|sneaker|footwear/.test(n)) {
    return `
      <ellipse cx="250" cy="365" rx="130" ry="17" fill="#64748b" opacity=".14"/>
      <path d="M130 270 Q175 260 205 205 L260 225 Q278 270 320 290
        L355 300 Q375 310 370 340 Q365 355 340 355 H145 Q115 350 120 320Z"
        fill="#e2e8f0" stroke="#64748b" stroke-width="5" stroke-linejoin="round"/>
      <path d="M205 205 L245 260 L315 295 L350 305" fill="none" stroke="#818cf8" stroke-width="20" stroke-linecap="round"/>
      <path d="M145 320 H350" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
      <path d="M215 252 L250 265 M205 270 L240 283 M198 288 L230 301"
        stroke="#475569" stroke-width="5" stroke-linecap="round"/>`;
  }

  if (/bag|backpack|duffel|wallet/.test(n)) {
    return `
      <ellipse cx="250" cy="375" rx="100" ry="16" fill="#64748b" opacity=".14"/>
      <path d="M205 170 Q205 115 250 115 Q295 115 295 170" fill="none" stroke="#92400e" stroke-width="15" stroke-linecap="round"/>
      <rect x="155" y="160" width="190" height="205" rx="28" fill="#b45309"/>
      <rect x="170" y="180" width="160" height="170" rx="20" fill="#d97706"/>
      <rect x="185" y="255" width="130" height="75" rx="12" fill="#92400e"/>
      <path d="M200 278 H300" stroke="#fef3c7" stroke-width="5" stroke-linecap="round"/>
      <circle cx="250" cy="220" r="10" fill="#fef3c7"/>`;
  }

  if (/lamp|light/.test(n)) {
    return `<circle cx="250" cy="250" r="100" fill="#fde68a"/>`;
  }

  if (/cream|beauty|skin|makeup|hair|perfume|cosmetic|brush/.test(n)) {
    return `
      <ellipse cx="250" cy="370" rx="82" ry="16" fill="#64748b" opacity=".13"/>
      <rect x="195" y="175" width="110" height="185" rx="20" fill="#fbcfe8" stroke="#db2777" stroke-width="5"/>
      <rect x="210" y="140" width="80" height="42" rx="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
      <rect x="207" y="220" width="86" height="78" rx="10" fill="#ffffff" opacity=".85"/>
      <path d="M225 245 H275 M225 260 H265 M235 275 H255" stroke="#db2777" stroke-width="5" stroke-linecap="round"/>
      <path d="M225 195 Q250 205 275 195" fill="none" stroke="#ffffff" stroke-width="5"/>`;
  }

  if (/yoga|fitness|resistance|gym|jump rope|foam roller/.test(n)) {
    return `
      <ellipse cx="250" cy="365" rx="115" ry="17" fill="#64748b" opacity=".13"/>
      <rect x="145" y="150" width="210" height="190" rx="20" fill="#c4b5fd" stroke="#7c3aed" stroke-width="5"/>
      <path d="M170 165 V325 M190 165 V325 M210 165 V325 M230 165 V325 M250 165 V325 M270 165 V325 M290 165 V325 M310 165 V325 M330 165 V325"
        stroke="#ffffff" stroke-width="4" opacity=".8"/>
      <rect x="160" y="300" width="180" height="22" rx="10" fill="#7c3aed" opacity=".7"/>`;
  }

  if (/frying pan|cookware|kitchen|chopper/.test(n)) {
    return `
      <ellipse cx="240" cy="350" rx="105" ry="16" fill="#64748b" opacity=".13"/>
      <circle cx="220" cy="245" r="95" fill="#334155"/>
      <circle cx="220" cy="245" r="78" fill="#64748b"/>
      <circle cx="220" cy="245" r="64" fill="#94a3b8"/>
      <path d="M290 215 L365 155 Q380 150 385 165 L315 235Z" fill="#334155"/>
      <path d="M310 215 L365 165" stroke="#94a3b8" stroke-width="5"/>`;
  }

  // Elegant universal product pedestal for other catalog items.
  return `
    <ellipse cx="250" cy="370" rx="100" ry="18" fill="#64748b" opacity=".12"/>
    <path d="M155 330 L180 285 H320 L345 330Z" fill="#e2e8f0"/>
    <rect x="170" y="325" width="160" height="25" rx="8" fill="#cbd5e1"/>
    <rect x="205" y="170" width="90" height="145" rx="22" fill="${palettes[hashText(n) % palettes.length][1]}" opacity=".88"/>
    <rect x="218" y="185" width="64" height="115" rx="16" fill="#ffffff" opacity=".3"/>
    <path d="M225 220 H275 M225 238 H265" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <circle cx="250" cy="202" r="7" fill="#ffffff" opacity=".9"/>`;
}

export async function getProductImage(productName) {
  const name = String(productName || "Product");
  const [background, accent] = palettes[
    hashText(name) % palettes.length
  ];

  const illustration = getIllustration(name);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="12"
            flood-color="#334155" flood-opacity=".12"/>
        </filter>
      </defs>

      <rect width="500" height="500" rx="38" fill="url(#bg)"/>
      <circle cx="395" cy="100" r="75" fill="${accent}" opacity=".08"/>
      <circle cx="90" cy="370" r="60" fill="${accent}" opacity=".06"/>
      <g filter="url(#shadow)">
        ${illustration}
      </g>
      <rect x="35" y="35" width="78" height="8" rx="4"
        fill="${accent}" opacity=".75"/>
      <circle cx="445" cy="55" r="5" fill="${accent}" opacity=".7"/>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
