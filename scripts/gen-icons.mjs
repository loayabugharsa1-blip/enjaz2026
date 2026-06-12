import sharp from "sharp";
import { join } from "path";
import { fileURLToPath } from "url";

const dir = fileURLToPath(new URL("..", import.meta.url));
const src = join(dir, "public", "logo.png");
const dest = join(dir, "src-tauri", "icons");

await Promise.all([
  sharp(src).resize(32, 32).toFile(join(dest, "32x32.png")),
  sharp(src).resize(128, 128).toFile(join(dest, "128x128.png")),
  sharp(src).resize(256, 256).toFile(join(dest, "128x128@2x.png")),
  sharp(src).resize(256, 256).toFile(join(dest, "icon.ico")),
]);

console.log("Tauri icons regenerated from logo.png");
