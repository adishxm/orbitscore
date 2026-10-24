# ==============================================================================
# OrbitScore Multi-Stage Production Dockerfile
# Stage 1: Build Frontend (Node.js 20 LTS)
# Stage 2: Production Python Runtime (FastAPI + AI/ML Engine)
# ==============================================================================

# --- Stage 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Runner ---
FROM python:3.10-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    ORBIT_ENV=production \
    PORT=8000

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend and AI/ML dependencies
COPY backend/requirements.txt ./backend/requirements.txt
COPY ai_ml/ ./ai_ml/
RUN pip install --no-cache-dir -r ./backend/requirements.txt
RUN pip install --no-cache-dir reportlab alembic

# Copy application code and static assets
COPY backend/ ./backend/
COPY fixtures/ ./fixtures/
COPY data/ ./data/
COPY research/ ./research/
COPY docs/ ./docs/

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create unprivileged application user
RUN useradd -m -u 1000 orbituser && \
    mkdir -p /app/data /app/model_artifacts && \
    chown -R orbituser:orbituser /app

USER orbituser

# Health check using the newly wired /health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
