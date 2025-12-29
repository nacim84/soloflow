import { db } from "../drizzle/db";
import { users, organisations, organisationMembers, apiKeys, wallets, testWallets } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "../lib/crypto/api-keys";
import crypto from "crypto";
import dotenv from "dotenv";

// Load .env.local to get DATABASE_URL and API_KEY_PEPPER
dotenv.config({ path: ".env.local" });

// Override DATABASE_URL for localhost access if running outside docker
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("database:5432")) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace("database:5432", "localhost:5434");
}

// Force Pepper if not loaded (fallback)
if (!process.env.API_KEY_PEPPER) {
    process.env.API_KEY_PEPPER = "dev-pepper-change-in-production";
}

async function main() {
    console.log("🚀 Setting up test data for E2E Logging...");

    const email = "test@test.com";
    const orgSlug = "test-org-logging";
    
    // 1. Create User
    let user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.log("Creating user...");
        [user] = await db.insert(users).values({
            id: crypto.randomUUID(),
            name: "Test User",
            email: email,
            emailVerified: true
        }).returning();
    }
    console.log(`User ID: ${user.id}`);

    // 2. Create Org
    let org = await db.query.organisations.findFirst({
        where: eq(organisations.slug, orgSlug)
    });

    if (!org) {
        console.log("Creating org...");
        [org] = await db.insert(organisations).values({
            id: crypto.randomUUID(),
            name: "Test Org Logging",
            slug: orgSlug,
            ownerId: user.id
        }).returning();

        // Add member
        await db.insert(organisationMembers).values({
            id: crypto.randomUUID(),
            orgId: org.id,
            userId: user.id,
            role: "owner"
        });

        // Add wallet
        await db.insert(wallets).values({
            id: crypto.randomUUID(),
            orgId: org.id,
            balance: 1000,
            totalPurchased: 1000,
            currency: "EUR"
        });
    }
    console.log(`Org ID: ${org.id}`);

    // 2.5 Ensure Test Wallet exists
    let testWallet = await db.query.testWallets.findFirst({
        where: eq(testWallets.userId, user.id)
    });

    if (!testWallet) {
        console.log("Creating test wallet...");
        await db.insert(testWallets).values({
            id: crypto.randomUUID(),
            userId: user.id,
            balance: 100, // 100 free test credits
            resetAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
        });
    } else {
        // Reset balance if low
        if (testWallet.balance < 10) {
             await db.update(testWallets).set({ balance: 100 }).where(eq(testWallets.id, testWallet.id));
             console.log("Refilled test wallet");
        }
    }

    // 3. Create API Key
    const keyPrefix = "sk_test";
    const keyRandom = crypto.randomBytes(16).toString("hex");
    const plainApiKey = `${keyPrefix}_${keyRandom}`;
    const keyHash = hashApiKey(plainApiKey);
    const keyName = "E2E Logging Test Key";

    // Delete existing keys with this name to avoid clutter
    // await db.delete(apiKeys).where(eq(apiKeys.keyName, keyName));

    const [apiKey] = await db.insert(apiKeys).values({
        id: crypto.randomUUID(),
        orgId: org.id,
        createdBy: user.id,
        keyName: keyName,
        keyHash: keyHash,
        keyPrefix: keyPrefix,
        keyHint: keyRandom.slice(-4),
        scopes: ["full"],
        environment: "test",
        isActive: true
    }).returning();

    console.log(`API Key ID: ${apiKey.id}`);
    console.log("\n✅ Test Data Ready!");
    console.log("\n👇 Run this command to test logging:");
    console.log(`curl -v -H "Authorization: Bearer ${plainApiKey}" http://localhost:8080/api/v1/template/hello`);
}

main().catch(console.error).then(() => process.exit(0));
