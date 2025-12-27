import Link from "./Link.ts";
import { readFile } from "node:fs/promises";
import { MdContent } from "../../index.ts";
import { IMAGE_EXTENSIONS } from "./Extensions.ts";

/**
 * File within a vault which may be a Markdown file or any other file type.
 */
export default class Asset {
  constructor(
    public readonly fsPath: string,
    public readonly base?: string,
  ) {}

  /**
   * Get segments of the path.
   */
  segments(): string[] {
    return this.fsPath.split("/");
  }

  /**
   * Get the filename of the asset.
   */
  fileName(): string | null {
    return this.segments().pop() ?? null;
  }

  /**
   * Get the name of the asset without the extension.
   */
  name(): string | null {
    const fileName = this.fileName();

    if (fileName === null) {
      return null;
    }

    return fileName.replace(/\.\w+$/g, "");
  }

  /**
   * Get the extension of the asset.
   */
  extension(): string | null {
    return this.fsPath.split(".").pop() ?? null;
  }

  /**
   * Whether the asset is a Markdown file.
   */
  isMarkdown() {
    return this.extension() === "md";
  }

  /**
   * Whether the asset is an image file.
   */
  isImage() {
    return IMAGE_EXTENSIONS.includes(this.extension() ?? "");
  }

  /**
   * Whether the asset matches the given search, either by the exact path or by the name of the file.
   * @param target The target to match against.
   */
  isMatchFor(target: string | Link): "exact" | "name" | false {
    let search: string;

    if (target instanceof Link) {
      if (target.target === undefined) {
        return false;
      }

      search = target.target;
    } else {
      search = target;
    }

    if (search.match(/\.\w+$/) === null) {
      search += ".md";
    }

    const filename = this.fileName();

    if (filename !== null && filename === search) {
      return "exact";
    }

    return this.fsPath.endsWith(search) && "name";
  }

  /**
   * Returns the contents of the asset as a string.
   */
  async text() {
    return await readFile(this.fsPath, "utf8");
  }

  /**
   * Returns the contents of the asset as Markdown content.
   */
  async mdContent() {
    return new MdContent(await this.text());
  }
}