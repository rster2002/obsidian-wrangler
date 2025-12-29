import { z } from "zod/mini";

const vaultArgs = z.object({
  vaultPath: z.string(),
  whitelist: z.optional(z.array(z.string())),
});

export type VaultArgs = z.infer<typeof vaultArgs>;

export default vaultArgs;