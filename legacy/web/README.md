# OrbitScore frontend

From this directory:

```bash
npm install
npm test
npm run build
VITE_USE_MOCK=true npm run dev
```

`frontend-service/api.ts` is an independently importable TypeScript domain/API layer. Vite injects `/fixtures/rules_profiles.json` from the project root through `vite.config.ts`; when that backend-owned fixture is not present, the service uses a complete deterministic catalog fallback so Vitest and the frontend remain independently runnable. Browser state uses `localStorage`; Vitest/Node uses the in-memory adapter.
