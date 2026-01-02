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

  to: z.optional(z.string()).check(z.meta({
    id: "to",
    description: "Path to export files to.",
  })),

  placement: z.optional(z.string()).check(z.meta({
    id: "placement",
    description: "The placement of exported files",
  })),

  linkPlacement: z.optional(z.string()),

  export: arrayArguments,

  trimStarts: arrayArguments.check(z.meta({
    description: "List of path starts to trim before exporting",
  })),

  all: z._default(z.boolean(), false),

  _: z.array(z.string()),
});

export type VaultCliArgs = z.infer<typeof vaultCliArgsSchema>;

export default vaultCliArgsSchema;
