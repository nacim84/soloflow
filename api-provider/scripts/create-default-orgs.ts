import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import * as schema from "@/drizzle/schema";

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: ".env.local" });

interface User {
  id: string;
  email: string;
}

async function createDefaultOrgs() {
  console.log("🏢 Creating default organizations for existing users...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    // Récupérer tous les utilisateurs existants
    const users = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
      })
      .from(schema.users);

    console.log(`Found ${users.length} users to create organizations for\n`);

    for (const user of users) {
      try {
        // Créer une organisation avec le nom de l'utilisateur
        const orgName = `${user.email.split("@")[0]}'s Organization`;
        const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-");

        // Vérifier si une organisation existe déjà pour cet utilisateur
        const existingOrg = await db
          .select({
            id: schema.organisations.id,
          })
          .from(schema.organisations)
          .where(eq(schema.organisations.ownerId, user.id))
          .limit(1);

        if (existingOrg.length > 0) {
          console.log(`  ✓ Organization already exists for ${user.email}`);
          continue;
        }

        // Créer l'organisation
        const [org] = await db
          .insert(schema.organisations)
          .values({
            id: crypto.randomUUID(),
            name: orgName,
            slug: orgSlug,
            ownerId: user.id,
          })
          .returning();

        console.log(`  ✓ Created organization: ${org.name} (${org.id})`);

        // Ajouter l'utilisateur comme membre avec le rôle owner
        await db.insert(schema.organisationMembers).values({
          id: crypto.randomUUID(),
          orgId: org.id,
          userId: user.id,
          role: "owner",
        });

        // Créer un wallet pour l'organisation
        await db.insert(schema.wallets).values({
          id: crypto.randomUUID(),
          orgId: org.id,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
          currency: "EUR",
        });

        // Créer un wallet test pour l'utilisateur
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1); // Reset dans 1 mois

        await db.insert(schema.testWallets).values({
          id: crypto.randomUUID(),
          userId: user.id,
          balance: 100, // 100 crédits test
          resetAt: resetDate,
        });

        console.log(
          `  ✓ Created wallet for organization and test wallet for user`,
        );
      } catch (error) {
        console.error(
          `✗ Failed to create organization for ${user.email}:`,
          error,
        );
      }
    }

    console.log(`\n✅ Default organizations creation complete!`);
  } catch (error) {
    console.error("❌ Error creating default organizations:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter seulement si lancé directement
if (require.main === module) {
  createDefaultOrgs()
    .then(() => {
      console.log("\n✅ Default organizations script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Default organizations script failed:", error);
      process.exit(1);
    });
}

export { createDefaultOrgs };
