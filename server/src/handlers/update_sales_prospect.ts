import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateSalesProspectInput, type SalesProspect } from '../schema';

export const updateSalesProspect = async (input: UpdateSalesProspectInput): Promise<SalesProspect> => {
  try {
    const updateData: any = {
      updated_at: new Date()
    };

    // Only include fields that are provided
    if (input.follow_up !== undefined) updateData.follow_up = input.follow_up;
    if (input.tanggal_fu_terakhir !== undefined) updateData.tanggal_fu_terakhir = input.tanggal_fu_terakhir;
    if (input.date_last_respond !== undefined) updateData.date_last_respond = input.date_last_respond;
    if (input.potensi !== undefined) updateData.potensi = input.potensi;
    if (input.online_meeting !== undefined) updateData.online_meeting = input.online_meeting;
    if (input.survey_lokasi !== undefined) updateData.survey_lokasi = input.survey_lokasi;
    if (input.status_closing !== undefined) updateData.status_closing = input.status_closing;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.blast_mingguan !== undefined) updateData.blast_mingguan = input.blast_mingguan;
    if (input.photo_url !== undefined) updateData.photo_url = input.photo_url;

    const result = await db.update(salesProspectsTable)
      .set(updateData)
      .where(eq(salesProspectsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Sales prospect with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Sales prospect update failed:', error);
    throw error;
  }
};