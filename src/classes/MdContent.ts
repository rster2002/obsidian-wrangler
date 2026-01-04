import yaml from "yaml";
import Link from "./Link.ts";
import { marked } from "marked";
import Frontmatter from "./Frontmatter.ts";

/**
 * Wrapped Markdown string contents.
 */
export default class MdContent {
  constructor(
    protected inner: string,
  ) {}

  /**
   * Get the raw Markdown string.
   */
  raw(): string {
    return this.inner;
  }

  /**
   * Return the content of the Markdown file without the frontmatter.
   */
  content(): string {
    let content = this.inner;
    const [capture] = this.frontmatterCaptures();

    if (capture === undefined || capture.length < 2) {
      return content;
    }

    const [match] = capture;

    return content.replace(match, "")
      .trimStart();
  }

  /**
   * Find all links in currently in the Markdown content.
   */
  links(): Link[] {
    return Link.findAllIn(this.content());
  }

  /**
   * Replace a link in the Markdown content with the label.
   */
  erase(link: Link): void {
    this.inner = this.inner.replaceAll(link.raw, link.label);
  }

  /**
   * Replace a link in the Markdown content with a Markdown link.
   */
  md(link: Link): void {
    const bang = link.embedded ? "!" : "";
    this.inner = this.inner.replaceAll(link.raw, `${bang}[${link.label}](${link.fullLink})`);
  }

  outline(): { level: number, heading: string }[] {
    return Array.from(this.content().matchAll(/^(#{1,6})(.+?)$/gm))
      .map(capture => {
        const [_, level, heading] = capture;

        return {
          level: level!.length,
          heading: heading!.trim(),
        };
      });
  }

  /**
   * Get the frontmatter of the Markdown file, if any.
   */
  frontmatter(): Frontmatter {
    const [capture] = this.frontmatterCaptures();

    if (capture === undefined || capture.length < 2) {
      return new Frontmatter(null);
    }

    const [_, inner] = capture;

    try {
      return new Frontmatter(yaml.parse(inner!));
    } catch (e) {
      throw new Error(`Failed to parse frontmatter: ${e}`);
    }
  }

  /**
   * Uses marked to render the Markdown content as HTML.
   */
  async renderHTML(): Promise<string> {
    return marked(this.content(), {});
  }

  private frontmatterCaptures() {
    return this.inner.matchAll(/^---$((.|\n)+?)^---$/gm)
  }
}