import { z } from "zod";

export const CreateApiKeySchema = z.object({
  keyName: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(50),
  scopes: z
    .array(
      z.enum([
        "pdf:read",
        "pdf:write",
        "ai:read",
        "ai:write",
        "mileage:read",
        "mileage:calculate",
      ]),
    )
    .min(1, "Au moins un scope est requis"),
  environment: z.enum(["production", "test"]),
  orgId: z.string().uuid("ID organisation invalide"),
  dailyQuota: z.number().positive().optional(),
  monthlyQuota: z.number().positive().optional(),
  expiresAt: z.date().optional(),
});
