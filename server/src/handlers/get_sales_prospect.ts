import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetSalesProspectInput, type SalesProspect } from '../schema';

export const getSalesProspect = async (input: GetSalesProspectInput): Promise<SalesProspect | null> => {
  try {
    const result = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, input.id))
      .execute();

    return result[0] || null;
  } catch (error) {
    console.error('Failed to get sales prospect:', error);
    throw error;
  }
};