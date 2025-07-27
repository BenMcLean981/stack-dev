import path from "path";
import { writeFile } from "fs/promises";

export async function createTurboJson(rootDir: string) {
  await writeFile(
    path.join(rootDir, "turbo.json"),
    JSON.stringify(
      {
        pipeline: {
          build: { dependsOn: ["^build"], outputs: ["dist/**"] },
          dev: {},
          lint: {},
          test: {},
        },
      },
      null,
      2
    )
  );
}
