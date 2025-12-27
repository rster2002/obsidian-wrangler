import { z } from "zod/mini";

const commandArguments = z.object({
  vaultPath: z.optional(z.string()),
});

export type CommandArguments = z.infer<typeof commandArguments>;

export default commandArguments;
