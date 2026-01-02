import fg from "fast-glob";
import Asset from "./Asset.ts";
import Link from "./Link.ts";
import { resolve } from "node:path";
import vaultArgs, { type VaultArgs } from "../schemas/vaultArgs.ts";
import type WranglerArgs from "../types/WranglerArgs.ts";
import AssetView from "./AssetView.ts";

/**
 * Single Obsidian vault.
 */
export default class Vault extends AssetView {
  private constructor(
    assets: Asset[],
    public readonly base?: string,
  ) {
    super(assets);
  }

  relativePath(asset: Asset): string {
    return asset.fsPath.replace(this.base ?? "", "").replace(/^\//g, "");
  }

  /**
   * Construct a new vault using the given root and recursively include all files.
   * @param root The root of the vault to use.
   */
  static async fromRoot(root: string): Promise<Vault> {
    const globPath = resolve(root, "**/*");
    return await Vault.fromGlob(globPath, root);
  }

  /**
   * Construct a new vault based on the given blob. Note that the `base` does not scope the glob pattern.
   * @param glob
   * @param base
   */
  static async fromGlob(glob: string, base?: string): Promise<Vault> {
    const paths = await fg.async(glob);

    return new Vault(
      paths.map(path => new Asset(path, base)),
      base,
    );
  }

  /**
   * Construct a new vault based on vault CLI args.
   * @param args The arguments to use.
   */
  static async fromArgs(args: VaultArgs): Promise<Vault>
  static async fromArgs(args: WranglerArgs): Promise<Vault>
  static async fromArgs(args: unknown): Promise<Vault> {
    let paths: string[] = [];

    const options = vaultArgs.parse(args);

    if (options.vaultPath === undefined) {
      throw new Error("No vault path provided");
    }

    if (options.whitelist === undefined) {
      paths = await fg.async(resolve(options.vaultPath, "**/*"));
    } else {
      for (const whitelist of options.whitelist) {
        paths = paths.concat(await fg.async(resolve(options.vaultPath, whitelist)));
      }
    }

    return new Vault(
      paths.map(path => new Asset(path, options.vaultPath)),
      options.vaultPath,
    );
  }
}