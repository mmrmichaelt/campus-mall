import { execFileSync } from "node:child_process";

process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";

const bin = (name) => (process.platform === "win32" ? `${name}.cmd` : name);

execFileSync(bin("prisma"), ["generate"], { stdio: "inherit" });
if (process.env.DATABASE_URL) {
  execFileSync(bin("prisma"), ["migrate", "deploy"], { stdio: "inherit" });
}
execFileSync(bin("next"), ["build"], { stdio: "inherit" });
