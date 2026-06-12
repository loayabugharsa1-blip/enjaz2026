const sharp = require("sharp");
const path = require("path");

const dir = path.resolve(__dirname, "..");
const src = path.join(dir, "public", "logo.png");
const dest = path.join(dir, "src-tauri", "icons");

async function main() {
  await Promise.all([
    sharp(src).resize(32, 32).toFile(path.join(dest, "32x32.png")),
    sharp(src).resize(128, 128).toFile(path.join(dest, "128x128.png")),
    sharp(src).resize(256, 256).toFile(path.join(dest, "128x128@2x.png")),
    sharp(src).resize(256, 256).png().toFile(path.join(dest, "icon.ico")),
  ]);
  console.log("Tauri icons regenerated from logo.png");
}

main().catch(console.error);
