import { FileGenerator } from '../file-generator';
import { catalogDependency, PackageJSON } from '../package-json';
import { TSDOWN_FILE_GENERATOR as CLI_TSDOWN } from '../packages/cli-app/files/tsdown-file-generator';
import { TSDOWN_FILE_GENERATOR as FASTIFY_TSDOWN } from '../packages/fastify-app/files/tsdown-file-generator';
import { TSDOWN_CONFIG_FILE_GENERATOR as LIBRARY_TSDOWN } from '../packages/library-package/files/tsdown-config-file-generator';
import { TSDOWN_CONFIG_FILE_GENERATOR as REACT_TSDOWN } from '../packages/react-package/unstyled-react-package/files/tsdown-config-file-generator';
import { FileChange } from './file-change';
import { MigratingWorkspace, Migration } from './migration';
import {
  detectToolReplacement,
  isReactPackage,
  ToolReplacement,
} from './tool-replacement';

export class TsupToTsdownMigration implements Migration {
  public get name(): string {
    return 'tsup -> tsdown';
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

const REPLACEMENT: ToolReplacement = {
  legacyConfig: 'tsup.config.ts',
  config: 'tsdown.config.ts',
  isLegacyDependency: (name: string) => name === 'tsup',
  makeConfigGenerator: (packageJson: PackageJSON) =>
    pickTsdownGenerator(packageJson),
  makeDependencies: () => [catalogDependency('tsdown')],
  scripts: { build: 'tsdown' },
};

/**
 * The tsdown config differs by what the package produces, which the package
 * itself tells us: a `bin` means an executable, fastify means a server, react
 * means a component library, and anything else is a plain library.
 */
function pickTsdownGenerator(packageJson: PackageJSON): FileGenerator {
  if (dependsOn(packageJson, 'fastify')) {
    return FASTIFY_TSDOWN;
  }

  if (hasBin(packageJson)) {
    return CLI_TSDOWN;
  }

  if (isReactPackage(packageJson)) {
    return REACT_TSDOWN;
  }

  return LIBRARY_TSDOWN;
}

function hasBin(packageJson: PackageJSON): boolean {
  return JSON.parse(packageJson.format('')).bin !== undefined;
}

function dependsOn(packageJson: PackageJSON, name: string): boolean {
  return [...packageJson.dependencies, ...packageJson.devDependencies].some(
    (d) => d.name === name,
  );
}
