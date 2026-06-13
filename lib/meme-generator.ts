export type MemeGeneration = {
  name: string;
  ticker: string;
  imageUrl: string;
  description: string;
  prompt: string;
  palette: string[];
  style: string;
};

type Scene = {
  adjective: string;
  noun: string;
  motif: "moon" | "wave" | "laser" | "rocket" | "crown" | "egg" | "dojo";
  accessory: "visor" | "crown" | "helmet" | "shades" | "bandana" | "none";
  expression: "alpha" | "happy" | "mad" | "sleepy" | "laser";
  palette: string[];
  words: string[];
};

type RenderMode = "sticker" | "trading card" | "glitch poster" | "comic cover" | "vaporwave";

const SCENES: Scene[] = [
  {
    words: ["moon", "lunar", "space", "galaxy", "cosmic", "star"],
    adjective: "Moon",
    noun: "Beak",
    motif: "moon",
    accessory: "helmet",
    expression: "sleepy",
    palette: ["#7dd3fc", "#fef3c7", "#c084fc", "#020617"],
  },
  {
    words: ["sui", "water", "wave", "ocean", "surf", "surfer"],
    adjective: "Sui",
    noun: "Surfer",
    motif: "wave",
    accessory: "shades",
    expression: "happy",
    palette: ["#4da3ff", "#67e8f9", "#facc15", "#0f172a"],
  },
  {
    words: ["laser", "neon", "cyber", "robot", "ai", "grok", "matrix"],
    adjective: "Neon",
    noun: "Rooster",
    motif: "laser",
    accessory: "visor",
    expression: "laser",
    palette: ["#22d3ee", "#f0abfc", "#fb7185", "#111827"],
  },
  {
    words: ["rocket", "launch", "mars", "pump", "blast"],
    adjective: "Rocket",
    noun: "Comb",
    motif: "rocket",
    accessory: "helmet",
    expression: "alpha",
    palette: ["#60a5fa", "#f97316", "#fde68a", "#111827"],
  },
  {
    words: ["gold", "golden", "king", "queen", "royal", "crown"],
    adjective: "Golden",
    noun: "Yolk",
    motif: "crown",
    accessory: "crown",
    expression: "alpha",
    palette: ["#38bdf8", "#facc15", "#f97316", "#171717"],
  },
  {
    words: ["egg", "yolk", "baby", "hatch"],
    adjective: "Mega",
    noun: "Egg",
    motif: "egg",
    accessory: "none",
    expression: "happy",
    palette: ["#93c5fd", "#fde047", "#fb923c", "#1f2937"],
  },
  {
    words: ["ninja", "samurai", "dojo", "stealth"],
    adjective: "Ninja",
    noun: "Cluck",
    motif: "dojo",
    accessory: "bandana",
    expression: "mad",
    palette: ["#38bdf8", "#f43f5e", "#fde047", "#111827"],
  },
];

const ADJECTIVES = ["Turbo", "Spicy", "Quantum", "Mega", "Diamond", "Lucky", "Viral", "Based"];
const NOUNS = ["Rooster", "Hen", "Cluck", "Chick", "Beak", "Wing", "Feather", "Nest"];
const FALLBACK_PALETTES = [
  ["#4da3ff", "#ffb020", "#ff5a36", "#101828"],
  ["#6ee7f9", "#facc15", "#fb7185", "#111827"],
  ["#38bdf8", "#fb923c", "#a3e635", "#0f172a"],
  ["#60a5fa", "#f97316", "#fef08a", "#18181b"],
];

function hashPrompt(prompt: string) {
  let hash = 2166136261;
  for (const char of prompt) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: T[], seed: number, offset: number) {
  return items[(seed + offset) % items.length];
}

function tickerFrom(name: string, seed: number) {
  const letters = name.replace(/[^a-z]/gi, "").toUpperCase();
  return `${letters.slice(0, 4)}${String(seed % 99).padStart(2, "0")}`.slice(0, 8);
}

function escapeXml(value: string) {
  return value.replace(/[<>&"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" }[char] ?? char));
}

