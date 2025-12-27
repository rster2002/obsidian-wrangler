import minimist from "minimist";
import commandArguments from "../schemas/commandArguments.ts";
import z from "zod";

export default function wranglerArguments() {
  const args = minimist(process.argv.slice(2));
  const options = commandArguments.safeParse(args);

  if (options.error) {
    console.error(z.prettifyError(options.error));
  }

  return options.data;
}