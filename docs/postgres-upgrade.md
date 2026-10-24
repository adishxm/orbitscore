# OrbitScore — PostgreSQL Upgrade & Migration Guide

> **Scope**: Moving OrbitScore from local zero-dependency SQLite persistence to production PostgreSQL + PostGIS for multi-node deployments, concurrent writes, and spatial-temporal orbital querying.

---

## 1. Overview & Architecture

OrbitScore ships with a durable, zero-dependency SQLite backend (`data/orbitscore.db`) configured for synchronous hackathon demos and fast local execution. For multi-tenant production hosting (e.g. AWS ECS / App Runner or Kubernetes), OrbitScore supports standard `DATABASE_URL`-driven PostgreSQL engines.

| Feature | SQLite (Default Demo) | PostgreSQL (Production) |
|---|---|---|
| **Storage Engine** | Single-file (`data/orbitscore.db`) | Managed RDS / Aurora PostgreSQL 15+ |
| **Concurrency** | WAL mode, single-writer | Multi-writer MVCC with connection pooling |
| **Migrations** | `init_db()` idempotent schema | Alembic migrations (`backend/alembic/versions/`) |
| **Spatial / TLE** | Spherical trigonometric queries | Optional PostGIS (`GEOMETRY(Point, 4326)`) |
| **Audit Logs** | SHA-256 chain in `provenance` table | Immutable append-only audit table + row-level encryption |

---

## 2. Docker Compose Setup

Run PostgreSQL alongside the OrbitScore backend using this `docker-compose.postgres.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.4-alpine
    container_name: orbitscore-db
    environment:
      POSTGRES_USER: orbitscore_user
      POSTGRES_PASSWORD: orbitscore_secure_password
      POSTGRES_DB: orbitscore_production
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orbitscore_user -d orbitscore_production"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: orbitscore-api
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://orbitscore_user:orbitscore_secure_password@postgres:5432/orbitscore_production
      - ORBIT_ENV=production
      - ORBIT_SECRET_KEY=change-in-production-use-aws-secrets-manager
      - ORBIT_LIVE_DATA_ENABLED=false
    ports:
      - "8000:8000"

volumes:
  pgdata:
```

---

## 3. Applying Alembic Migrations

OrbitScore includes production Alembic migrations under `backend/alembic/`.

### Step 1: Configure Environment
Set `DATABASE_URL` in your `.env` or shell environment:
```bash
export DATABASE_URL="postgresql://orbitscore_user:orbitscore_secure_password@localhost:5432/orbitscore_production"
```

### Step 2: Run Alembic Upgrade
From the `backend/` directory:
```bash
# Check current migration status
alembic current

# Apply all migrations to the latest revision
alembic upgrade head
```

This provisions all core tables:
- `missions`: Spacecraft envelope, metadata, and status.
- `artifacts`: Immutable raw uploads with SHA-256 integrity digests.
- `fields`: Extracted evidence parameters and reviewer confirmations.
- `evaluations`: Deterministic profile evaluation results.
- `reviews`: Signed human reviewer waivers and approvals.
- `counterfactuals`: Scenario levers and what-if simulation records.
- `provenance`: Tamper-evident cryptographic ledger chain.
- `tle_snapshots`: Spatio-temporal ephemeris cache.
- `cdm_events`: Conjunction Data Message event repository.

---

## 4. SQLite to PostgreSQL Data Transfer

To transfer an existing demo database to PostgreSQL without data loss:

```python
"""
scripts/migrate_sqlite_to_pg.py
One-way migration utility transferring SQLite records into PostgreSQL.
"""
import sqlite3
import psycopg2
import json

SQLITE_PATH = "data/orbitscore.db"
PG_DSN = "postgresql://orbitscore_user:orbitscore_secure_password@localhost:5432/orbitscore_production"

def migrate():
    s_conn = sqlite3.connect(SQLITE_PATH)
    s_conn.row_factory = sqlite3.Row
    p_conn = psycopg2.connect(PG_DSN)
    
    tables = [
        "missions", "artifacts", "fields", "evaluations",
        "reviews", "counterfactuals", "provenance", "tle_snapshots", "cdm_events"
    ]
    
    with p_conn.cursor() as cur:
        for t in tables:
            print(f"Migrating table {t}...")
            rows = s_conn.execute(f"SELECT * FROM {t}").fetchall()
            if not rows:
                continue
            cols = [col[0] for col in s_conn.execute(f"SELECT * FROM {t} LIMIT 1").description]
            placeholders = ", ".join(["%s"] * len(cols))
            col_names = ", ".join(cols)
            
            insert_sql = f"INSERT INTO {t} ({col_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
            cur.executemany(insert_sql, [list(r) for r in rows])
            
    p_conn.commit()
    print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
```

---

## 5. Production Considerations

1. **Connection Pooling**: Use PgBouncer or SQLAlchemy connection pools (`pool_size=10, max_overflow=20`) to manage bursty reviewer traffic.
2. **Read Replicas**: Route read-heavy dashboard views (`GET /missions/{id}/pathway` and `GET /missions/{id}/space-credit-index`) to read replicas.
3. **Backup Strategy**: Daily automated snapshots with point-in-time recovery (PITR) enabled via AWS RDS.
4. **Row-Level Provenance**: PostgreSQL allows configuring table audit triggers to guarantee that the `provenance` table is write-only / append-only.
