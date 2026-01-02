import { z } from "zod/mini";
import arrayArguments from "./cli/arrayArguments.ts";

const autoExporterArgs = z.object({
  baseDir: z.string().check(
    z.minLength(0),
    z.meta({
      id: "base",
      description: "The base directory to export the contents to.",
    })
  ),

  export: arrayArguments,

  placement: z._default(z.enum(["root", "relative"]), "root"),
  linkPlacement: z._default(z.enum(["root", "relative", "absolute", "placement"], "relative"), "relative"),

  trimStarts: arrayArguments.check(z.meta({
    description: "List of path starts to trim before exporting",
  })),

  all: z._default(z.boolean(), false),
});

export type AutoExporterArgs = z.infer<typeof autoExporterArgs>;
export default autoExporterArgs;