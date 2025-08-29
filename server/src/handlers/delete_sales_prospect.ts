import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteSalesProspectInput } from '../schema';

export const deleteSalesProspect = async (input: DeleteSalesProspectInput): Promise<{ success: boolean; id?: number; message: string }> => {
  try {
    const result = await db.delete(salesProspectsTable)
      .where(eq(salesProspectsTable.id, input.id))
      .returning({ id: salesProspectsTable.id })
      .execute();

    if (result.length === 0) {
      return { 
        success: false, 
        message: `Sales prospect with ID ${input.id} not found` 
      };
    }

    return { 
      success: true, 
      id: result[0].id, 
      message: `Sales prospect with ID ${result[0].id} has been deleted successfully` 
    };
  } catch (error) {
    console.error('Sales prospect deletion failed:', error);
    return { 
      success: false, 
      message: `Failed to delete sales prospect: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};