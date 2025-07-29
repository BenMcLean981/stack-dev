import { Command } from "commander";
import { createConfigPackage } from "./config-package";
import { createWorkspace } from "./workspace";

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
    ".",
  )
  .action(async (name, options) => {
    const output = options.output ?? process.cwd();

    await createWorkspace(name, output);
  });

program
  .command("g <name>")
  .description("Create a new package")
  .option(
    "-c, --config",
    "Whether or not a config package should be generated",
    false,
  )
  .action(async (name, options) => {
    const config = options.config ?? false;

    if (config) {
      await createConfigPackage(name);
    } else {
      throw new Error("Not implemented.");
    }
  });

program.parse();
