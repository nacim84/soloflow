import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/drizzle/schema';

// Use environment variable for connection string
const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });
