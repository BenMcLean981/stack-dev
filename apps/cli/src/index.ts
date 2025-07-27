import { Command } from "commander";

const program = new Command();

program
  .name("stack")
  .description("Opinionated TypeScript monorepo generator")
  .version("0.1.0");

program
  .command("create <name>")
  .description("Create a new monorepo project")
  .action((name) => {
    console.log(`✨ Creating monorepo: ${name}`);
    // TODO: call core scaffolding logic here
  });

program.parse();
