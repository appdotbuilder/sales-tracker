import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createSalesProspectInputSchema,
  updateSalesProspectInputSchema,
  deleteSalesProspectInputSchema,
  getSalesProspectInputSchema
} from './schema';

// Import handlers
import { createSalesProspect } from './handlers/create_sales_prospect';
import { getSalesProspects } from './handlers/get_sales_prospects';
import { getSalesProspect } from './handlers/get_sales_prospect';
import { updateSalesProspect } from './handlers/update_sales_prospect';
import { deleteSalesProspect } from './handlers/delete_sales_prospect';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new sales prospect
  createSalesProspect: publicProcedure
    .input(createSalesProspectInputSchema)
    .mutation(({ input }) => createSalesProspect(input)),
  
  // Get all sales prospects
  getSalesProspects: publicProcedure
    .query(() => getSalesProspects()),
  
  // Get a single sales prospect by ID
  getSalesProspect: publicProcedure
    .input(getSalesProspectInputSchema)
    .query(({ input }) => getSalesProspect(input)),
  
  // Update an existing sales prospect
  updateSalesProspect: publicProcedure
    .input(updateSalesProspectInputSchema)
    .mutation(({ input }) => updateSalesProspect(input)),
  
  // Delete a sales prospect
  deleteSalesProspect: publicProcedure
    .input(deleteSalesProspectInputSchema)
    .mutation(({ input }) => deleteSalesProspect(input)),
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
  console.log(`TRPC server listening at port: ${port}`);
}

start();