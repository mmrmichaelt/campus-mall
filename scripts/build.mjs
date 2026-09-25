import { execFileSync } from "node:child_process";

process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";

const bin = (name) => (process.platform === "win32" ? `${name}.cmd` : name);

execFileSync(bin("prisma"), ["db", "push", "--skip-generate"], { stdio: "inherit" });
execFileSync(bin("prisma"), ["generate"], { stdio: "inherit" });
execFileSync(bin("next"), ["build"], { stdio: "inherit" });
