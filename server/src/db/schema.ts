import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums for prospect status and priority
export const prospectStatusEnum = pgEnum('prospect_status', [
  'new',
  'contacted', 
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
]);

export const prospectPriorityEnum = pgEnum('prospect_priority', ['low', 'medium', 'high', 'urgent']);

export const activityTypeEnum = pgEnum('activity_type', ['call', 'email', 'meeting', 'note', 'status_change']);

// Prospects table - main CRM entity
export const prospectsTable = pgTable('prospects', {
  id: serial('id').primaryKey(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'), // Nullable by default
  company: text('company'), // Nullable by default
  position: text('position'), // Nullable by default
  status: prospectStatusEnum('status').notNull().default('new'),
  priority: prospectPriorityEnum('priority').notNull().default('medium'),
  estimated_value: numeric('estimated_value', { precision: 12, scale: 2 }), // Nullable for monetary values
  notes: text('notes'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Photos table - for storing prospect photos
export const photosTable = pgTable('photos', {
  id: serial('id').primaryKey(),
  prospect_id: integer('prospect_id').notNull(),
  filename: text('filename').notNull(), // Generated filename for storage
  original_name: text('original_name').notNull(), // Original uploaded filename
  mime_type: text('mime_type').notNull(), // e.g., image/jpeg, image/png
  file_size: integer('file_size').notNull(), // File size in bytes
  file_path: text('file_path').notNull(), // Storage path
  uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
});

// Activities table - for tracking interactions with prospects
export const activitiesTable = pgTable('activities', {
  id: serial('id').primaryKey(),
  prospect_id: integer('prospect_id').notNull(),
  activity_type: activityTypeEnum('activity_type').notNull(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  activity_date: timestamp('activity_date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations between tables
export const prospectsRelations = relations(prospectsTable, ({ many }) => ({
  photos: many(photosTable),
  activities: many(activitiesTable),
}));

export const photosRelations = relations(photosTable, ({ one }) => ({
  prospect: one(prospectsTable, {
    fields: [photosTable.prospect_id],
    references: [prospectsTable.id],
  }),
}));

export const activitiesRelations = relations(activitiesTable, ({ one }) => ({
  prospect: one(prospectsTable, {
    fields: [activitiesTable.prospect_id],
    references: [prospectsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Prospect = typeof prospectsTable.$inferSelect;
export type NewProspect = typeof prospectsTable.$inferInsert;

export type Photo = typeof photosTable.$inferSelect;
export type NewPhoto = typeof photosTable.$inferInsert;

export type Activity = typeof activitiesTable.$inferSelect;
export type NewActivity = typeof activitiesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  prospects: prospectsTable,
  photos: photosTable,
  activities: activitiesTable,
};

export const allRelations = {
  prospectsRelations,
  photosRelations,
  activitiesRelations,
};