import { createConfigPackage, createLibraryPackage } from './packages';
import {
  comparePackages,
  getAllPackages,
  getCurrentPackage,
  getPackageByName,
} from './utils/package';
import { packageTypes, pickPackageType } from './utils/package-type';

import { Command } from 'commander';
import { prompt } from 'enquirer';
import { linkPackages } from './link';
import { createWorkspace } from './workspace';

const program = new Command();

program
  .name('stack')
  .description('Opinionated TypeScript workspace manager')
  .version('0.1.0');

program
  .command('create <name>')
  .description('Create a new workspace')
  .option(
    '-o, --output <dir>',
    'Target directory to create the workspace in',
    '.',
  )
  .action(async (name, options) => {
    const output = options.output ?? process.cwd();

    await createWorkspace(name, output);
  });

program
  .command('g <name>')
  .description('Generate a new package or app')
  .option(
    '-t, --type <type>',
    `Type of package to generate (${packageTypes.join(', ')})`,
  )
  .action(async (name, options) => {
    const type = await pickPackageType(options);

    switch (type) {
      case 'library':
        await createLibraryPackage(name);
        break;
      case 'config':
        await createConfigPackage(name);
        break;
      case 'react':
        // await createReactPackage(name)
        break;
      case 'cli':
        // await createCliPackage(name)
        break;
      case 'next':
        // await createNextPackage(name)
        break;
    }

    console.log('');
    console.log('Run pnpm install to finish linking.');
  });

program
  .command('link [name]')
  .alias('l')
  .option('-D, --dev', 'Whether to link as a devDependency.', false)
  .description('Link to the specified package')
  .action(async (name, options) => {
    name = name ?? (await promptForPackageName());

    const development = options.dev ?? false;

    if (!isValidPackageName(name)) {
      throw new Error(`Package name "${name}" is not a valid option.`);
    }

    const current = await getCurrentPackage();
    const target = await getPackageByName(name);

    await linkPackages(current, target, development);
  });

async function promptForPackageName(): Promise<string> {
  const options = await getAllPackages();
  const currentPackage = await getCurrentPackage();

  const validOptions = options
    .filter((o) => o.name !== currentPackage.name)
    .toSorted(comparePackages);

  const response = await prompt<{ packageName: string }>({
    type: 'select',
    name: 'packageName',
    message: 'What package do you want to link to?',
    choices: [...validOptions],
  });

  return response.packageName;
}

program.parse();

async function isValidPackageName(packageName: string): Promise<boolean> {
  const options = await getValidPackageNames();

  return options.some((o) => o === packageName);
}

async function getValidPackageNames(): Promise<ReadonlyArray<string>> {
  const options = await getAllPackages();
  const currentPackage = await getCurrentPackage();

  return options
    .filter((o) => o.name !== currentPackage.name)
    .map((o) => o.name);
}
