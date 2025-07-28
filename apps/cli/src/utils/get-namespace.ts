import fs from "node:fs/promises";
import path from "node:path";

export async function getNamespace(cwd: string): Promise<string | undefined> {
  while (true) {
    const parent = path.dirname(cwd);

    const packageJson = await getPackageJson(cwd);

    if (packageJson !== undefined) {
      const name = JSON.parse(packageJson).name;

      return `@${name}`;
    } else {
      if (parent === cwd) {
        break;
      }

      cwd = parent;
    }
  }

  return undefined;
}

async function getPackageJson(directory: string): Promise<string | undefined> {
  const packageJsonPath = path.join(directory, "package.json");

  const isWorkspace =
    (await fileExists(path.join(directory, "pnpm-workspace.yaml"))) ||
    (await fileExists(path.join(directory, "pnpm-workspace.yml")));

  if (isWorkspace) {
    try {
      return fs.readFile(packageJsonPath, "utf8");
    } catch (e) {
      console.error(e);

      throw new Error("Workspace root missing package.json.");
    }
  }

  return undefined;
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access("/path/to/file", fs.constants.F_OK);

    return true;
  } catch {
    return false;
  }
}
