
import { db } from "../drizzle/db";
import { apiUsageLogs } from "../drizzle/schema";
import { desc } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("database:5432")) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace("database:5432", "localhost:5434");
}

async function main() {
    console.log("🔍 Checking API Usage Logs...");

    const logs = await db.query.apiUsageLogs.findMany({
        orderBy: [desc(apiUsageLogs.timestamp)],
        limit: 5,
        with: {
            apiKey: true,
            service: true
        }
    });

    if (logs.length === 0) {
        console.log("❌ No logs found!");
    } else {
        console.log(`✅ Found ${logs.length} logs.`);
        logs.forEach(log => {
            console.log(`[${log.timestamp}] ${log.method} ${log.endpoint} (${log.statusCode}) - Service: ${log.service.name} - Key: ${log.apiKey.keyName}`);
        });
    }
}

main().catch(console.error).then(() => process.exit(0));
