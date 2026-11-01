import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function renderRadioSatiePNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const scale = size / 512;

  // Maskable safe zone margin (padding on all sides)
  const padScale = isMaskable ? 0.75 : 0.9;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Default dark background: #0a0a0a
      let r = 10;
      let g = 10;
      let b = 10;
      let a = 255;

      const dx = (x - cx) / (scale * padScale);
      const dy = (y - cy) / (scale * padScale);
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Outer dial ring
      if (Math.abs(distFromCenter - 216) < 3.5) {
        r = 50; g = 50; b = 50;
      }

      // Satie Spectacles: Left circle center (-76, -66), r=54; Right circle (76, -66), r=54
      const dLeft = Math.sqrt((dx + 76) * (dx + 76) + (dy + 66) * (dy + 66));
      const dRight = Math.sqrt((dx - 76) * (dx - 76) + (dy + 66) * (dy + 66));

      if (Math.abs(dLeft - 54) < 6 || Math.abs(dRight - 54) < 6) {
        r = 240; g = 240; b = 240;
      }
      // Bridge between glasses
      if (Math.abs(dx) < 22 && dy > -72 && dy < -62) {
        r = 240; g = 240; b = 240;
      }

      // Stylized Piano Keys: Box from x: -150 to 150, y: 24 to 134
      if (dx >= -150 && dx <= 150 && dy >= 24 && dy <= 134) {
        // Base white keys
        r = 230; g = 230; b = 230;

        // Key vertical dividers
        const keyWidth = 300 / 7;
        const keyRelX = dx + 150;
        const keyIndex = Math.floor(keyRelX / keyWidth);
        const distFromDivider = Math.abs((keyRelX % keyWidth));
        if (distFromDivider < 1.5) {
          r = 20; g = 20; b = 20;
        }

        // Black keys (between keys 0-1, 1-2, 3-4, 4-5, 5-6)
        if (dy <= 88) {
          const blackOffsets = [keyWidth, keyWidth * 2, keyWidth * 4, keyWidth * 5, keyWidth * 6];
          for (const bo of blackOffsets) {
            if (Math.abs(keyRelX - bo) < 13) {
              r = 18; g = 18; b = 18;
            }
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Header chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', renderRadioSatiePNG(192, false));
fs.writeFileSync('./public/pwa-512x512.png', renderRadioSatiePNG(512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', renderRadioSatiePNG(512, true));
fs.writeFileSync('./public/apple-touch-icon.png', renderRadioSatiePNG(180, false));

console.log('Generated Radio Satie PWA PNG icons successfully.');
