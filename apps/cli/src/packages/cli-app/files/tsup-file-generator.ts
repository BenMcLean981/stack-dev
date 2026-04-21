import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const TSUP = `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  target: "esnext",
  platform: "node",
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
});
`;

export const TSUP_FILE_GENERATOR = new FileGeneratorImp('tsup.config.ts', TSUP);
