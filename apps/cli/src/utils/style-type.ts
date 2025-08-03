import { prompt } from 'enquirer';

export const styleTypes = [
  'tailwind',
  'sass',
  'styled-components',
  'none',
] as const;

export type StyleType = (typeof styleTypes)[number];

export async function pickStyleType(
  options: Record<string, string | undefined>,
): Promise<StyleType> {
  if (options.type && isStyleType(options.type)) {
    return options.type;
  } else if (options.type && !isStyleType(options.type)) {
    throw new Error(
      `--type setting "${options.type}" is invalid, must be one of ${styleTypes.join(', ')}.`,
    );
  }

  const response = await prompt<{ type: string }>({
    type: 'select',
    name: 'type',
    message: 'What kind of style do you want?',
    choices: [...styleTypes],
  });

  if (!isStyleType(response.type)) {
    throw new Error(
      `Type "${response.type}" is invalid, must be one of ${styleTypes.join(', ')}.`,
    );
  }

  return response.type;
}

export function isStyleType(s: string): s is StyleType {
  return styleTypes.some((p) => p === s);
}
