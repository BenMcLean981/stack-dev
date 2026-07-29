import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const TSDOWN = `import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  platform: "node",
  outExtensions({ format }) {
    return {
      js: format === "es" ? ".mjs" : ".js",
    };
  },
});
`;

export const TSDOWN_FILE_GENERATOR = new FileGeneratorImp(
  'tsdown.config.ts',
  TSDOWN,
);
