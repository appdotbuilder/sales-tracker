import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type UpdateSalesProspectInput } from '../schema';
import { updateSalesProspect } from '../handlers/update_sales_prospect';
import { eq } from 'drizzle-orm';

describe('updateSalesProspect', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test prospect
  const createTestProspect = async () => {
    const result = await db.insert(salesProspectsTable)
      .values({
        follow_up: 'Initial Follow Up',
        tanggal_fu_terakhir: new Date('2024-01-15'),
        date_last_respond: new Date('2024-01-10'),
        potensi: 'High',
        online_meeting: false,
        survey_lokasi: false,
        status_closing: 'Open',
        notes: 'Initial notes',
        blast_mingguan: false
      })
      .returning()
      .execute();

    return result[0];
  };

  it('should update all fields of a sales prospect', async () => {
    const testProspect = await createTestProspect();
    const originalUpdatedAt = testProspect.updated_at;

    // Wait a bit to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateSalesProspectInput = {
      id: testProspect.id,
      follow_up: 'Updated Follow Up',
      tanggal_fu_terakhir: new Date('2024-02-20'),
      date_last_respond: new Date('2024-02-15'),
      potensi: 'Medium',
      online_meeting: true,
      survey_lokasi: true,
      status_closing: 'In Progress',
      notes: 'Updated notes',
      blast_mingguan: true
    };

    const result = await updateSalesProspect(updateInput);

    // Verify all fields are updated
    expect(result.id).toEqual(testProspect.id);
    expect(result.follow_up).toEqual('Updated Follow Up');
    expect(result.tanggal_fu_terakhir).toEqual(new Date('2024-02-20'));
    expect(result.date_last_respond).toEqual(new Date('2024-02-15'));
    expect(result.potensi).toEqual('Medium');
    expect(result.online_meeting).toEqual(true);
    expect(result.survey_lokasi).toEqual(true);
    expect(result.status_closing).toEqual('In Progress');
    expect(result.notes).toEqual('Updated notes');
    expect(result.blast_mingguan).toEqual(true);
    expect(result.created_at).toEqual(testProspect.created_at);
    expect(result.updated_at).not.toEqual(originalUpdatedAt);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const testProspect = await createTestProspect();

    const partialUpdate: UpdateSalesProspectInput = {
      id: testProspect.id,
      follow_up: 'Partial Update',
      online_meeting: true
    };

    const result = await updateSalesProspect(partialUpdate);

    // Verify only specified fields are updated
    expect(result.follow_up).toEqual('Partial Update');
    expect(result.online_meeting).toEqual(true);
    
    // Verify other fields remain unchanged
    expect(result.potensi).toEqual(testProspect.potensi);
    expect(result.status_closing).toEqual(testProspect.status_closing);
    expect(result.survey_lokasi).toEqual(testProspect.survey_lokasi);
    expect(result.notes).toEqual(testProspect.notes);
    expect(result.blast_mingguan).toEqual(testProspect.blast_mingguan);
    expect(result.tanggal_fu_terakhir).toEqual(testProspect.tanggal_fu_terakhir);
    expect(result.date_last_respond).toEqual(testProspect.date_last_respond);
  });

  it('should update nullable fields to null', async () => {
    const testProspect = await createTestProspect();

    const updateInput: UpdateSalesProspectInput = {
      id: testProspect.id,
      tanggal_fu_terakhir: null,
      date_last_respond: null,
      notes: null
    };

    const result = await updateSalesProspect(updateInput);

    expect(result.tanggal_fu_terakhir).toBeNull();
    expect(result.date_last_respond).toBeNull();
    expect(result.notes).toBeNull();
  });

  it('should persist changes to database', async () => {
    const testProspect = await createTestProspect();

    const updateInput: UpdateSalesProspectInput = {
      id: testProspect.id,
      follow_up: 'Database Update Test',
      potensi: 'Low'
    };

    await updateSalesProspect(updateInput);

    // Query database directly to verify persistence
    const dbRecord = await db.select()
      .from(salesProspectsTable)
      .where(eq(salesProspectsTable.id, testProspect.id))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].follow_up).toEqual('Database Update Test');
    expect(dbRecord[0].potensi).toEqual('Low');
  });

  it('should always update the updated_at timestamp', async () => {
    const testProspect = await createTestProspect();
    const originalUpdatedAt = testProspect.updated_at;

    // Wait to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateSalesProspectInput = {
      id: testProspect.id,
      blast_mingguan: true
    };

    const result = await updateSalesProspect(updateInput);

    expect(result.updated_at).not.toEqual(originalUpdatedAt);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent prospect', async () => {
    const updateInput: UpdateSalesProspectInput = {
      id: 99999, // Non-existent ID
      follow_up: 'Should fail'
    };

    await expect(updateSalesProspect(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle boolean field updates correctly', async () => {
    const testProspect = await createTestProspect();

    const updateInput: UpdateSalesProspectInput = {
      id: testProspect.id,
      online_meeting: !testProspect.online_meeting,
      survey_lokasi: !testProspect.survey_lokasi,
      blast_mingguan: !testProspect.blast_mingguan
    };

    const result = await updateSalesProspect(updateInput);

    expect(result.online_meeting).toEqual(!testProspect.online_meeting);
    expect(result.survey_lokasi).toEqual(!testProspect.survey_lokasi);
    expect(result.blast_mingguan).toEqual(!testProspect.blast_mingguan);
  });

  it('should handle date field updates correctly', async () => {
    const testProspect = await createTestProspect();
    const newFollowUpDate = new Date('2024-03-01');
    const newRespondDate = new Date('2024-02-28');

    const updateInput: UpdateSalesProspectInput = {
      id: testProspect.id,
      tanggal_fu_terakhir: newFollowUpDate,
      date_last_respond: newRespondDate
    };

    const result = await updateSalesProspect(updateInput);

    expect(result.tanggal_fu_terakhir).toEqual(newFollowUpDate);
    expect(result.date_last_respond).toEqual(newRespondDate);
    expect(result.tanggal_fu_terakhir).toBeInstanceOf(Date);
    expect(result.date_last_respond).toBeInstanceOf(Date);
  });
});