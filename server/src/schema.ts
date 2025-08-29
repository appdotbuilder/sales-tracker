import { z } from 'zod';

// Sales prospect schema with proper field types
export const salesProspectSchema = z.object({
  id: z.number(),
  follow_up: z.string(),
  tanggal_fu_terakhir: z.coerce.date().nullable(),
  date_last_respond: z.coerce.date().nullable(), 
  potensi: z.string(),
  online_meeting: z.boolean(),
  survey_lokasi: z.boolean(),
  status_closing: z.string(),
  notes: z.string().nullable(),
  blast_mingguan: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SalesProspect = z.infer<typeof salesProspectSchema>;

// Input schema for creating sales prospects
export const createSalesProspectInputSchema = z.object({
  follow_up: z.string().min(1, "Follow up status is required"),
  tanggal_fu_terakhir: z.coerce.date().nullable(),
  date_last_respond: z.coerce.date().nullable(),
  potensi: z.string().min(1, "Potensi is required"),
  online_meeting: z.boolean(),
  survey_lokasi: z.boolean(),
  status_closing: z.string().min(1, "Status closing is required"),
  notes: z.string().nullable(),
  blast_mingguan: z.boolean()
});

export type CreateSalesProspectInput = z.infer<typeof createSalesProspectInputSchema>;

// Input schema for updating sales prospects
export const updateSalesProspectInputSchema = z.object({
  id: z.number(),
  follow_up: z.string().min(1).optional(),
  tanggal_fu_terakhir: z.coerce.date().nullable().optional(),
  date_last_respond: z.coerce.date().nullable().optional(),
  potensi: z.string().min(1).optional(),
  online_meeting: z.boolean().optional(),
  survey_lokasi: z.boolean().optional(),
  status_closing: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  blast_mingguan: z.boolean().optional()
});

export type UpdateSalesProspectInput = z.infer<typeof updateSalesProspectInputSchema>;

// Input schema for deleting sales prospects
export const deleteSalesProspectInputSchema = z.object({
  id: z.number()
});

export type DeleteSalesProspectInput = z.infer<typeof deleteSalesProspectInputSchema>;

// Input schema for getting a single sales prospect
export const getSalesProspectInputSchema = z.object({
  id: z.number()
});

export type GetSalesProspectInput = z.infer<typeof getSalesProspectInputSchema>;