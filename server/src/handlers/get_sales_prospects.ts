import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type SalesProspect } from '../schema';

export const getSalesProspects = async (): Promise<SalesProspect[]> => {
  try {
    // Query all sales prospects from the database
    const results = await db.select()
      .from(salesProspectsTable)
      .execute();

    // Return results as-is since all fields are already the correct types
    // (no numeric conversions needed for this schema)
    return results;
  } catch (error) {
    console.error('Failed to fetch sales prospects:', error);
    throw error;
  }
};