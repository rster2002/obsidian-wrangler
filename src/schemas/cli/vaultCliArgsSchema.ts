import { z } from "zod/mini";
import arrayArguments from "./arrayArguments.ts";

const vaultCliArgsSchema = z.object({
  vault: z.optional(z.string()).check(z.meta({
    id: "vault",
    description: "Path pointing to the root of the vault to work on.",
  })),

  w: arrayArguments.check(z.meta({
    id: "w",
    description: "Path or glob pattern of files to whitelist in the vault",
  })),

  whitelist: arrayArguments.check(z.meta({
    id: "whitelist",
    description: "Path or glob pattern of files to whitelist in the vault",
  })),
});

export type CommandArguments = z.infer<typeof vaultCliArgsSchema>;

export default vaultCliArgsSchema;
