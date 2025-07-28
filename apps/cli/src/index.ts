import { Command } from "commander";
import { createWorkspace } from "./create";

const program = new Command();

program
  .name("stack")
  .description("Opinionated TypeScript workspace manager")
  .version("0.1.0");

program
  .command("create <name>")
  .description("Create a new workspace")
  .option(
    "-o, --output <dir>",
    "Target directory to create the workspace in",
    "."
  )
  .action(async (name) => {
    const output = program.opts().output ?? process.cwd();

    await createWorkspace(name, output);
  });

program.parse();
