# OrbitScore Web (Legacy Prototype)

> **Notice**: As part of the frontend consolidation, **`frontend/`** is the primary, production-ready frontend for OrbitScore. All features from this prototype—including the FastAPI client, dual-mode (Mock vs Live) toggle, SHA-256 provenance verification, and bounded counterfactual simulations—have been consolidated into `frontend/`.

## Primary Application Location

To run the primary consolidated OrbitScore application:

```bash
# From workspace root:
npm run dev

# Or from /frontend:
cd frontend
npm run dev
```

## Legacy Prototype Usage (Historical Reference)

If running this standalone prototype for reference:

```bash
cd apps/web
npm install
VITE_USE_MOCK=true npm run dev
```

`frontend-service/api.ts` is the shared TypeScript domain/API client supporting the FastAPI backend in `apps/api`.
