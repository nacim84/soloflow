"use server";

/**
 * Server Actions for Organisation management
 */

import { db } from "@/drizzle/db";
import {
  organisations,
  organisationMembers,
  wallets,
  testWallets,
} from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/utils/auth";
import type { ActionResponse } from "@/lib/types/actions";
import { eq } from "drizzle-orm";

/**
 * Créer l'organisation par défaut pour un nouvel utilisateur
 * Appelé automatiquement après l'inscription
 */
export async function createDefaultOrganisation(): Promise<ActionResponse<{ orgId: string }>> {
  try {
    const user = await getCurrentUser();
    const userId = user.id;
    const userEmail = user.email;
    const userName = user.name || userEmail.split("@")[0];

    // Vérifier si l'utilisateur a déjà une organisation
    const existingMembership = await db.query.organisationMembers.findFirst({
      where: eq(organisationMembers.userId, userId),
    });

    if (existingMembership) {
      return {
        success: true,
        data: { orgId: existingMembership.orgId },
      };
    }

    // 1. Créer l'organisation personnelle
    const orgName = `${userName}'s Workspace`;
    const orgSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const [org] = await db
      .insert(organisations)
      .values({
        id: crypto.randomUUID(),
        name: orgName,
        slug: orgSlug,
        ownerId: userId,
      })
      .returning();

    console.log(
      `✅ Organisation créée automatiquement : ${org.name} pour ${userEmail}`,
    );

    // 2. Ajouter l'utilisateur comme owner
    await db.insert(organisationMembers).values({
      id: crypto.randomUUID(),
      orgId: org.id,
      userId: userId,
      role: "owner",
    });

    // 3. Créer le wallet production (0 crédits)
    await db.insert(wallets).values({
      id: crypto.randomUUID(),
      orgId: org.id,
      balance: 0,
      totalPurchased: 0,
      totalUsed: 0,
      currency: "EUR",
    });

    // 4. Créer le test wallet (100 crédits)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);

    await db.insert(testWallets).values({
      id: crypto.randomUUID(),
      userId: userId,
      balance: 100,
      resetAt: resetDate,
    });

    console.log(`✅ Wallets créés pour ${userEmail}`);

    return {
      success: true,
      data: { orgId: org.id },
    };
  } catch (error) {
    console.error("❌ Erreur création organisation par défaut:", error);
    return {
      success: false,
      error: "Erreur lors de la création de l'organisation",
    };
  }
}