function resolveScene(prompt: string, seed: number): Scene {
  const lower = prompt.toLowerCase();
  const ranked = SCENES.map((scene) => {
    const hits = scene.words
      .map((word) => lower.indexOf(word))
      .filter((index) => index >= 0);
    return { scene, hits, firstHit: hits.length ? Math.min(...hits) : Number.MAX_SAFE_INTEGER };
  })
    .filter((item) => item.hits.length > 0)
    .sort((a, b) => a.firstHit - b.firstHit || b.hits.length - a.hits.length);

  if (ranked[0]) return ranked[0].scene;

  return {
    words: [],
    adjective: pick(ADJECTIVES, seed, 3),
    noun: pick(NOUNS, seed, 7),
    motif: pick(["moon", "wave", "laser", "rocket", "crown", "egg", "dojo"] as const, seed, 11),
    accessory: pick(["visor", "crown", "helmet", "shades", "bandana", "none"] as const, seed, 17),
    expression: pick(["alpha", "happy", "mad", "sleepy", "laser"] as const, seed, 23),
    palette: pick(FALLBACK_PALETTES, seed, 5),
  };
}

function backgroundMotif(scene: Scene, yolk: string, flame: string, sui: string) {
  if (scene.motif === "moon") {
    return `<circle cx="930" cy="135" r="92" fill="${yolk}" opacity=".95"/><circle cx="970" cy="105" r="78" fill="#020617" opacity=".58"/><g fill="#fff" opacity=".65"><circle cx="820" cy="84" r="5"/><circle cx="1090" cy="215" r="4"/><circle cx="1010" cy="60" r="3"/></g>`;
  }
  if (scene.motif === "wave") {
    return `<path d="M675 510 C760 410 880 430 950 505 S1080 585 1170 475" fill="none" stroke="${sui}" stroke-width="36" stroke-linecap="round" opacity=".82"/><path d="M730 535 C805 475 885 500 940 540" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".75"/>`;
  }
  if (scene.motif === "laser") {
    return `<path d="M456 318 L1140 110" stroke="${flame}" stroke-width="14" stroke-linecap="round" opacity=".95"/><path d="M532 304 L1140 210" stroke="${sui}" stroke-width="9" stroke-linecap="round" opacity=".82"/><g opacity=".25" stroke="${sui}" stroke-width="2">${Array.from({ length: 11 }, (_, i) => `<path d="M${720 + i * 42} 70 v500"/>`).join("")}</g>`;
  }
  if (scene.motif === "rocket") {
    return `<path d="M930 410 l96 -142 l50 160 z" fill="${yolk}" opacity=".95"/><circle cx="1015" cy="345" r="18" fill="${sui}"/><path d="M956 430 c-36 22-50 60-66 108 50-14 84-30 108-68z" fill="${flame}" opacity=".95"/>`;
  }
  if (scene.motif === "crown") {
    return `<path d="M840 210 l58 -90 62 78 82 -92 48 112 z" fill="${yolk}" stroke="#fff7d6" stroke-width="8" opacity=".95"/><circle cx="898" cy="120" r="12" fill="${flame}"/><circle cx="960" cy="96" r="12" fill="${sui}"/><circle cx="1042" cy="106" r="12" fill="${flame}"/>`;
  }
  if (scene.motif === "egg") {
    return `<ellipse cx="940" cy="410" rx="100" ry="134" fill="${yolk}" opacity=".95"/><path d="M860 410 c48 38 102 -38 160 0" fill="none" stroke="#fff" stroke-width="11" opacity=".82"/>`;
  }
  return `<rect x="795" y="105" width="300" height="260" rx="22" fill="${flame}" opacity=".28"/><path d="M830 342 h240 M850 118 v210 M930 118 v210 M1010 118 v210" stroke="${yolk}" stroke-width="10" opacity=".65"/>`;
}

