import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type GetSalesProspectInput, type CreateSalesProspectInput } from '../schema';
import { getSalesProspect } from '../handlers/get_sales_prospect';
import { eq } from 'drizzle-orm';

// Test input for creating a sales prospect
const testSalesProspectInput: CreateSalesProspectInput = {
  follow_up: 'In Progress',
  tanggal_fu_terakhir: new Date('2024-01-15'),
  date_last_respond: new Date('2024-01-10'),
  potensi: 'High',
  online_meeting: true,
  survey_lokasi: false,
  status_closing: 'Negotiation',
  notes: 'Interested in premium package',
  blast_mingguan: true
};

describe('getSalesProspect', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a sales prospect when it exists', async () => {
    // First, create a sales prospect
    const insertResult = await db.insert(salesProspectsTable)
      .values(testSalesProspectInput)
      .returning()
      .execute();

    const createdProspect = insertResult[0];

    // Test input to get the created prospect
    const getInput: GetSalesProspectInput = {
      id: createdProspect.id
    };

    // Get the sales prospect
    const result = await getSalesProspect(getInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProspect.id);
    expect(result!.follow_up).toEqual('In Progress');
    expect(result!.potensi).toEqual('High');
    expect(result!.online_meeting).toEqual(true);
    expect(result!.survey_lokasi).toEqual(false);
    expect(result!.status_closing).toEqual('Negotiation');
    expect(result!.notes).toEqual('Interested in premium package');
    expect(result!.blast_mingguan).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when sales prospect does not exist', async () => {
    // Test input for a non-existent ID
    const getInput: GetSalesProspectInput = {
      id: 99999
    };

    // Try to get a non-existent sales prospect
    const result = await getSalesProspect(getInput);

    // Should return null
    expect(result).toBeNull();
  });

  it('should handle date fields correctly', async () => {
    // Create a sales prospect with specific dates
    const dateInput: CreateSalesProspectInput = {
      follow_up: 'Scheduled',
      tanggal_fu_terakhir: new Date('2024-02-01T10:30:00Z'),
      date_last_respond: new Date('2024-01-25T14:15:00Z'),
      potensi: 'Medium',
      online_meeting: false,
      survey_lokasi: true,
      status_closing: 'Proposal Sent',
      notes: null,
      blast_mingguan: false
    };

    const insertResult = await db.insert(salesProspectsTable)
      .values(dateInput)
      .returning()
      .execute();

    const createdProspect = insertResult[0];

    // Get the sales prospect
    const getInput: GetSalesProspectInput = {
      id: createdProspect.id
    };

    const result = await getSalesProspect(getInput);

    // Verify date handling
    expect(result).not.toBeNull();
    expect(result!.tanggal_fu_terakhir).toBeInstanceOf(Date);
    expect(result!.date_last_respond).toBeInstanceOf(Date);
    expect(result!.tanggal_fu_terakhir?.getTime()).toEqual(new Date('2024-02-01T10:30:00Z').getTime());
    expect(result!.date_last_respond?.getTime()).toEqual(new Date('2024-01-25T14:15:00Z').getTime());
  });

  it('should handle null values correctly', async () => {
    // Create a sales prospect with null optional fields
    const nullableInput: CreateSalesProspectInput = {
      follow_up: 'New Lead',
      tanggal_fu_terakhir: null,
      date_last_respond: null,
      potensi: 'Low',
      online_meeting: false,
      survey_lokasi: false,
      status_closing: 'Initial Contact',
      notes: null,
      blast_mingguan: false
    };

    const insertResult = await db.insert(salesProspectsTable)
      .values(nullableInput)
      .returning()
      .execute();

    const createdProspect = insertResult[0];

    // Get the sales prospect
    const getInput: GetSalesProspectInput = {
      id: createdProspect.id
    };

    const result = await getSalesProspect(getInput);

    // Verify null handling
    expect(result).not.toBeNull();
    expect(result!.tanggal_fu_terakhir).toBeNull();
    expect(result!.date_last_respond).toBeNull();
    expect(result!.notes).toBeNull();
    expect(result!.follow_up).toEqual('New Lead');
    expect(result!.potensi).toEqual('Low');
    expect(result!.status_closing).toEqual('Initial Contact');
  });

  it('should verify database persistence', async () => {
    // Create a sales prospect
    const insertResult = await db.insert(salesProspectsTable)
      .values(testSalesProspectInput)
      .returning()
      .execute();

    const createdProspect = insertResult[0];

    // Verify it exists in database directly
    const directQuery = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, createdProspect.id))
      .execute();

    expect(directQuery).toHaveLength(1);
    expect(directQuery[0].follow_up).toEqual('In Progress');

    // Now use the handler to get the same prospect
    const getInput: GetSalesProspectInput = {
      id: createdProspect.id
    };

    const handlerResult = await getSalesProspect(getInput);

    // Both should return the same data
    expect(handlerResult).not.toBeNull();
    expect(handlerResult!.id).toEqual(directQuery[0].id);
    expect(handlerResult!.follow_up).toEqual(directQuery[0].follow_up);
    expect(handlerResult!.potensi).toEqual(directQuery[0].potensi);
  });
});