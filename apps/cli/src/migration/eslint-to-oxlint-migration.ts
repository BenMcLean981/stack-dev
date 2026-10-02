import { catalogDependency, Dependency, PackageJSON } from '../package-json';
import {
  makeOxlintConfigGenerator,
  makeReactOxlintConfigGenerator,
} from '../packages/files/oxlint-config-file-generator';
import { FileChange } from './file-change';
import { MigratingWorkspace, Migration } from './migration';
import {
  detectToolReplacement,
  isReactPackage,
  ToolReplacement,
} from './tool-replacement';

export class EslintToOxlintMigration implements Migration {
  public get name(): string {
    return 'eslint -> oxlint';
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

const CONFIG = '.oxlintrc.json';

const REPLACEMENT: ToolReplacement = {
  legacyConfig: 'eslint.config.mjs',
  config: CONFIG,
  isLegacyDependency: isEslintDependency,
  makeConfigGenerator: (packageJson: PackageJSON) =>
    isReactPackage(packageJson)
      ? makeReactOxlintConfigGenerator(CONFIG)
      : makeOxlintConfigGenerator(CONFIG),
  makeDependencies: (namespace: string) => [
    catalogDependency('oxlint'),
    new Dependency(`${namespace}/oxlint-config`, 'workspace:*'),
  ],
  scripts: { lint: 'oxlint' },
};

function isEslintDependency(name: string, namespace: string): boolean {
  return (
    name === 'eslint' ||
    name.startsWith('eslint-') ||
    name.startsWith('@eslint/') ||
    name === 'typescript-eslint' ||
    name.startsWith('@typescript-eslint/') ||
    name === `${namespace}/eslint-config`
  );
}
