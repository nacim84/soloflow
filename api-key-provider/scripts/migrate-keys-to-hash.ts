import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { apiKeys } from "../drizzle/schema";
import { decryptApiKey } from "../lib/crypto/encryption"; // Ancienne fonction
import { hashApiKey, extractKeyHint } from "../lib/crypto/api-keys";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: ".env.local" });

interface OldApiKey {
  id: string;
  keyName: string;
  encryptedKey: string;
  userId: string;
  serviceId: string;
  accessLevel: string;
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

async function migrate() {
  console.log(
    "🔄 Starting key migration from AES encryption to SHA-256 hash...\n",
  );

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) {
    throw new Error(
      "API_KEY_PEPPER not set. Generate with: openssl rand -base64 32",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  let successCount = 0;
  let errorCount = 0;

  try {
    // Fetch old keys (they still have encryptedKey column before migration)
    const oldKeys = (await db
      .select()
      .from(apiKeys)
      .execute()) as unknown as OldApiKey[];

    console.log(`Found ${oldKeys.length} keys to migrate\n`);

    if (oldKeys.length === 0) {
      console.log("No keys to migrate.");
      return;
    }

    for (const key of oldKeys) {
      try {
        // 1. Déchiffrer l'ancienne clé
        const plainKey = decryptApiKey(key.encryptedKey);

        // 2. Hasher avec SHA-256 + Pepper
        const keyHash = hashApiKey(plainKey);

        // 3. Extraire hint (4 derniers caractères)
        const keyHint = extractKeyHint(plainKey);

        // 4. Déterminer prefix
        let keyPrefix = "sk_live";
        if (plainKey.startsWith("sk_test")) {
          keyPrefix = "sk_test";
        } else if (plainKey.startsWith("sk_live")) {
          keyPrefix = "sk_live";
        } else if (plainKey.startsWith("sk_")) {
          keyPrefix = "sk_live"; // Par défaut si format custom
        }

        // 5. Déterminer environment
        const environment = keyPrefix === "sk_test" ? "test" : "production";

        // 6. Mapper accessLevel vers scopes
        let scopes: string[] = [];
        if (key.accessLevel === "admin" || key.accessLevel === "write") {
          scopes = [
            "pdf:read",
            "pdf:write",
            "ai:read",
            "ai:write",
            "mileage:calculate",
          ];
        } else {
          scopes = ["pdf:read", "ai:read", "mileage:calculate"];
        }

        // 7. Update avec les nouvelles colonnes
        await db
          .update(apiKeys)
          .set({
            keyHash,
            keyHint,
            keyPrefix,
            scopes,
            environment,
            // createdBy reste null pour les anciennes clés
            // orgId reste null pour les anciennes clés (à assigner manuellement)
          })
          .where(eq(apiKeys.id, key.id));

        console.log(`✓ Migrated key: ${key.keyName} (${keyPrefix})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to migrate key: ${key.keyName}`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log("\n⚠️  Some keys failed to migrate. Check errors above.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute only if run directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log("\n✅ Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrate };
