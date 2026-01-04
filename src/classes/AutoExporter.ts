import Exporter, { type WritableContents } from "./Exporter.ts";
import autoExporterArgs, { type AutoExporterArgs } from "../schemas/autoExporterArgs.ts";
import type WranglerArgs from "../types/WranglerArgs.ts";
import type Asset from "./Asset.ts";
import AssetView from "./AssetView.ts";
import type Vault from "./Vault.ts";
import { relative, dirname, basename } from "node:path";
import type Link from "./Link.ts";

export type IncludeMiddleware = (asset: Asset) => Promise<boolean>;
export type LinkMiddleware = (link: Link) => Promise<Link>;

/**
 * Imperative exporter for Markdown files and assets within a vault.
 */
export default class AutoExporter extends Exporter {
  public readonly vault: Vault;
  public readonly options: AutoExporterArgs;

  private readonly includeMiddlewares: IncludeMiddleware[] = [];
  private readonly linkMiddlewares: LinkMiddleware[] = [];

  constructor(vault: Vault, args: AutoExporterArgs)
  constructor(vault: Vault, args: WranglerArgs)
  constructor(vault: Vault, args: unknown) {
    const options = autoExporterArgs.parse(args);

    super(options.baseDir);
    this.vault = vault;
    this.options = options;
  }

  /**
   * Add a middleware for
   * @param middleware
   */
  addIncludeMiddleware(middleware: IncludeMiddleware) {
    this.includeMiddlewares.push(middleware);
  }

  addLinkMiddleware(middleware: LinkMiddleware) {
    this.linkMiddlewares.push(middleware);
  }

  /**
   * Automatically export Markdown files with the current configured source.
   */
  async autoExportMd() {
    const exports = this.options.export;

    if (exports === undefined && !this.options.all) {
      throw new Error("No target exports provided for AutoExporter.auto");
    }

    if (this.options.all) {
      return await this.exportManyMd(this.vault);
    }

    const assetsToExport = exports!
      .map(search => this.vault.resolve(search))
      .filter(asset => asset !== null);

    const subview = new AssetView(assetsToExport);
    return await this.exportManyMd(subview);
  }

  /**
   * Export Markdown files within the given asset view.
   * @param assetView View to use,
   */
  async exportManyMd(assetView: AssetView): Promise<void> {
    for (const asset of assetView.assets) {
      const include = await this.includeAsset(asset);

      if (!include) {
        continue;
      }

      await this.exportAsset(asset);
    }
  }

  async exportAsset(asset: Asset): Promise<void> {
    if (asset.isMarkdown()) {
      await this.exportAsset(asset);
    }
  }

  async exportMd(asset: Asset): Promise<void> {
    if (!asset.isMarkdown()) {
      throw new Error("Attempt to export non markdown content using AutoExporter.exportMd");
    }

    const placementPath = this.placementPath(asset);
    const content = await asset.mdContent();

    for (let link of content.links()) {
      for (const middleware of this.linkMiddlewares) {
        link = await middleware(link);
      }

      if (link.isExternal() || link.isHash()) {
        content.md(link);
        continue;
      }

      const linkTarget = this.vault.resolve(link);
      if (linkTarget === null) {
        content.erase(link);
        continue;
      }

      link.target = this.resolvePlacementOf(asset, linkTarget);
      content.md(link);
    }

    await this.copyOrWrite(placementPath, asset, content);
  }

  /**
   * Whether the target asset should be included in the export.
   * @param asset The asset to check.
   * @protected
   */
  protected async includeAsset(asset: Asset): Promise<boolean> {
    for (const middleware of this.includeMiddlewares) {
      const result = await middleware(asset);
      if (!result) {
        return false;
      }
    }

    return true;
  }

  protected resolvePlacementOf(from: Asset, to: Asset, linkPlacement = this.options.linkPlacement): string {
    switch (linkPlacement) {
      case "placement": {
        return this.placementPath(to);
      }

      case "root": {
        return this.placementPath(to, "root");
      }

      case "absolute": {
        return this.placementPath(to, "relative");
      }

      case "relative": {
        const placementPath = this.placementPath(from);

        let targetLinkPath = this.placementPath(to);
        targetLinkPath = relative(dirname(placementPath), dirname(targetLinkPath)) + "/" + basename(targetLinkPath);
        targetLinkPath = targetLinkPath.replace(/^\//, "");

        return targetLinkPath;
      }
    }
  }

  protected placementPath(asset: Asset, placement: "relative" | "root" = this.options.placement): string {
    switch (placement) {
      case "relative": {
        let relativePath = this.vault.relativePath(asset);

        for (const trim of this.options.trimStarts || []) {
          relativePath = relativePath.replace(new RegExp(`^${trim}/`), "");
        }

        return relativePath;
      }

      case "root": {
        return asset.fileName()!;
      }
    }
  }
}