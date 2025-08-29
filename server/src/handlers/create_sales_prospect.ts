import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { type CreateSalesProspectInput, type SalesProspect } from '../schema';

export const createSalesProspect = async (input: CreateSalesProspectInput): Promise<SalesProspect> => {
  try {
    const result = await db.insert(salesProspectsTable)
      .values({
        follow_up: input.follow_up,
        tanggal_fu_terakhir: input.tanggal_fu_terakhir,
        date_last_respond: input.date_last_respond,
        potensi: input.potensi,
        online_meeting: input.online_meeting,
        survey_lokasi: input.survey_lokasi,
        status_closing: input.status_closing,
        notes: input.notes,
        blast_mingguan: input.blast_mingguan,
        photo_url: input.photo_url || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Sales prospect creation failed:', error);
    throw error;
  }
};