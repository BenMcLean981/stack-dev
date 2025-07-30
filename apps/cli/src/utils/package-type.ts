import { prompt } from 'enquirer';

export const packageTypes = [
  'library',
  'config',
  'react',
  'cli',
  'next',
] as const;

export type PackageType = (typeof packageTypes)[number];

export async function pickPackageType(
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

export function isPackageType(s: string): s is PackageType {
  return packageTypes.some((p) => p === s);
}
