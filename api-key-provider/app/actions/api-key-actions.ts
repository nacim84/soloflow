"use server";

/**
 * Server Actions for API Key management
 * Refactored for hash-based storage with SHA-256 + Pepper
 * Multi-organisation support with scopes-based permissions
 */

import { db } from "@/drizzle/db";
import {
  apiKeys,
  services,
  apiUsageLogs,
  wallets,
  organisationMembers,
  testWallets,
} from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  generateApiKey,
  hashApiKey,
  extractKeyHint,
  maskApiKey,
} from "@/lib/crypto/api-keys";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CreateApiKeySchema } from "@/lib/validations/api-keys";
import type { ActionResponse } from "@/lib/types/actions";
import { getCurrentUser } from "@/lib/utils/auth";

/**
 * Create a new API key with hash-based storage
 */
export async function createApiKeyAction(
  data: z.infer<typeof CreateApiKeySchema>,
): Promise<
  ActionResponse<{
    keyId: string;
    apiKey: string; // ⚠️ RETURNED ONLY ONCE
    maskedKey: string;
  }>
> {
  try {
    const user = await getCurrentUser();

    // Validation avec Zod
    const validated = CreateApiKeySchema.parse(data);

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, validated.orgId),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (!membership) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette organisation",
      };
    }

    // Vérifier les permissions (seuls owner, admin, developer peuvent créer des clés)
    if (!["owner", "admin", "developer"].includes(membership.role)) {
      return {
        success: false,
        error: "Permissions insuffisantes pour créer une clé API",
      };
    }

    // 1. Générer la clé en clair (UNE SEULE FOIS)
    const apiKey = generateApiKey(validated.environment);

    // 2. Hasher pour stockage
    const keyHash = hashApiKey(apiKey);
    const keyHint = extractKeyHint(apiKey);
    const keyPrefix =
      validated.environment === "production" ? "sk_live" : "sk_test";

    // 3. Insérer en DB
    const [newKey] = await db
      .insert(apiKeys)
      .values({
        id: crypto.randomUUID(),
        orgId: validated.orgId,
        createdBy: user.id,
        keyName: validated.keyName,
        keyHash,
        keyPrefix,
        keyHint,
        scopes: validated.scopes,
        environment: validated.environment,
        dailyQuota: validated.dailyQuota,
        monthlyQuota: validated.monthlyQuota,
        expiresAt: validated.expiresAt,
      })
      .returning({ id: apiKeys.id });

    revalidatePath("/keys");

    // 4. Retourner la clé en clair (DERNIÈRE FOIS qu'elle sera visible)
    return {
      success: true,
      data: {
        keyId: newKey.id,
        apiKey, // ⚠️ À copier immédiatement par l'utilisateur
        maskedKey: maskApiKey(apiKey),
      },
    };
  } catch (error) {
    console.error("Error creating API key:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: "Erreur lors de la création de la clé API",
    };
  }
}

/**
 * API Key type returned by getOrgApiKeys
 */
export type ApiKeyData = {
  id: string;
  keyName: string;
  keyPrefix: string;
  keyHint: string | null;
  scopes: string[];
  environment: string;
  isActive: boolean;
  dailyQuota: number | null;
  monthlyQuota: number | null;
  dailyUsed: number | null;
  monthlyUsed: number | null;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  createdByName: string | null;
};

/**
 * Get all API keys for an organisation
 */
export async function getOrgApiKeys(orgId: string): Promise<ActionResponse<ApiKeyData[]>> {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur appartient à l'organisation
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, orgId),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (!membership) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette organisation",
      };
    }

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.orgId, orgId),
      with: {
        creator: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: [desc(apiKeys.createdAt)],
    });

    const formattedKeys = keys.map((key) => ({
      id: key.id,
      keyName: key.keyName,
      keyPrefix: key.keyPrefix,
      keyHint: key.keyHint,
      scopes: key.scopes as string[],
      environment: key.environment,
      isActive: key.isActive,
      dailyQuota: key.dailyQuota,
      monthlyQuota: key.monthlyQuota,
      dailyUsed: key.dailyUsed,
      monthlyUsed: key.monthlyUsed,
      lastUsedAt: key.lastUsedAt,
      lastUsedIp: key.lastUsedIp,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      createdByName: key.creator?.name || null,
    }));

    return {
      success: true,
      data: formattedKeys,
    };
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des clés API",
    };
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKeyAction(
  keyId: string,
  reason?: string,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Récupérer la clé avec l'organisation
    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, keyId),
    });

    if (!key) {
      return {
        success: false,
        error: "Clé API non trouvée",
      };
    }

    // Vérifier que l'utilisateur a les permissions
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, key.orgId!),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (
      !membership ||
      !["owner", "admin", "developer"].includes(membership.role)
    ) {
      return {
        success: false,
        error: "Permissions insuffisantes",
      };
    }

    // Révoquer la clé
    await db
      .update(apiKeys)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(apiKeys.id, keyId));

    revalidatePath("/keys");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error revoking API key:", error);
    return {
      success: false,
      error: "Erreur lors de la révocation de la clé API",
    };
  }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKeyAction(
  keyId: string,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Récupérer la clé avec l'organisation
    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, keyId),
    });

    if (!key) {
      return {
        success: false,
        error: "Clé API non trouvée",
      };
    }

    // Vérifier que l'utilisateur a les permissions (seul owner/admin peuvent supprimer)
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, key.orgId!),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return {
        success: false,
        error:
          "Seuls les propriétaires et administrateurs peuvent supprimer des clés",
      };
    }

    // Supprimer (cascade will delete usage logs)
    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    revalidatePath("/keys");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting API key:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la clé API",
    };
  }
}

