import { Command } from 'commander';
import { prompt } from 'enquirer';
import { createConfigPackage } from './packages';
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

const packageTypes = ['library', 'config', 'react', 'cli', 'next'] as const;

type PackageType = (typeof packageTypes)[number];

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
        // await createLibraryPackage(name)
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
  });

program.parse();

async function pickPackageType(
  options: Record<string, string>,
): Promise<PackageType> {
  if (options.type && isPackageType(options.type)) {
    return options.type;
  } else if (options.type && !isPackageType(options.type)) {
    throw new Error(
      `--type setting "${options.type}" is invalid, must be one of ${packageTypes.join(', ')}.`,
    );
  }

  const response = await prompt<{ type: string }>({
    type: 'select',
    name: 'type',
    message: 'What kind of package do you want?',
    choices: [...packageTypes],
  });

  if (!isPackageType(response.type)) {
    throw new Error(
      `Type "${response.type}" is invalid, must be one of ${packageTypes.join(', ')}.`,
    );
  }

  return response.type;
}

function isPackageType(s: string): s is PackageType {
  return packageTypes.some((p) => p === s);
}
