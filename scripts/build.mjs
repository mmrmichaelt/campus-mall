import { execFileSync } from "node:child_process";

process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";

execFileSync("prisma", ["generate"], { stdio: "inherit" });
execFileSync("next", ["build"], { stdio: "inherit" });
