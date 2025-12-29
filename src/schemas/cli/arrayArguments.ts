import { z } from "zod/mini";

const arrayArguments = z.pipe(
  z.optional(z.union([z.string(), z.array(z.string())])),
  z.pipe(
    z.transform((value: string | undefined) => {
      if (value === undefined) {
        return undefined;
      }

      if (Array.isArray(value)) {
        return value;
      }

      return [value];
    }),
    z.optional(z.array(z.string())),
  ),
);

export type ArrayArguments = z.infer<typeof arrayArguments>;

export default arrayArguments;