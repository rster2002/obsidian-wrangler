import type { VaultCliArgs } from "../../schemas/cli/vaultCliArgsSchema.ts";
import type { WranglerAction, WranglerExportAction } from "../../types/WranglerArgs.ts";
import autoExporterArgs from "../../schemas/autoExporterArgs.ts";

export default function extractAction(args: VaultCliArgs): WranglerAction {
  const action = args._.shift();

  if (action === undefined) {
    return {
      type: "noop",
    };
  }

  switch (action) {
    case "export": {
      return {
        type: "export",
        ...autoExporterArgs.parse({
          baseDir: args.to || process.env.EXPORT_TO,
          placement: args.placement || process.env.EXPORT_PLACEMENT,
          linkPlacement: args.linkPlacement || process.env.LINK_PLACEMENT,
          trimStarts: args.trimStarts || process.env.EXPORT_TRIM_STARTS,
          export: args.export || process.env.EXPORT_EXPORT,
          all: args.all || false,
        }),
      } satisfies WranglerExportAction;
    }
  }

  throw new Error(`Unknown action '${action}'`);
}