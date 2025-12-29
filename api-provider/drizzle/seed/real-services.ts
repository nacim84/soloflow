import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { services } from "../schema";
import dotenv from "dotenv";

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: ".env.local" });

const realServices = [
  {
    name: "api-pdf",
    displayName: "PDF Manipulation",
    icon: "FileText",
    category: "document",
    description:
      "Fusionner, diviser, compresser et convertir des documents PDF",
    baseCostPerCall: 1,
    isActive: true,
  },
  {
    name: "api-docling",
    displayName: "Document Intelligence AI",
    icon: "Brain",
    category: "ai",
    description:
      "Extraction de données et analyse intelligente de documents (OCR, NLP)",
    baseCostPerCall: 3,
    isActive: true,
  },
  {
    name: "api-template",
    displayName: "Mileage Expenses Generator",
    icon: "Car",
    category: "finance",
    description: "Génération automatique de relevés de frais kilométriques",
    baseCostPerCall: 1,
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding real services...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    for (const service of realServices) {
      await db
        .insert(services)
        .values({
          id: crypto.randomUUID(),
          ...service,
        })
        .onConflictDoNothing();
      console.log(`  ✓ ${service.displayName}`);
    }

    console.log(`\n✅ Successfully seeded ${realServices.length} services!`);
  } catch (error) {
    console.error("❌ Error seeding services:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seed };
