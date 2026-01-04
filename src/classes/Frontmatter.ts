export default class Frontmatter {
  constructor(public readonly inner: Record<string, any> | null) {}

  /**
   * Raw mutable contents of the frontmatter.
   */
  public raw(): Record<string, any> | null {
    return this.inner;
  }

  public has(key: string): boolean {
    return this.inner !== null
      && this.inner[key] !== undefined;
  }

  public string(key: string): string | null {
    if (this.inner === null) {
      return null;
    }

    if (typeof this.inner[key] === "string") {
      return this.inner[key];
    }

    return null;
  }

  public requireString(key: string): string {
    const value = this.string(key);

    if (value === null) {
      throw new Error(`${key} is not a string`);
    }

    return value;
  }

  /**
   * Raw list of tags.
   */
  public tags(): string[] {
    if (this.inner === null) {
      return [];
    }

    const tags = this.inner["tags"];

    if (Array.isArray(this.inner)) {
      return tags.map((tag: unknown) => String(tag));
    }

    if (typeof tags === "string") {
      return tags.split(",")
        .map(tag => tag.trim());
    }

    return [];
  }

  /**
   * Whether the given tag is part of the frontmatter tag list.
   * @param tag
   */
  public hasTag(tag: string): boolean {
    return this.tags().includes(tag);
  }

  /**
   * Whether the given key exists and has a boolean value or a string that represents true or false.
   * @param key
   */
  public stringBool(key: string): boolean {
    if (this.inner === null) {
      return false;
    }

    const value = this.inner[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      return value === "true"
        || value === "1"
        || value === "yes"
        || value === "on"
        || value === "y"
        || value === "enabled";
    }

    return false;
  }
}