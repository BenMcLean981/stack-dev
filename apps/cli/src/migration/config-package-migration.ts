import path from 'node:path';

import { fileExists } from '../utils/utils';
import { makeOxfmtConfigFileGenerators } from '../workspace/oxfmt-config';
import { makeOxlintConfigFileGenerators } from '../workspace/oxlint-config';
import { DeletedFileChange } from './deleted-file-change';
import { FileChange } from './file-change';
import { GeneratedFileChange } from './generated-file-change';
import { LEGACY_CONFIG_PACKAGES } from './legacy-config-packages';
import { MigratingWorkspace, Migration } from './migration';

export class ConfigPackageMigration implements Migration {
  public get name(): string {
    return 'shared config packages';
  }

  public async detect(
    workspace: MigratingWorkspace,
  ): Promise<ReadonlyArray<FileChange>> {
    const replacements = await Promise.all(
      REPLACEMENTS.map((r) => this.detectReplacement(workspace, r)),
    );

    return replacements.flat();
  }

  private async detectReplacement(
    workspace: MigratingWorkspace,
    replacement: ConfigPackageReplacement,
  ): Promise<ReadonlyArray<FileChange>> {
    const legacy = path.join('configs', replacement.legacy);
    const current = path.join('configs', replacement.current);

    const hasLegacy = await fileExists(path.join(workspace.root, legacy));
    const hasCurrent = await fileExists(path.join(workspace.root, current));

    if (!hasLegacy && hasCurrent) {
      return [];
    }

    return [
      ...replacement
        .makeFileGenerators(workspace.namespace)
        .map(
          (generator) =>
            new GeneratedFileChange(
              path.join(current, generator.filepath),
              generator,
            ),
        ),
      ...(hasLegacy ? [new DeletedFileChange(legacy)] : []),
    ];
  }
}

type ConfigPackageReplacement = {
  readonly legacy: (typeof LEGACY_CONFIG_PACKAGES)[number];

  readonly current: string;

  readonly makeFileGenerators: typeof makeOxlintConfigFileGenerators;
};

const REPLACEMENTS: ReadonlyArray<ConfigPackageReplacement> = [
  {
    legacy: 'eslint-config',
    current: 'oxlint-config',
    makeFileGenerators: makeOxlintConfigFileGenerators,
  },
  {
    legacy: 'prettier-config',
    current: 'oxfmt-config',
    makeFileGenerators: makeOxfmtConfigFileGenerators,
  },
];
