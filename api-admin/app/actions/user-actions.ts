'use server';

import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';

export async function getUsers() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return { success: true, data: allUsers };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}
