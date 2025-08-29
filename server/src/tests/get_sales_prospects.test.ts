import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { getSalesProspects } from '../handlers/get_sales_prospects';
import { type CreateSalesProspectInput } from '../schema';

// Test data for sales prospects
const testProspect1: CreateSalesProspectInput = {
  follow_up: 'Hot',
  tanggal_fu_terakhir: new Date('2024-01-15'),
  date_last_respond: new Date('2024-01-14'),
  potensi: 'High',
  online_meeting: true,
  survey_lokasi: false,
  status_closing: 'In Progress',
  notes: 'Interested in premium package',
  blast_mingguan: true
};

const testProspect2: CreateSalesProspectInput = {
  follow_up: 'Warm',
  tanggal_fu_terakhir: null,
  date_last_respond: new Date('2024-01-10'),
  potensi: 'Medium',
  online_meeting: false,
  survey_lokasi: true,
  status_closing: 'Pending',
  notes: null,
  blast_mingguan: false
};

const testProspect3: CreateSalesProspectInput = {
  follow_up: 'Cold',
  tanggal_fu_terakhir: new Date('2024-01-05'),
  date_last_respond: null,
  potensi: 'Low',
  online_meeting: false,
  survey_lokasi: false,
  status_closing: 'Lost',
  notes: 'Not interested at this time',
  blast_mingguan: false
};

describe('getSalesProspects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no prospects exist', async () => {
    const result = await getSalesProspects();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all sales prospects', async () => {
    // Create test prospects
    await db.insert(salesProspectsTable).values([
      testProspect1,
      testProspect2,
      testProspect3
    ]).execute();

    const result = await getSalesProspects();

    expect(result).toHaveLength(3);
    expect(Array.isArray(result)).toBe(true);

    // Verify all prospects are returned
    const followUps = result.map(p => p.follow_up).sort();
    expect(followUps).toEqual(['Cold', 'Hot', 'Warm']);
  });

  it('should return prospects with correct field types', async () => {
    // Create a prospect with all field variations
    await db.insert(salesProspectsTable).values(testProspect1).execute();

    const result = await getSalesProspects();
    const prospect = result[0];

    // Verify field types
    expect(typeof prospect.id).toBe('number');
    expect(typeof prospect.follow_up).toBe('string');
    expect(prospect.tanggal_fu_terakhir).toBeInstanceOf(Date);
    expect(prospect.date_last_respond).toBeInstanceOf(Date);
    expect(typeof prospect.potensi).toBe('string');
    expect(typeof prospect.online_meeting).toBe('boolean');
    expect(typeof prospect.survey_lokasi).toBe('boolean');
    expect(typeof prospect.status_closing).toBe('string');
    expect(typeof prospect.notes).toBe('string');
    expect(typeof prospect.blast_mingguan).toBe('boolean');
    expect(prospect.created_at).toBeInstanceOf(Date);
    expect(prospect.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null values correctly', async () => {
    // Create a prospect with null values
    await db.insert(salesProspectsTable).values(testProspect2).execute();

    const result = await getSalesProspects();
    const prospect = result[0];

    // Verify null fields
    expect(prospect.tanggal_fu_terakhir).toBeNull();
    expect(prospect.notes).toBeNull();
    
    // Verify non-null fields still have correct values
    expect(prospect.follow_up).toBe('Warm');
    expect(prospect.date_last_respond).toBeInstanceOf(Date);
    expect(prospect.potensi).toBe('Medium');
  });

  it('should return prospects in database insertion order', async () => {
    // Insert prospects in specific order
    const prospect1 = await db.insert(salesProspectsTable)
      .values(testProspect1)
      .returning()
      .execute();

    const prospect2 = await db.insert(salesProspectsTable)
      .values(testProspect2)
      .returning()
      .execute();

    const result = await getSalesProspects();

    expect(result).toHaveLength(2);
    // Should maintain insertion order (first inserted has lower ID)
    expect(result[0].id).toBeLessThan(result[1].id);
    expect(result[0].follow_up).toBe('Hot');
    expect(result[1].follow_up).toBe('Warm');
  });

  it('should include all required fields in response', async () => {
    // Create a complete prospect
    await db.insert(salesProspectsTable).values(testProspect1).execute();

    const result = await getSalesProspects();
    const prospect = result[0];

    // Verify all expected fields are present
    const expectedFields = [
      'id', 'follow_up', 'tanggal_fu_terakhir', 'date_last_respond',
      'potensi', 'online_meeting', 'survey_lokasi', 'status_closing',
      'notes', 'blast_mingguan', 'created_at', 'updated_at'
    ];

    expectedFields.forEach(field => {
      expect(prospect).toHaveProperty(field);
    });
  });

  it('should handle large number of prospects', async () => {
    // Create multiple prospects
    const prospects = Array.from({ length: 10 }, (_, i) => ({
      follow_up: `Test ${i + 1}`,
      tanggal_fu_terakhir: new Date(),
      date_last_respond: new Date(),
      potensi: 'Medium',
      online_meeting: i % 2 === 0,
      survey_lokasi: i % 3 === 0,
      status_closing: 'Active',
      notes: `Test note ${i + 1}`,
      blast_mingguan: i % 2 === 1
    }));

    await db.insert(salesProspectsTable).values(prospects).execute();

    const result = await getSalesProspects();

    expect(result).toHaveLength(10);
    expect(result.every(p => p.follow_up.startsWith('Test'))).toBe(true);
  });
});