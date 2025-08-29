import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type DeleteSalesProspectInput, type CreateSalesProspectInput } from '../schema';
import { deleteSalesProspect } from '../handlers/delete_sales_prospect';
import { eq } from 'drizzle-orm';

// Test input for creating a sales prospect to delete
const testCreateInput: CreateSalesProspectInput = {
  follow_up: 'In Progress',
  tanggal_fu_terakhir: new Date('2024-01-15'),
  date_last_respond: new Date('2024-01-10'),
  potensi: 'High',
  online_meeting: true,
  survey_lokasi: false,
  status_closing: 'Pending',
  notes: 'Test prospect for deletion',
  blast_mingguan: true
};

describe('deleteSalesProspect', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing sales prospect', async () => {
    // Create a sales prospect first
    const createResult = await db.insert(salesProspectsTable)
      .values({
        follow_up: testCreateInput.follow_up,
        tanggal_fu_terakhir: testCreateInput.tanggal_fu_terakhir,
        date_last_respond: testCreateInput.date_last_respond,
        potensi: testCreateInput.potensi,
        online_meeting: testCreateInput.online_meeting,
        survey_lokasi: testCreateInput.survey_lokasi,
        status_closing: testCreateInput.status_closing,
        notes: testCreateInput.notes,
        blast_mingguan: testCreateInput.blast_mingguan
      })
      .returning()
      .execute();

    const createdProspect = createResult[0];
    
    const deleteInput: DeleteSalesProspectInput = {
      id: createdProspect.id
    };

    // Delete the sales prospect
    const result = await deleteSalesProspect(deleteInput);

    // Verify successful deletion response
    expect(result.success).toBe(true);
    expect(result.message).toEqual(`Sales prospect with ID ${createdProspect.id} has been deleted successfully`);
  });

  it('should verify sales prospect is removed from database', async () => {
    // Create a sales prospect first
    const createResult = await db.insert(salesProspectsTable)
      .values({
        follow_up: testCreateInput.follow_up,
        tanggal_fu_terakhir: testCreateInput.tanggal_fu_terakhir,
        date_last_respond: testCreateInput.date_last_respond,
        potensi: testCreateInput.potensi,
        online_meeting: testCreateInput.online_meeting,
        survey_lokasi: testCreateInput.survey_lokasi,
        status_closing: testCreateInput.status_closing,
        notes: testCreateInput.notes,
        blast_mingguan: testCreateInput.blast_mingguan
      })
      .returning()
      .execute();

    const createdProspect = createResult[0];
    
    const deleteInput: DeleteSalesProspectInput = {
      id: createdProspect.id
    };

    // Delete the sales prospect
    await deleteSalesProspect(deleteInput);

    // Verify the record is no longer in the database
    const prospects = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, createdProspect.id))
      .execute();

    expect(prospects).toHaveLength(0);
  });

  it('should return failure when trying to delete non-existent sales prospect', async () => {
    const deleteInput: DeleteSalesProspectInput = {
      id: 99999 // Non-existent ID
    };

    const result = await deleteSalesProspect(deleteInput);

    // Verify failure response
    expect(result.success).toBe(false);
    expect(result.message).toEqual('Sales prospect with ID 99999 not found');
  });

  it('should not affect other sales prospects when deleting one', async () => {
    // Create multiple sales prospects
    const createResult1 = await db.insert(salesProspectsTable)
      .values({
        follow_up: 'Active',
        tanggal_fu_terakhir: new Date('2024-01-15'),
        date_last_respond: new Date('2024-01-10'),
        potensi: 'High',
        online_meeting: true,
        survey_lokasi: false,
        status_closing: 'Pending',
        notes: 'First prospect',
        blast_mingguan: true
      })
      .returning()
      .execute();

    const createResult2 = await db.insert(salesProspectsTable)
      .values({
        follow_up: 'Follow-up',
        tanggal_fu_terakhir: new Date('2024-01-20'),
        date_last_respond: new Date('2024-01-18'),
        potensi: 'Medium',
        online_meeting: false,
        survey_lokasi: true,
        status_closing: 'In Progress',
        notes: 'Second prospect',
        blast_mingguan: false
      })
      .returning()
      .execute();

    const prospect1 = createResult1[0];
    const prospect2 = createResult2[0];

    // Delete the first prospect
    const deleteInput: DeleteSalesProspectInput = {
      id: prospect1.id
    };

    await deleteSalesProspect(deleteInput);

    // Verify first prospect is deleted
    const deletedProspects = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, prospect1.id))
      .execute();

    expect(deletedProspects).toHaveLength(0);

    // Verify second prospect still exists
    const remainingProspects = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, prospect2.id))
      .execute();

    expect(remainingProspects).toHaveLength(1);
    expect(remainingProspects[0].id).toEqual(prospect2.id);
    expect(remainingProspects[0].follow_up).toEqual('Follow-up');
    expect(remainingProspects[0].notes).toEqual('Second prospect');
  });

  it('should handle deletion with null date fields correctly', async () => {
    // Create a sales prospect with null date fields
    const createResult = await db.insert(salesProspectsTable)
      .values({
        follow_up: 'New Lead',
        tanggal_fu_terakhir: null,
        date_last_respond: null,
        potensi: 'Low',
        online_meeting: false,
        survey_lokasi: false,
        status_closing: 'Initial',
        notes: null,
        blast_mingguan: false
      })
      .returning()
      .execute();

    const createdProspect = createResult[0];
    
    const deleteInput: DeleteSalesProspectInput = {
      id: createdProspect.id
    };

    // Delete the sales prospect
    const result = await deleteSalesProspect(deleteInput);

    // Verify successful deletion
    expect(result.success).toBe(true);
    expect(result.message).toEqual(`Sales prospect with ID ${createdProspect.id} has been deleted successfully`);

    // Verify the record is removed from database
    const prospects = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, createdProspect.id))
      .execute();

    expect(prospects).toHaveLength(0);
  });
});