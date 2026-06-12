import { execSync } from "child_process";
import { existsSync, renameSync } from "fs";
import { join } from "path";

const root = new URL("..", import.meta.url).pathname;
const apiRoute = join(root, "app", "api", "ping", "route.ts");
const apiBak = apiRoute + ".bak";

if (existsSync(apiRoute)) {
  renameSync(apiRoute, apiBak);
}

process.env.BUILD_TARGET = "tauri";

try {
  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: "powershell.exe",
  });
} finally {
  if (existsSync(apiBak)) {
    renameSync(apiBak, apiRoute);
  }
}
