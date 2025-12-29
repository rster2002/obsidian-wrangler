import minimist from "minimist";
import vaultCliArgsSchema from "../schemas/cli/vaultCliArgsSchema.ts";
import z from "zod";
import mergeOptionalArrays from "./mergeOptionalArrays.ts";
import type WranglerArgs from "../types/WranglerArgs.ts";

/**
 * Parses the arguments passed to your script and returns a standard set of extracted arguments which can be used
 * with specialized functions to easily create your own vault CLI.
 * @param args Provide a sliced list of arguments use instead of using `process.argv`
 */
export default function autoWranglerArgs(args?: string[]): WranglerArgs {
  const parsedArgs = minimist(args ?? process.argv.slice(2));
  const options = vaultCliArgsSchema.safeParse(parsedArgs);

  if (options.error) {
    throw new Error(z.prettifyError(options.error));
  }

  return {
    vaultPath: options.data!.vault ?? process.env.VAULT_PATH,
    whitelist: mergeOptionalArrays([
      options.data!.w,
      options.data!.whitelist,
    ]),
  } satisfies WranglerArgs;
}