import path from "path";
import { writeFile } from "fs/promises";

export async function createTsconfig(rootDir: string) {
  await writeFile(
    path.join(rootDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          composite: true,
          module: "ESNext",
          moduleResolution: "NodeNext",
          target: "ESNext",
          strict: true,
          skipLibCheck: true,
        },
        exclude: ["node_modules", "dist"],
      },
      null,
      2
    )
  );
}

export async function createTypescriptConfig(rootDir: string) {}

const TSCONFIG_BASE = {
  compilerOptions: {
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    strict: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    noEmit: true,
    types: [],
  },
};

const TSCONFIG_NODE = {
  extends: "./tsconfig.base.json",
  compilerOptions: {
    lib: ["ES2022"],
    types: ["node"],
  },
};

const TSCONFIG_REACT = {
  extends: "./tsconfig.base.json",
  compilerOptions: {
    jsx: "react-jsx",
    lib: ["DOM", "DOM.Iterable", "ES2022"],
    types: [],
  },
};