function eyes(expression: Scene["expression"], leftX: number) {
  if (expression === "happy") {
    return `<path d="M${leftX - 22} 248 q22 -24 44 0" fill="none" stroke="#101828" stroke-width="13" stroke-linecap="round"/><path d="M480 240 q22 -24 44 0" fill="none" stroke="#101828" stroke-width="13" stroke-linecap="round"/>`;
  }
  if (expression === "mad") {
    return `<path d="M${leftX - 24} 228 l54 24" stroke="#101828" stroke-width="12" stroke-linecap="round"/><path d="M480 252 l54 -24" stroke="#101828" stroke-width="12" stroke-linecap="round"/><circle cx="${leftX}" cy="252" r="18" fill="#101828"/><circle cx="505" cy="252" r="18" fill="#101828"/>`;
  }
  if (expression === "sleepy") {
    return `<path d="M${leftX - 24} 246 h48" stroke="#101828" stroke-width="12" stroke-linecap="round"/><path d="M480 246 h48" stroke="#101828" stroke-width="12" stroke-linecap="round"/><text x="545" y="206" fill="#fff" font-size="32" font-weight="900">Z</text>`;
  }
  if (expression === "laser") {
    return `<rect x="${leftX - 34}" y="224" width="230" height="42" rx="18" fill="#101828"/><circle cx="${leftX}" cy="245" r="13" fill="#22d3ee"/><circle cx="505" cy="245" r="13" fill="#fb7185"/>`;
  }
  return `<circle cx="${leftX}" cy="246" r="23" fill="#101828"/><circle cx="${leftX + 8}" cy="238" r="7" fill="#fff"/><circle cx="502" cy="238" r="23" fill="#101828"/><circle cx="511" cy="230" r="7" fill="#fff"/>`;
}

function accessory(scene: Scene, flame: string, yolk: string, sui: string) {
  if (scene.accessory === "visor") return `<rect x="352" y="218" width="205" height="58" rx="24" fill="#101828"/><rect x="372" y="234" width="165" height="18" rx="9" fill="${sui}" opacity=".92"/>`;
  if (scene.accessory === "crown") return `<path d="M370 128 l42 -70 48 58 62 -76 44 88 z" fill="${yolk}" stroke="#fff7d6" stroke-width="7"/>`;
  if (scene.accessory === "helmet") return `<path d="M310 202 C342 110 522 84 612 190 C535 160 402 160 310 202Z" fill="${sui}" opacity=".75"/><path d="M342 162 C420 128 520 136 592 190" fill="none" stroke="#fff" stroke-width="8" opacity=".5"/>`;
  if (scene.accessory === "shades") return `<path d="M330 228 h90 l-18 52 h-70z M470 228 h90 l-18 52 h-70z" fill="#101828"/><path d="M420 238 h50" stroke="#101828" stroke-width="10"/>`;
  if (scene.accessory === "bandana") return `<path d="M332 190 C420 156 520 166 602 202 L596 228 C500 198 416 196 326 224Z" fill="${flame}"/><path d="M590 204 l74 -24 l-42 58z" fill="${flame}"/>`;
  return "";
}

