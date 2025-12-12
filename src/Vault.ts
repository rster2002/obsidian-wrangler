import fg from "fast-glob";
import Asset from "./Asset.ts";
import Link from "./Link.ts";
import { resolve } from "node:path";

/**
 * Single Obsidian vault.
 */
export default class Vault {
  private constructor(
    public readonly assets: Asset[],
    public readonly base?: string,
  ) {}

  paths() {
    return this.assets
      .map(asset => asset.fsPath);
  }

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

  resolve(path: string | Link): Asset | null {
    const assets = this.resolveLinkAll(path);

    if (assets.length === 1) {
      return assets[0] ?? null;
    }

    return null;
  }

  resolveLinkAll(path: string | Link): Asset[] {
    console.log(path);
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

  static async fromRoot(root: string) {
    const globPath = resolve(root, "**/*");
    return await Vault.fromGlob(globPath, root);
  }

  static async fromGlob(glob: string, base?: string) {
    const paths = await fg.async(glob);

    return new Vault(
      paths.map(path => new Asset(path, base)),
      base,
    );
  }
}