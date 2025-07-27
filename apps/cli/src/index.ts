import { Command } from "commander";
import { createMonorepo } from "./create";

const program = new Command();

program
  .name("stack")
  .description("Opinionated TypeScript monorepo generator")
  .version("0.1.0");

program
  .command("create <name>")
  .description("Create a new monorepo project")
  .option(
    "-o, --output <dir>",
    "Target directory to create the project in",
    "."
  )
  .action(async (name) => {
    const output = program.opts().output;

    await createMonorepo(name, output);
  });

program.parse();
