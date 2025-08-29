import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type GetSalesProspectInput, type SalesProspect } from '../schema';
import { eq } from 'drizzle-orm';

export const getSalesProspect = async (input: GetSalesProspectInput): Promise<SalesProspect | null> => {
  try {
    // Query the sales prospect by ID
    const results = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, input.id))
      .execute();

    // Return the first result or null if not found
    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get sales prospect:', error);
    throw error;
  }
};