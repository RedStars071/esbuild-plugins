import { program } from "commander";
import { createPackage } from "../dist/index.js";

program
  .description("A script for creating esbuild-plugins packages.")
  .argument("<name>", "The name of the new package.")
  .argument("[description]", "The description of the new package.");
program.parse();

const [packageName, description] = program.args;

console.log(`Creating package esbuild-plugins/${packageName}...`);
await createPackage(packageName, description);
console.log("Done!");
process.exit(0);
