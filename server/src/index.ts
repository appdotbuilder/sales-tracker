import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createProspectInputSchema, 
  updateProspectInputSchema,
  prospectFilterSchema,
  uploadPhotoInputSchema,
  createActivityInputSchema
} from './schema';

// Import handlers
import { createProspect } from './handlers/create_prospect';
import { getProspects } from './handlers/get_prospects';
import { getProspectById } from './handlers/get_prospect_by_id';
import { updateProspect } from './handlers/update_prospect';
import { deleteProspect } from './handlers/delete_prospect';
import { uploadPhoto } from './handlers/upload_photo';
import { getProspectPhotos } from './handlers/get_prospect_photos';
import { deletePhoto } from './handlers/delete_photo';
import { createActivity } from './handlers/create_activity';
import { getProspectActivities } from './handlers/get_prospect_activities';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Prospect management endpoints
  createProspect: publicProcedure
    .input(createProspectInputSchema)
    .mutation(({ input }) => createProspect(input)),

  getProspects: publicProcedure
    .input(prospectFilterSchema.optional())
    .query(({ input }) => getProspects(input)),

  getProspectById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getProspectById(input.id)),

  updateProspect: publicProcedure
    .input(updateProspectInputSchema)
    .mutation(({ input }) => updateProspect(input)),

  deleteProspect: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProspect(input.id)),

  // Photo management endpoints
  uploadPhoto: publicProcedure
    .input(uploadPhotoInputSchema)
    .mutation(({ input }) => uploadPhoto(input)),

  getProspectPhotos: publicProcedure
    .input(z.object({ prospectId: z.number() }))
    .query(({ input }) => getProspectPhotos(input.prospectId)),

  deletePhoto: publicProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(({ input }) => deletePhoto(input.photoId)),

  // Activity management endpoints
  createActivity: publicProcedure
    .input(createActivityInputSchema)
    .mutation(({ input }) => createActivity(input)),

  getProspectActivities: publicProcedure
    .input(z.object({ prospectId: z.number() }))
    .query(({ input }) => getProspectActivities(input.prospectId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`CRM TRPC Server listening at port: ${port}`);
  console.log(`Available endpoints:`);
  console.log(`- Prospect Management: createProspect, getProspects, getProspectById, updateProspect, deleteProspect`);
  console.log(`- Photo Management: uploadPhoto, getProspectPhotos, deletePhoto`);
  console.log(`- Activity Tracking: createActivity, getProspectActivities`);
}

start();