/**
 * Shared config packages that newer workspaces no longer have. They are
 * replaced wholesale rather than migrated in place, so the per-package
 * migrations skip them.
 */
export const LEGACY_CONFIG_PACKAGES = [
  'eslint-config',
  'prettier-config',
] as const;

export function isLegacyConfigPackage(
  packageName: string,
  namespace: string,
): boolean {
  return LEGACY_CONFIG_PACKAGES.some(
    (name) => packageName === `${namespace}/${name}`,
  );
}
