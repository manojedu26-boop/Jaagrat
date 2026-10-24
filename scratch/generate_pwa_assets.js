const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 Table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, colorFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLen);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Icon generator (Sleek dark shield with orange emblem and green radar center)
function drawJaagratIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background squircle
  const bgR = 15, bgG = 23, bgB = 42; // #0F172A

  // Shield boundary calculation
  const nx = Math.abs(dx) / (w * 0.40);
  const ny = (y - (h * 0.15)) / (h * 0.70);

  let isShieldBorder = false;
  let isShieldInside = false;

  if (y > h * 0.15 && y < h * 0.85) {
    let shieldWidth = 1.0;
    if (ny > 0.4) {
      // tapering to bottom point
      shieldWidth = 1.0 - (ny - 0.4) * 1.6;
    }
    if (nx < shieldWidth && shieldWidth > 0) {
      isShieldInside = true;
      if (nx > shieldWidth - 0.08 || y < h * 0.18 || (ny > 0.38 && nx > shieldWidth - 0.12)) {
        isShieldBorder = true;
      }
    }
  }

  // Center glowing eye / radar
  const eyeDist = Math.sqrt(dx * dx + (dy + h * 0.05) * (dy + h * 0.05));
  if (eyeDist < w * 0.08) {
    // Green center eye
    return [34, 197, 94, 255]; // #22C55E
  }
  if (eyeDist > w * 0.12 && eyeDist < w * 0.14) {
    // Green radar ring
    return [34, 197, 94, 255];
  }

  if (isShieldBorder) {
    // Orange glowing shield border
    return [255, 87, 34, 255]; // #FF5722
  }

  if (isShieldInside) {
    // Dark inner shield
    return [26, 36, 62, 255];
  }

  // Outer background
  return [bgR, bgG, bgB, 255];
}

// Generate icon-512.png and icon-192.png
const buf512 = createPng(512, 512, drawJaagratIcon);
fs.writeFileSync(path.join(__dirname, '../assets/icon-512.png'), buf512);
console.log('[OK] Created assets/icon-512.png (Bytes: ' + buf512.length + ')');

const buf192 = createPng(192, 192, drawJaagratIcon);
fs.writeFileSync(path.join(__dirname, '../assets/icon-192.png'), buf192);
console.log('[OK] Created assets/icon-192.png (Bytes: ' + buf192.length + ')');

// Copy screenshot from tempMedia
const tempMediaDir = 'C:\\Users\\Milana\\.gemini\\antigravity-ide\\brain\\ac8d82d2-0292-46d2-8265-06690302050b\\.tempmediaStorage';
const candidateScreenshots = [
  'media_1792684159331.png',
  'media_1792684187138.png',
  'media_1792684201719.png'
];

let screenshotCopied = false;
for (const s of candidateScreenshots) {
  const fullP = path.join(tempMediaDir, s);
  if (fs.existsSync(fullP)) {
    fs.copyFileSync(fullP, path.join(__dirname, '../assets/screenshot-1.png'));
    console.log('[OK] Copied real screenshot from ' + s + ' to assets/screenshot-1.png');
    screenshotCopied = true;
    break;
  }
}

if (!screenshotCopied) {
  // Generate a fallback screenshot
  const bufScreen = createPng(540, 960, drawJaagratIcon);
  fs.writeFileSync(path.join(__dirname, '../assets/screenshot-1.png'), bufScreen);
  console.log('[OK] Generated fallback assets/screenshot-1.png');
}

// Write 100% PWABuilder-compliant manifest.json
const fullManifest = {
  "id": "https://jaagrat01.vercel.app/",
  "name": "Jaagrat Driver Fatigue Guard",
  "short_name": "Jaagrat",
  "description": "Commercial Driver Fatigue Detection & MoRTH AIS-140 Fleet Safety Telematics System",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
  "orientation": "portrait",
  "background_color": "#0B0F19",
  "theme_color": "#0F172A",
  "dir": "ltr",
  "lang": "en-US",
  "prefer_related_applications": false,
  "categories": ["business", "productivity", "utilities", "transportation"],
  "icons": [
    {
      "src": "/assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/assets/screenshot-1.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Commercial Driver Cockpit HUD"
    }
  ],
  "shortcuts": [
    {
      "name": "Start Drive Shift",
      "short_name": "Drive",
      "description": "Start AI Front Camera Driver Shift",
      "url": "/#drive",
      "icons": [{ "src": "/assets/icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "Fleet Portal",
      "short_name": "Fleet",
      "description": "View Live Fleet Map & Telematics",
      "url": "/#fleet",
      "icons": [{ "src": "/assets/icon-192.png", "sizes": "192x192" }]
    }
  ]
};

const manifestStr = JSON.stringify(fullManifest, null, 2);
fs.writeFileSync(path.join(__dirname, '../manifest.json'), manifestStr);
fs.writeFileSync(path.join(__dirname, '../web/manifest.json'), manifestStr);
console.log('[OK] Updated manifest.json & web/manifest.json');
