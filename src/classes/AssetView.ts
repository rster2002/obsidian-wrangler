import Asset from "./Asset.ts";
import type Link from "./Link.ts";

export default class AssetView {
  constructor(
    public readonly assets: Asset[],
  ) {}

  /**
   * Get all Markdown files in the vault.
   */
  markdownAssets(): Asset[] {
    return this.assets.filter(asset => asset.isMarkdown());
  }

  /**
   * Return the path of all the included files within this vault instance.
   */
  paths(): string[] {
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
}