function modeOverlay(mode: RenderMode, sui: string, yolk: string, flame: string) {
  if (mode === "sticker") {
    return `<path d="M50 48 h1100 v579 h-1100z" fill="none" stroke="#fff" stroke-width="16" opacity=".42"/><path d="M70 68 h1060 v539 h-1060z" fill="none" stroke="${yolk}" stroke-width="5" opacity=".55"/>`;
  }
  if (mode === "trading card") {
    return `<rect x="42" y="34" width="1116" height="607" rx="32" fill="none" stroke="${yolk}" stroke-width="12" opacity=".72"/><rect x="76" y="72" width="260" height="42" rx="21" fill="${flame}" opacity=".75"/>`;
  }
  if (mode === "glitch poster") {
    return `<g opacity=".28"><rect x="0" y="126" width="1200" height="8" fill="${sui}"/><rect x="0" y="354" width="1200" height="6" fill="${flame}"/><rect x="0" y="506" width="1200" height="10" fill="${yolk}"/></g>`;
  }
  if (mode === "comic cover") {
    return `<path d="M900 70 h210 l-34 86 h-210z" fill="${yolk}" opacity=".9"/><text x="906" y="126" fill="#101828" font-family="Arial" font-size="34" font-weight="900">RARE!</text>`;
  }
  return `<g opacity=".18" stroke="#fff" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<circle cx="${150 + i * 115}" cy="${120 + (i % 3) * 145}" r="${34 + (i % 4) * 12}" fill="none"/>`).join("")}</g>`;
}

function imageDataUrl(prompt: string, name: string, ticker: string, scene: Scene, seed: number, mode: RenderMode) {
  const [sui, yolk, flame, ink] = scene.palette;
  const eyeX = 322 + (seed % 24);
  const crestTilt = (seed % 15) - 7;
  const wing = 555 + (seed % 86);
  const bodySquash = 1 + ((seed % 9) - 4) / 100;
  const safePrompt = escapeXml(prompt).slice(0, 92);
  const safeName = escapeXml(name);
  const safeTicker = escapeXml(ticker);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset=".46" stop-color="${sui}"/><stop offset="1" stop-color="${flame}"/></linearGradient>
<radialGradient id="glow" cx="54%" cy="40%" r="58%"><stop offset="0" stop-color="${yolk}" stop-opacity=".9"/><stop offset="1" stop-color="${yolk}" stop-opacity="0"/></radialGradient>
<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="24" stdDeviation="18" flood-color="#000" flood-opacity=".38"/></filter>
<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<rect width="1200" height="675" fill="url(#bg)"/>
${modeOverlay(mode, sui, yolk, flame)}
<circle cx="790" cy="170" r="260" fill="url(#glow)"/>
${backgroundMotif(scene, yolk, flame, sui)}
<g opacity=".24" fill="#fff"><circle cx="120" cy="120" r="10"/><circle cx="1030" cy="440" r="14"/><circle cx="720" cy="78" r="8"/><circle cx="1110" cy="88" r="6"/><path d="M80 570 C220 520 310 650 460 600 S770 530 910 612 S1110 545 1190 585" fill="none" stroke="#fff" stroke-width="5"/></g>
<g filter="url(#shadow)" transform="translate(120 78) scale(${bodySquash} 1)">
<ellipse cx="445" cy="365" rx="245" ry="175" fill="#fff7d6"/>
<path d="M280 250 C260 125 360 85 438 130 C508 55 650 100 635 235 C735 270 745 430 627 492 C520 555 335 530 280 435 Z" fill="#fff2b8"/>
<path d="M356 105 C362 38 432 18 472 76 C517 18 598 46 585 119 C548 92 508 93 478 128 C440 91 402 91 356 105Z" fill="${flame}" transform="rotate(${crestTilt} 470 94)"/>
${accessory(scene, flame, yolk, sui)}
<path d="M615 250 C735 232 790 310 760 382 C720 356 675 352 625 370Z" fill="${yolk}"/>
<path d="M300 300 C190 284 155 352 187 422 C230 388 273 383 325 402Z" fill="${sui}"/>
${eyes(scene.expression, eyeX)}
<path d="M390 292 L468 322 L390 354 Z" fill="${flame}"/>
<path d="M450 445 C500 488 ${wing} 480 606 432" fill="none" stroke="#101828" stroke-width="16" stroke-linecap="round" opacity=".55"/>
</g>
<g font-family="Arial, Helvetica, sans-serif">
<text x="64" y="92" fill="#fff" font-size="28" font-weight="900" opacity=".9">SuiCluck.fun AI Launch</text>
<text x="64" y="590" fill="#fff" font-size="58" font-weight="900">${safeName}</text>
<text x="66" y="635" fill="${yolk}" font-size="34" font-weight="900">$${safeTicker}</text>
<text x="64" y="132" fill="#fff" font-size="20" opacity=".8">${safePrompt}</text>
</g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function generateMeme(prompt: string): MemeGeneration {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) throw new Error("Prompt is required.");

  const seed = hashPrompt(cleanPrompt);
  return generateMemeVariant(cleanPrompt, seed);
}

export function generateMemeVariant(prompt: string, variation: number): MemeGeneration {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) throw new Error("Prompt is required.");

  const semanticSeed = hashPrompt(cleanPrompt);
  const seed = hashPrompt(`${cleanPrompt}:${variation}`);
  const scene = resolveScene(cleanPrompt, seed);
  const mode = pick(["sticker", "trading card", "glitch poster", "comic cover", "vaporwave"] as const, seed, 29);
  const name = `${scene.adjective} ${scene.noun}`;
  const ticker = tickerFrom(name, semanticSeed);

  return {
    name,
    ticker,
    imageUrl: imageDataUrl(cleanPrompt, name, ticker, scene, seed, mode),
    description: `AI-hatched on Sui from: ${cleanPrompt}`,
    prompt: cleanPrompt,
    palette: scene.palette,
    style: `${mode}, ${scene.motif} scene, ${scene.accessory} accessory, ${scene.expression} expression`,
  };
}
