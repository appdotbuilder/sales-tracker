import { z } from 'zod';

// Prospect status enum
export const prospectStatusSchema = z.enum([
  'new',
  'contacted', 
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
]);

export type ProspectStatus = z.infer<typeof prospectStatusSchema>;

// Prospect priority enum
export const prospectPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export type ProspectPriority = z.infer<typeof prospectPrioritySchema>;

// Prospect schema
export const prospectSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  status: prospectStatusSchema,
  priority: prospectPrioritySchema,
  estimated_value: z.number().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Prospect = z.infer<typeof prospectSchema>;

// Photo schema
export const photoSchema = z.object({
  id: z.number(),
  prospect_id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  file_size: z.number(),
  file_path: z.string(),
  uploaded_at: z.coerce.date()
});

export type Photo = z.infer<typeof photoSchema>;

// Activity schema for tracking interactions
export const activitySchema = z.object({
  id: z.number(),
  prospect_id: z.number(),
  activity_type: z.enum(['call', 'email', 'meeting', 'note', 'status_change']),
  title: z.string(),
  description: z.string().nullable(),
  activity_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Activity = z.infer<typeof activitySchema>;

// Input schemas for creating prospects
export const createProspectInputSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  status: prospectStatusSchema.default('new'),
  priority: prospectPrioritySchema.default('medium'),
  estimated_value: z.number().positive().nullable(),
  notes: z.string().nullable()
});

export type CreateProspectInput = z.infer<typeof createProspectInputSchema>;

// Input schema for updating prospects
export const updateProspectInputSchema = z.object({
  id: z.number(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  status: prospectStatusSchema.optional(),
  priority: prospectPrioritySchema.optional(),
  estimated_value: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateProspectInput = z.infer<typeof updateProspectInputSchema>;

// Input schema for uploading photos
export const uploadPhotoInputSchema = z.object({
  prospect_id: z.number(),
  filename: z.string().min(1, 'Filename is required'),
  original_name: z.string().min(1, 'Original name is required'),
  mime_type: z.string().min(1, 'MIME type is required'),
  file_size: z.number().positive('File size must be positive'),
  file_path: z.string().min(1, 'File path is required')
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoInputSchema>;

// Input schema for creating activities
export const createActivityInputSchema = z.object({
  prospect_id: z.number(),
  activity_type: z.enum(['call', 'email', 'meeting', 'note', 'status_change']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  activity_date: z.coerce.date().optional()
});

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

// Detailed prospect schema with related data
export const prospectWithDetailsSchema = prospectSchema.extend({
  photos: z.array(photoSchema),
  activities: z.array(activitySchema)
});

export type ProspectWithDetails = z.infer<typeof prospectWithDetailsSchema>;

// Query parameters for filtering prospects
export const prospectFilterSchema = z.object({
  status: prospectStatusSchema.optional(),
  priority: prospectPrioritySchema.optional(),
  company: z.string().optional(),
  search: z.string().optional() // Search across name, email, company
});

export type ProspectFilter = z.infer<typeof prospectFilterSchema>;