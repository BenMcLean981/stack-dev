import { defineConfig } from 'oxfmt';

/**
 * @see https://oxc.rs/docs/guide/usage/formatter
 */
export default defineConfig({
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  sortImports: true,
  // The CLI owns package.json key and dependency ordering (see
  // PackageJSON.format), so the formatter must not re-sort it.
  sortPackageJson: false,
  // Snapshot fixtures must match generator output byte for byte, so the
  // formatter must not rewrite them.
  ignorePatterns: ['**/__snapshots__/**', '**/dist/**', '**/coverage/**'],
});
