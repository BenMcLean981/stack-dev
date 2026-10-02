import { catalogDependency, Dependency, PackageJSON } from '../package-json';
import {
  makeOxfmtConfigFileGenerator,
  makeReactOxfmtConfigFileGenerator,
} from '../packages/files/oxfmt-config-file-generator';
import { FileChange } from './file-change';
import { MigratingWorkspace, Migration } from './migration';
import {
  detectToolReplacement,
  isReactPackage,
  ToolReplacement,
} from './tool-replacement';

export class PrettierToOxfmtMigration implements Migration {
  public get name(): string {
    return 'prettier -> oxfmt';
  }

  public async detect(
    workspace: MigratingWorkspace,
  ): Promise<ReadonlyArray<FileChange>> {
    const perPackage = await Promise.all(
      workspace.packages.map((p) =>
        detectToolReplacement(workspace, p.directory, REPLACEMENT),
      ),
    );

    return perPackage.flat();
  }
}

const CONFIG = 'oxfmt.config.mts';

const REPLACEMENT: ToolReplacement = {
  legacyConfig: 'prettier.config.mjs',
  config: CONFIG,
  isLegacyDependency: isPrettierDependency,
  makeConfigGenerator: (packageJson: PackageJSON, namespace: string) =>
    isReactPackage(packageJson)
      ? makeReactOxfmtConfigFileGenerator(CONFIG, namespace)
      : makeOxfmtConfigFileGenerator(CONFIG, namespace),
  makeDependencies: (namespace: string) => [
    catalogDependency('oxfmt'),
    new Dependency(`${namespace}/oxfmt-config`, 'workspace:*'),
  ],
  scripts: { format: 'oxfmt .', 'format:check': 'oxfmt --check .' },
};

function isPrettierDependency(name: string, namespace: string): boolean {
  return (
    name === 'prettier' ||
    name.startsWith('prettier-plugin-') ||
    name === `${namespace}/prettier-config`
  );
}
