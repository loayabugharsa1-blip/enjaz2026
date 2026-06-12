const fs = require("fs");
const path = require("path");

function pngToIco(sources, icoPath) {
  const entries = [];
  const buffers = [];

  for (const { file, size } of sources) {
    const buf = fs.readFileSync(file);
    buffers.push(buf);
    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(w, 0);
    entry.writeUInt8(h, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entries.push(entry);
  }

  const headerSize = 6 + entries.length * 16;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  let offset = headerSize;
  for (let i = 0; i < entries.length; i++) {
    entries[i].writeUInt32LE(offset, 12);
    offset += buffers[i].length;
  }

  const ico = Buffer.concat([header, ...entries, ...buffers]);
  fs.writeFileSync(icoPath, ico);
  console.log(`ICO generated: ${icoPath} (${ico.length} bytes)`);
}

const dir = path.resolve(__dirname, "..");
const iconsDir = path.join(dir, "src-tauri", "icons");

pngToIco([
  { file: path.join(iconsDir, "32x32.png"), size: 32 },
  { file: path.join(iconsDir, "128x128.png"), size: 128 },
  { file: path.join(iconsDir, "128x128@2x.png"), size: 256 },
], path.join(iconsDir, "icon.ico"));
