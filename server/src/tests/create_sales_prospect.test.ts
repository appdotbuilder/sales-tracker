import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type CreateSalesProspectInput } from '../schema';
import { createSalesProspect } from '../handlers/create_sales_prospect';
import { eq, gte, between, and } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateSalesProspectInput = {
  follow_up: 'Hot Lead',
  tanggal_fu_terakhir: new Date('2024-01-15'),
  date_last_respond: new Date('2024-01-10'),
  potensi: 'High',
  online_meeting: true,
  survey_lokasi: false,
  status_closing: 'In Progress',
  notes: 'Promising prospect for Q1',
  blast_mingguan: true
};

// Test input with nullable fields as null
const testInputWithNulls: CreateSalesProspectInput = {
  follow_up: 'Cold Lead',
  tanggal_fu_terakhir: null,
  date_last_respond: null,
  potensi: 'Low',
  online_meeting: false,
  survey_lokasi: false,
  status_closing: 'Not Started',
  notes: null,
  blast_mingguan: false
};

describe('createSalesProspect', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a sales prospect with all fields', async () => {
    const result = await createSalesProspect(testInput);

    // Basic field validation
    expect(result.follow_up).toEqual('Hot Lead');
    expect(result.tanggal_fu_terakhir).toEqual(testInput.tanggal_fu_terakhir);
    expect(result.date_last_respond).toEqual(testInput.date_last_respond);
    expect(result.potensi).toEqual('High');
    expect(result.online_meeting).toEqual(true);
    expect(result.survey_lokasi).toEqual(false);
    expect(result.status_closing).toEqual('In Progress');
    expect(result.notes).toEqual('Promising prospect for Q1');
    expect(result.blast_mingguan).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a sales prospect with null values', async () => {
    const result = await createSalesProspect(testInputWithNulls);

    // Validate nullable fields are handled correctly
    expect(result.follow_up).toEqual('Cold Lead');
    expect(result.tanggal_fu_terakhir).toBeNull();
    expect(result.date_last_respond).toBeNull();
    expect(result.potensi).toEqual('Low');
    expect(result.online_meeting).toEqual(false);
    expect(result.survey_lokasi).toEqual(false);
    expect(result.status_closing).toEqual('Not Started');
    expect(result.notes).toBeNull();
    expect(result.blast_mingguan).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save sales prospect to database', async () => {
    const result = await createSalesProspect(testInput);

    // Query using proper drizzle syntax
    const prospects = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, result.id))
      .execute();

    expect(prospects).toHaveLength(1);
    expect(prospects[0].follow_up).toEqual('Hot Lead');
    expect(prospects[0].potensi).toEqual('High');
    expect(prospects[0].status_closing).toEqual('In Progress');
    expect(prospects[0].online_meeting).toEqual(true);
    expect(prospects[0].survey_lokasi).toEqual(false);
    expect(prospects[0].blast_mingguan).toEqual(true);
    expect(prospects[0].notes).toEqual('Promising prospect for Q1');
    expect(prospects[0].created_at).toBeInstanceOf(Date);
    expect(prospects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should generate unique IDs for multiple prospects', async () => {
    const result1 = await createSalesProspect(testInput);
    const result2 = await createSalesProspect(testInputWithNulls);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
  });

  it('should query prospects by date range correctly', async () => {
    // Create test prospect
    await createSalesProspect(testInput);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Proper query building - step by step
    const prospects = await db.select()
      .from(salesProspectsTable)
      .where(
        and(
          gte(salesProspectsTable.created_at, yesterday),
          between(salesProspectsTable.created_at, yesterday, tomorrow)
        )
      )
      .execute();

    expect(prospects.length).toBeGreaterThan(0);
    prospects.forEach(prospect => {
      expect(prospect.created_at).toBeInstanceOf(Date);
      expect(prospect.created_at >= yesterday).toBe(true);
      expect(prospect.created_at <= tomorrow).toBe(true);
    });
  });

  it('should handle boolean fields correctly', async () => {
    // Test with mixed boolean values
    const mixedBooleanInput: CreateSalesProspectInput = {
      follow_up: 'Warm Lead',
      tanggal_fu_terakhir: new Date(),
      date_last_respond: new Date(),
      potensi: 'Medium',
      online_meeting: true,
      survey_lokasi: true,
      status_closing: 'Scheduled',
      notes: 'Both meetings scheduled',
      blast_mingguan: false
    };

    const result = await createSalesProspect(mixedBooleanInput);

    expect(typeof result.online_meeting).toBe('boolean');
    expect(typeof result.survey_lokasi).toBe('boolean');
    expect(typeof result.blast_mingguan).toBe('boolean');
    expect(result.online_meeting).toBe(true);
    expect(result.survey_lokasi).toBe(true);
    expect(result.blast_mingguan).toBe(false);
  });
});