import type Asset from "./Asset.ts";
import { resolve, dirname } from "node:path";
import { copyFile, writeFile, mkdir } from "node:fs/promises";
import { MdContent } from "../../index.ts";

export type WritableContents = string | MdContent;

export default class Exporter {
  constructor(
    public readonly base: string,
  ) {}

  join(path: string) {
    return new Exporter(resolve(this.base, path));
  }

  async byName(asset: Asset, contents?: WritableContents) {
    const fileName = asset.fileName();

    if (fileName === null) {
      return;
    }

    await this.copyOrWrite(fileName, asset, contents);
  }

  private async copyOrWrite(path: string, asset: Asset, contents?: WritableContents) {
    const target = resolve(this.base, path);
    const writableContents = this.toWritableContents(contents);

    await mkdir(dirname(target), { recursive: true });

    if (writableContents === undefined) {
      await copyFile(asset.fsPath, target);
    } else {
      await writeFile(target, writableContents);
    }
  }

  private toWritableContents(contents?: WritableContents) {
    if (contents === undefined) {
      return undefined;
    }

    if (contents instanceof MdContent) {
      return contents.raw();
    }

    return contents;
  }
}