/**
 * Get all real services (PDF, AI, Mileage)
 */
export async function getServicesAction(): Promise<
  ActionResponse<
    Array<{
      id: string;
      name: string;
      displayName: string;
      icon: string | null;
      category: string;
      description: string | null;
      baseCostPerCall: number;
    }>
  >
> {
  try {
    const servicesList = await db.query.services.findMany({
      where: eq(services.isActive, true),
      orderBy: [services.displayName],
    });

    return {
      success: true,
      data: servicesList,
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des services",
    };
  }
}

/**
 * Get usage logs for an organisation
 */
export async function getOrgUsageLogsAction(
  orgId: string,
  limit: number = 50,
): Promise<
  ActionResponse<
    Array<{
      id: string;
      keyName: string;
      serviceName: string;
      endpoint: string | null;
      method: string | null;
      statusCode: number | null;
      creditsUsed: number;
      timestamp: Date;
      ipAddress: string | null;
      country: string | null;
    }>
  >
> {
  try {
    const user = await getCurrentUser();

    // Vérifier l'accès à l'organisation
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, orgId),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (!membership) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette organisation",
      };
    }

    const logs = await db.query.apiUsageLogs.findMany({
      where: eq(apiUsageLogs.orgId, orgId),
      with: {
        apiKey: {
          columns: {
            keyName: true,
          },
        },
        service: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: [desc(apiUsageLogs.timestamp)],
      limit,
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      keyName: log.apiKey.keyName,
      serviceName: log.service.name,
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      creditsUsed: log.creditsUsed,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      country: log.country,
    }));

    return {
      success: true,
      data: formattedLogs,
    };
  } catch (error) {
    console.error("Error fetching usage logs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'historique",
    };
  }
}

/**
 * Get wallet balance for an organisation
 */
export async function getOrgWalletAction(orgId: string): Promise<
  ActionResponse<{
    balance: number;
    totalPurchased: number;
    totalUsed: number;
    currency: string;
  }>
> {
  try {
    const user = await getCurrentUser();

    // Vérifier l'accès à l'organisation
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, orgId),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (!membership) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette organisation",
      };
    }

    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.orgId, orgId),
    });

    // Créer le wallet s'il n'existe pas
    if (!wallet) {
      [wallet] = await db
        .insert(wallets)
        .values({
          id: crypto.randomUUID(),
          orgId,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
          currency: "EUR",
        })
        .returning();
    }

    return {
      success: true,
      data: {
        balance: wallet.balance,
        totalPurchased: wallet.totalPurchased,
        totalUsed: wallet.totalUsed,
        currency: wallet.currency,
      },
    };
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du wallet",
    };
  }
}

/**
 * Update API key scopes and limits
 */
export async function updateApiKeyAction(
  keyId: string,
  data: {
    keyName?: string;
    scopes?: string[];
    dailyQuota?: number | null;
    monthlyQuota?: number | null;
  },
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Récupérer la clé avec l'organisation
    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, keyId),
    });

    if (!key) {
      return {
        success: false,
        error: "Clé API non trouvée",
      };
    }

    // Vérifier les permissions
    const membership = await db.query.organisationMembers.findFirst({
      where: and(
        eq(organisationMembers.orgId, key.orgId!),
        eq(organisationMembers.userId, user.id),
      ),
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return {
        success: false,
        error:
          "Seuls les propriétaires et administrateurs peuvent modifier les clés",
      };
    }

    // Mettre à jour
    await db
      .update(apiKeys)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, keyId));

    revalidatePath("/keys");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating API key:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la clé API",
    };
  }
}

/**
 * Get test wallet balance for current user
 */
export async function getUserTestWallet(): Promise<
  ActionResponse<{
    balance: number;
    resetAt: Date | null;
  }>
> {
  try {
    const user = await getCurrentUser();

    const testWallet = await db.query.testWallets.findFirst({
      where: eq(testWallets.userId, user.id),
    });

    if (!testWallet) {
      return {
        success: true,
        data: {
          balance: 100, // Default balance if not exists
          resetAt: null,
        },
      };
    }

    return {
      success: true,
      data: {
        balance: testWallet.balance,
        resetAt: testWallet.resetAt,
      },
    };
  } catch (error) {
    console.error("Error fetching test wallet:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du wallet test",
    };
  }
}

/**
 * Get total credits (test wallet + organization wallet) for current user
 */
export async function getUserTotalCredits(): Promise<
  ActionResponse<{
    totalBalance: number;
    testBalance: number;
    orgBalance: number;
    resetAt: Date | null;
  }>
> {
  try {
    const user = await getCurrentUser();

    // 1. Get test wallet (free credits)
    const testWallet = await db.query.testWallets.findFirst({
      where: eq(testWallets.userId, user.id),
    });
    const testBalance = testWallet?.balance ?? 100;
    const resetAt = testWallet?.resetAt ?? null;

    // 2. Get organization wallet (purchased credits)
    const orgMembership = await db.query.organisationMembers.findFirst({
      where: eq(organisationMembers.userId, user.id),
      with: {
        organisation: {
          with: {
            wallet: true,
          },
        },
      },
    });

    const orgBalance = orgMembership?.organisation?.wallet?.balance ?? 0;

    // 3. Return combined total
    return {
      success: true,
      data: {
        totalBalance: testBalance + orgBalance,
        testBalance,
        orgBalance,
        resetAt,
      },
    };
  } catch (error) {
    console.error("Error fetching total credits:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des crédits",
    };
  }
}
