import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Vérifier la connexion DB
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 500 }
    );
  }
}
