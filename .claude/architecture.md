A very thin API layer developed using node with typescript.
Use case: This application empowers a telecom cart developed on top of a non-persistent SalesForce cart's context. This is supposed to be a very thin layer which means:
- No real Salesforce calls.
- No database integration, instead all data is stored in memory.

Tech stack: TypeScript, Node.js, Express.js, Jest

Architecture overview
- Entry: `src/server.ts` starts an Express server on port 3000 in dev setup. This file contains an initialization routine ie: instantiates the app, and handle high level server level configs such as starting an HTTP server, handling gracefull shutdowns, other server level tasks etc.
- App: `src/app.ts` is the main entry point for the app. This handles tasks such as: setting up the middlewares, routes, error handling, CORS etc.
- Routes: `src/routes` contains all the HTTP endpoints. index.ts is a file that will expose the routes to the app.
- Controllers: `src/controllers` contains all the HTTP handlers. index.ts is a file that will expose the controllers to the app.
- Config: `src/config/index.ts` centralizes all config-driven settings which means if in future we might have to add caching then-how long it should be cached etc should be configured using this file.
- Service boundaries: heavy logic lives in `src/services`. All async operations/business logic should be handled by services.

Build / dev / test workflows
- Start dev server (auto-reload): `npm run dev` (uses `tsx watch` with starting point as `src/server.ts`).
- Build: `npm run build` to compile to `dist/` via `tsc`.
- Start production: `npm run start` runs `node dist/server.js`.
- Tests: `npm test` runs Jest with coverage.

- Add route and mount it using the API version:
  const router = Router();
  router.get('/', myController.list);
  // in src/app.ts: app.use(`/api/${config.server.apiVersion}/myresource`, myRoutes);

What not to change without inspection
- Don't change cookie names (`accessToken`, `refreshToken`) or refresh token rotation logic in `auth.service.ts` without updating consumers (frontend and tests).
- Don't change event names in `src/services/event-emitter.service.ts` unless you update all subscribers (`websocket.service.ts`, `webhook-delivery.service.ts`, etc.).

Files to read first when landing here
- `src/index.ts`, `src/app.ts`, `src/config/index.ts`, `src/services/event-emitter.service.ts`, `src/services/webhook-delivery.service.ts`, `src/services/queue.service.ts`, `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`.

If something seems missing
- Ask for the package (`@mark-it/shared`) code or the repo that owns it. Many API shapes and DTOs come from that package and are required to make compatible changes.

If this file needs updates, reply with specific missing scenarios (setup, new external API, missing local services) and I'll extend the guidance.
