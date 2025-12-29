import { IMAGE_EXTENSIONS } from "./Extensions.ts";

const mediaWikiLinkRegex = /(!?)\[\[((.+?)(#(.+?))?)(\|(.+?))?]]/g;
const markdownLinkRegex = /(!?)\[(.*)]\(((.*?)(#(.+))?)\)/g;
const either = new RegExp(`(?<wikilink>${mediaWikiLinkRegex.source})|(?<markdown>${markdownLinkRegex.source})`, "g");

/**
 * A link within a Markdown file.
 */
export default class Link {
  /**
   * The raw link string.
   */
  public readonly raw: string;

  /**
   * Whether the link is embedded in the current file.
   */
  public readonly embedded: boolean;

  /**
   * The full link target, including the hash.
   */
  public readonly fullLink: string;

  /**
   * The label of the link or the target if no label is given.
   */
  public readonly label: string;

  /**
   * The target of the link, excluding the hash.
   */
  public readonly target?: string;

  /**
   * The hash of the link, including the `#`.
   */
  public readonly hash?: string;

  /**
   * The hash of the link, excluding the `#`.
   */
  public readonly ref?: string;

  constructor(
    raw: string,
    embedded: boolean,
    fullLink: string,
    label: string,
    target?: string,
    hash?: string,
    ref?: string,
  ) {
    this.raw = raw;
    this.embedded = embedded;
    this.fullLink = fullLink;
    this.label = label;
    this.target = target;
    this.hash = hash;
    this.ref = ref;
  }

  /**
   * Whether the link is just a hash pointing within the current file.
   */
  isHash(): boolean {
    return this.target === undefined;
  }

  /**
   * Whether the link is an external link.
   */
  isExternal(): boolean {
    return this.target?.startsWith("http") ?? false;
  }

  /**
   * Whether the link is a link to a file within the vault.
   */
  isVaultLink(): boolean {
    return !this.isHash() && !this.isExternal();
  }

  /**
   * Whether the link is an image link.
   */
  isImage(): boolean {
    return IMAGE_EXTENSIONS.some(ext => this.fullLink.endsWith(ext));
  }

  static fromWikiCapture(capture: RegExpMatchArray): Link {
    const [raw, embedding, fullLink, target, hash, ref, _, label] = capture;
    const embedded = embedding === "!";

    if (target!.startsWith("#")) {
      return new Link(
        raw,
        embedded,
        fullLink!,
        label ?? target!.replace("#", ""),
        undefined,
        target,
        target!.replace("#", ""),
      );
    }

    return new Link(
      raw,
      embedded,
      fullLink!,
      label! ?? fullLink!,
      target,
      hash,
      ref,
    );
  }

  static fromMarkdownCapture(capture: RegExpMatchArray): Link {
    const [raw, embedding, label, fullLink, target, hash, ref] = capture;
    const embedded = embedding === "!";

    if (target!.startsWith("#")) {
      return new Link(
        raw,
        embedded,
        fullLink!,
        label ?? target!.replace("#", ""),
        undefined,
        target,
        target!.replace("#", ""),
      );
    }

    return new Link(
      raw,
      embedded,
      fullLink!,
      label! ?? fullLink!,
      target,
      hash,
      ref,
    );
  }

  static findAllIn(string: string): Link[] {
    const matches = Array.from(string.matchAll(either));
    const links = [];

    for (const match of matches) {
      if (match.groups?.wikilink) {
        const capture = match.groups.wikilink.matchAll(mediaWikiLinkRegex)!;
        links.push(Link.fromWikiCapture(capture.next().value!));
      }

      if (match.groups?.markdown) {
        let capture = match.groups.markdown.matchAll(markdownLinkRegex)!;
        links.push(Link.fromMarkdownCapture(capture.next().value!));
      }
    }

    return links;
  }
}