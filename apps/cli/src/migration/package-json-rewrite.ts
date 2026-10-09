import path from 'node:path';

import { Dependency, PackageJSON } from '../package-json';
import { RewrittenFileChange } from './rewritten-file-change';

export type PackageJsonEdit = {
  readonly removeDevDependencies?: ReadonlyArray<string>;
  readonly addDevDependencies?: ReadonlyArray<Dependency>;
  readonly scripts?: Readonly<Record<string, string | undefined>>;
};

/**
 * Rewrites a package.json through {@link PackageJSON}, which preserves keys it
 * does not model, so hand-edits in a user's workspace survive the round trip.
 */
export function makePackageJsonRewrite(
  packageDirectory: string,
  namespace: string,
  edit: PackageJsonEdit,
): RewrittenFileChange {
  return new RewrittenFileChange(
    path.join(packageDirectory, 'package.json'),
    (contents) =>
      applyEdit(PackageJSON.parse(contents), edit).format(namespace),
  );
}

function applyEdit(
  packageJson: PackageJSON,
  edit: PackageJsonEdit,
): PackageJSON {
  const withoutRemoved = (edit.removeDevDependencies ?? []).reduce(
    (acc, name) => acc.removeDevDependency(name),
    packageJson,
  );

  const withAdded = (edit.addDevDependencies ?? []).reduce(
    (acc, dependency) => acc.addDevDependency(dependency),
    withoutRemoved,
  );

  return withScripts(withAdded, edit.scripts ?? {});
}

function withScripts(
  packageJson: PackageJSON,
  scripts: Readonly<Record<string, string | undefined>>,
): PackageJSON {
  if (Object.keys(scripts).length === 0) {
    return packageJson;
  }

  return packageJson.withAdditionalData((data) => ({
    ...data,
    scripts: pruneUndefined({
      ...(data.scripts as Record<string, string> | undefined),
      ...scripts,
    }),
  }));
}

function pruneUndefined(
  scripts: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(scripts).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
}
