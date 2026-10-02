import { defineConfig } from 'oxfmt';

import base from './base.ts';

export default defineConfig({
  ...base,
  jsxSingleQuote: true,
});
