import type { AutoExporterArgs } from "../schemas/autoExporterArgs.ts";

/**
 * Predefined set of CLI arguments which can be parsed using the `wranglerArgs` function.
 */
export default interface WranglerArgs {
  /**
   * Path to the target vault to wrangle.
   */
  vaultPath?: string;

  /**
   * List of file names, directories, or glob pattern to include in the vault.
   */
  whitelist?: string[];

  action: WranglerAction;
}

export type WranglerAction = WranglerNoopAction
  | WranglerExportAction;

export interface WranglerNoopAction {
  type: "noop";
}

export interface WranglerExportAction extends AutoExporterArgs {
  type: "export";
}