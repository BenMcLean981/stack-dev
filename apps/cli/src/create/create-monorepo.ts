import { createPackageJson } from "./package-json";
import { createPnpmWorkspace } from "./pnpm-workspace";
import { createTsconfig } from "./tsconfig";
import { createTurboJson } from "./turbo-json";
import { mkdir } from "fs/promises";
import path from "path";

export async function createMonorepo(name: string, output: string) {
  console.log(`✨ Creating monorepo: @${name}`);

  const rootDir = path.resolve(output, name);

  await createDirectories(rootDir);
  await createPnpmWorkspace(rootDir);

  await createPackageJson(rootDir, name);

  await createTurboJson(rootDir);

  await createTsconfig(rootDir);

  // Add a README or .gitignore if you want here
  console.log(`✅ Monorepo created at: ${rootDir}`);
}
export async function createDirectories(rootDir: string) {
  const folders = [
    "apps/cli/src",
    "configs/typescript-config",
    "configs/eslint-config",
    "packages/core",
  ];

  await Promise.all(
    folders.map((folder) =>
      mkdir(path.join(rootDir, folder), { recursive: true })
    )
  );
}
