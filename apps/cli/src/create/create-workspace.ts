import { getNamespace } from "../utils/get-namespace";
import { makeRootPackage } from "./root-package";
import { makeTypescriptConfig } from "./typescript-config";
import path from "path";

export async function createWorkspace(name: string, directory: string) {
  await validateNotInWorkspace(directory);

  console.log(`✨ Creating workspace: @${name}`);

  const fullPath = path.join(directory, name);

  const namespace = `@${name}`;
  const PACKAGES = [
    await makeRootPackage(directory, name),
    await makeTypescriptConfig(directory, namespace),
  ];

  await Promise.all(PACKAGES.map((p) => p.generate()));

  // Add a README or .gitignore if you want here
  console.log(`✅ Monorepo created at: ${fullPath}`);
}

async function validateNotInWorkspace(directory: string): Promise<void> {
  const namespace = getNamespace(directory);

  if (namespace !== undefined) {
    throw new Error(`Currently in workspace "${namespace}".`);
  }
}
