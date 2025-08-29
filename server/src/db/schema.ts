import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const salesProspectsTable = pgTable('sales_prospects', {
  id: serial('id').primaryKey(),
  follow_up: text('follow_up').notNull(),
  tanggal_fu_terakhir: timestamp('tanggal_fu_terakhir'), // Nullable by default
  date_last_respond: timestamp('date_last_respond'), // Nullable by default
  potensi: text('potensi').notNull(),
  online_meeting: boolean('online_meeting').notNull().default(false),
  survey_lokasi: boolean('survey_lokasi').notNull().default(false),
  status_closing: text('status_closing').notNull(),
  notes: text('notes'), // Nullable by default
  blast_mingguan: boolean('blast_mingguan').notNull().default(false),
  photo_url: text('photo_url'), // URL to uploaded photo
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type SalesProspect = typeof salesProspectsTable.$inferSelect; // For SELECT operations
export type NewSalesProspect = typeof salesProspectsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { salesProspects: salesProspectsTable };