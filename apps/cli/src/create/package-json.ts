import path from "path";
import { writeFile } from "fs/promises";

export async function createPackageJson(rootDir: string, name: string) {
  await writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name,
        version: "0.1.0",
        description: "",
        keywords: [],
        author: "",
        private: true,
        license: "UNLICENSED",
        packageManager: "pnpm@10.13.1",
        devDependencies: {
          turbo: "^2.5.4",
        },
      },
      null,
      2
    )
  );
}
