import fg from "fast-glob";
import Asset from "./Asset.ts";
import Link from "./Link.ts";
import { resolve } from "node:path";
import vaultArgs, { type VaultArgs } from "../schemas/vaultArgs.ts";

/**
 * Single Obsidian vault.
 */
export default class Vault {
  private constructor(
    public readonly assets: Asset[],
    public readonly base?: string,
  ) {}

  /**
   * Return the path of all the included files within this vault instance.
   */
  paths() {
    return this.assets
      .map(asset => asset.fsPath);
  }

  /**
   * Return the unique name of the given asset if one can be constructed. If there are other files with the same file
   * name the function returns `null`.
   * @param asset The asset to find the unique name for.
   */
  uniqueName(asset: Asset): string | null {
    const name = asset.name();

    if (name === null) {
      return null;
    }

    const assets = this.resolveLinkAll(name);

    if (assets.length === 1) {
      return name;
    }

    return null;
  }

  /**
   * Return the asset for the given path or link. If multiple assets match the given path then the function returns
   * `null`.
   * @param target The path or link to resolve.
   */
  resolve(target: string | Link): Asset | null {
    const assets = this.resolveLinkAll(target);

    if (assets.length === 1) {
      return assets[0] ?? null;
    }

    return null;
  }

  /**
   * Return all matches for the given target, including ambiguous matches.
   * @param path
   */
  resolveLinkAll(path: string | Link): Asset[] {
    const absoluteMatches = this.assets.filter(asset => asset.isMatchFor(path) === "exact");

    if (absoluteMatches.length > 0) {
      return absoluteMatches;
    }

    return this.assets.filter(asset => asset.isMatchFor(path) === "name");
  }

  /**
   * Get all Markdown files in the vault.
   */
  markdownAssets(): Asset[] {
    return this.assets.filter(asset => asset.isMarkdown());
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
  static async fromArgs(args: VaultArgs): Promise<Vault> {
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