import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type DeleteSalesProspectInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteSalesProspect(input: DeleteSalesProspectInput): Promise<{ success: boolean; message: string }> {
  try {
    // First check if the sales prospect exists
    const existingProspect = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, input.id))
      .execute();

    if (existingProspect.length === 0) {
      return {
        success: false,
        message: `Sales prospect with ID ${input.id} not found`
      };
    }

    // Delete the sales prospect
    const result = await db.delete(salesProspectsTable)
      .where(eq(salesProspectsTable.id, input.id))
      .execute();

    return {
      success: true,
      message: `Sales prospect with ID ${input.id} has been deleted successfully`
    };
  } catch (error) {
    console.error('Sales prospect deletion failed:', error);
    throw error;
  }
}