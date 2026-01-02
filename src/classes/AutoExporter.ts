import Exporter, { type WritableContents } from "./Exporter.ts";
import autoExporterArgs, { type AutoExporterArgs } from "../schemas/autoExporterArgs.ts";
import type WranglerArgs from "../types/WranglerArgs.ts";
import type Asset from "./Asset.ts";
import AssetView from "./AssetView.ts";
import type Vault from "./Vault.ts";
import { relative, dirname, basename, resolve } from "node:path";

export default class AutoExporter extends Exporter {
  public readonly vault: Vault;
  public readonly options: AutoExporterArgs;

  constructor(vault: Vault, args: AutoExporterArgs)
  constructor(vault: Vault, args: WranglerArgs)
  constructor(vault: Vault, args: unknown) {
    const options = autoExporterArgs.parse(args);

    super(options.baseDir);
    this.vault = vault;
    this.options = options;
  }

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

  async exportManyMd(assetView: AssetView): Promise<void> {
    for (const asset of assetView.markdownAssets()) {
      await this.exportMd(asset);
    }
  }

  async exportMd(asset: Asset) {
    if (!asset.isMarkdown()) {
      throw new Error("Attempt to export non markdown content using AutoExporter.exportMd");
    }

    const placementPath = this.placementPath(asset);
    const content = await asset.mdContent();

    for (const link of content.links()) {
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

  async exportAsset(asset: Asset): Promise<void> {

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