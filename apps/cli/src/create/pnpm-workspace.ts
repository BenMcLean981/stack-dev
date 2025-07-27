import path from "path";
import { writeFile } from "fs/promises";

export async function createPnpmWorkspace(rootDir: string) {
  const filepath = path.join(rootDir, "pnpm-workspace.yaml");
  const contents = [
    "packages:",
    "  - apps/*",
    "  - packages/*",
    "  - configs/*",
  ].join("\n");

  await writeFile(filepath, contents);
}
