#!/usr/bin/env node

import { dirname, resolve } from 'node:path'

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Run Prettier from the config package root
const prettier = resolve(__dirname, '../node_modules/.bin/prettier')
const config = resolve(__dirname, '../prettier.config.mjs')

// Get the actual CLI args
const userArgs = process.argv.slice(2)

// Ensure input paths are resolved relative to the config package
const normalizedArgs = userArgs.map((arg) =>
  arg.startsWith('-') ? arg : resolve(process.cwd(), arg)
)

// Spawn Prettier with the config, from the config dir
spawn(prettier, ['--config', config, ...normalizedArgs], {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'), // <- this is the fix!
}).on('exit', process.exit)
