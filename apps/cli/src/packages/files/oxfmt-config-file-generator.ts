import { FileGenerator } from '../../file-generator';
import { FileGeneratorImp } from '../../file-generator/file-generator-imp';

export function makeOxfmtConfigFileGenerator(
  filepath: string,
  namespace: string,
): FileGenerator {
  return new FileGeneratorImp(filepath, makeOxfmtConfig(namespace, 'base'));
}

export function makeReactOxfmtConfigFileGenerator(
  filepath: string,
  namespace: string,
): FileGenerator {
  return new FileGeneratorImp(filepath, makeOxfmtConfig(namespace, 'react'));
}

function makeOxfmtConfig(namespace: string, entry: 'base' | 'react'): string {
  return `import config from '${namespace}/oxfmt-config/${entry}';

export default config;
`;
}
