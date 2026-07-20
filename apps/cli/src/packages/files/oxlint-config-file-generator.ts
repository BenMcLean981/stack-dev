import { FileGenerator } from '../../file-generator';
import { FileGeneratorImp } from '../../file-generator/file-generator-imp';

export function makeOxlintConfigGenerator(filepath: string): FileGenerator {
  const OXLINT_CONFIG = `{
  "extends": ["../../configs/oxlint-config/base.oxlintrc.json"],
  "ignorePatterns": ["**/dist/**"]
}
`;

  return new FileGeneratorImp(filepath, OXLINT_CONFIG);
}

export function makeReactOxlintConfigGenerator(filepath: string): FileGenerator {
  const OXLINT_CONFIG = `{
  "extends": [
    "../../configs/oxlint-config/base.oxlintrc.json",
    "../../configs/oxlint-config/react.oxlintrc.json"
  ],
  "ignorePatterns": ["**/dist/**", "**/coverage/**"]
}
`;

  return new FileGeneratorImp(filepath, OXLINT_CONFIG);
}
