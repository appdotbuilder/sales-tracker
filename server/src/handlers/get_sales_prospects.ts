import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type SalesProspect } from '../schema';

export const getSalesProspects = async (): Promise<SalesProspect[]> => {
  try {
    const result = await db.select()
      .from(salesProspectsTable)
      .orderBy(salesProspectsTable.id)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to get sales prospects:', error);
    throw error;
  }
};