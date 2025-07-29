import { Command } from 'commander'
import { createConfigPackage } from './config-package'
import { createWorkspace } from './workspace'

const program = new Command()

program
  .name('stack')
  .description('Opinionated TypeScript workspace manager')
  .version('0.1.0')

program
  .command('create <name>')
  .description('Create a new workspace')
  .option(
    '-o, --output <dir>',
    'Target directory to create the workspace in',
    '.'
  )
  .action(async (name, options) => {
    const output = options.output ?? process.cwd()

    await createWorkspace(name, output)
  })

program
  .command('g <name>')
  .description('Generate a new package or app')
  .option(
    '-t, --type <type>',
    'Type of package to generate (library, config, react, cli, next)',
    'library'
  )
  .action(async (name, options) => {
    const type = options.type ?? 'library'

    switch (type) {
      case 'library':
        // await createLibraryPackage(name)
        break
      case 'config':
        await createConfigPackage(name)
        break
      case 'react':
        // await createReactPackage(name)
        break
      case 'cli':
        // await createCliPackage(name)
        break
      case 'next':
        // await createNextPackage(name)
        break
      default:
        console.error(`Unknown package type: ${type}`)
        process.exit(1)
    }
  })

program.parse()

program.parse()
