# OrbitScore — AWS & Cloud Production Deployment Guide

> **Scope**: Hosting OrbitScore securely on AWS (App Runner or ECS Fargate) with frontend static distribution on Vercel / CloudFront, AWS Secrets Manager integration, and zero-downtime rollback protocols.

---

## 1. Hosting Architecture Overview

OrbitScore consists of a **FastAPI + AI/ML backend service** and a **React 18 + Vite frontend SPA**:

```text
[ Client Web Browser ]
        │
        ├──► [ Vercel / CloudFront ] ──► React 18 SPA (Static bundle: JS, CSS, WASM)
        │
        └──► [ AWS App Runner / ECS ] ──► FastAPI + Scikit-Learn Engine
                     │
                     ├──► AWS Secrets Manager (Reviewer key, Agent37 configuration)
                     ├──► Persistent Volume / EBS Mount (SQLite database: `/data/orbitscore.db`)
                     └──► EBS / S3 (Model Artifacts with SHA-256 integrity verification)
```

> [!NOTE]
> **Database and Storage Architecture**:
> - OrbitScore runtime uses SQLite configured with WAL mode (`PRAGMA journal_mode=WAL`) on a mounted persistent volume (`DATABASE_PATH=/data/orbitscore.db` or configured volume path).
> - Migrations are managed via Alembic in `backend/alembic/`.
> - For zero-loss rollbacks, always snapshot or back up the persistent volume or SQLite database file before applying schema migrations.

> [!NOTE]
> **Vercel vs AWS Demarcation**:
> - **Vercel**: Hosts the **frontend static application** (`frontend/dist`) via global edge CDN.
> - **AWS (or Render)**: Runs the **containerized Python backend** (`backend/app/main.py`) where deterministic rule execution, PDF generation, and scikit-learn models execute. Vercel serverless functions do not host the heavy Python ML runtime.

---

## 2. Option A: AWS App Runner (Fastest & Fully Managed)

AWS App Runner provides fully managed container execution, automatic scaling, and built-in HTTPS endpoints.

### Step 1: Push Image to Amazon ECR
```bash
# Authenticate Docker to your AWS ECR registry
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Build and tag container
docker build -t orbitscore-backend:latest .
docker tag orbitscore-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/orbitscore-backend:latest

# Push image
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/orbitscore-backend:latest
```

### Step 2: Configure App Runner Service
- **Source**: Amazon ECR image `<AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/orbitscore-backend:latest`.
- **Port**: `8000`
- **Health Check Path**: `/health` (Interval: 10s, Timeout: 5s, Healthy Threshold: 1).
- **Environment Variables**:
  - `ORBIT_ENV`: `production`
  - `ORBIT_ALLOWED_ORIGINS`: `https://orbitscore.vercel.app,https://yourdomain.com`
  - `DATABASE_URL`: Stored as secret reference `arn:aws:secretsmanager:ap-south-1:...:secret:orbitscore/db`
  - `ORBIT_SECRET_KEY`: Stored as secret reference `arn:aws:secretsmanager:ap-south-1:...:secret:orbitscore/jwt_secret`

---

## 3. Option B: AWS ECS Fargate (Enterprise Multi-AZ)

For enterprise deployments requiring private VPC peering with Amazon RDS:

1. **ECS Cluster**: Create a Fargate cluster in private subnets across 2 Availability Zones.
2. **Application Load Balancer (ALB)**:
   - HTTPS listener (Port 443) with ACM SSL certificate.
   - Target group pointing to container port 8000.
   - Health check probe: `GET /health` with HTTP 200 response matcher.
3. **Task Definition**:
   - 1 vCPU, 2 GB Memory.
   - Log driver: `awslogs` streaming to Amazon CloudWatch.
   - Task execution IAM role with `secretsmanager:GetSecretValue` permissions.

---

## 4. Security Hardening Checklist

| Security Control | Implementation |
|---|---|
| **HTTPS / TLS** | Terminated at ALB / App Runner using TLS 1.3 |
| **CORS Policy** | Whitelist specific frontend domains via `ORBIT_ALLOWED_ORIGINS` |
| **Secrets Isolation** | Zero secrets in git or container images; all fetched from Secrets Manager |
| **Non-Root Execution** | Dockerfile enforces execution under unprivileged `orbituser` (UID 1000) |
| **Export Lock Gate** | HTTP 423 `EXPORT_LOCKED` strictly enforced across JSON, Markdown, and PDF exports |
| **Data Integrity** | Cryptographic SHA-256 verification of all uploaded evidence documents and model artifacts |

---

## 5. Rollback Procedures

If a deployment fails health checks or introduces regression:

1. **App Runner Rollback**: Revert the active deployment pointer to the previous stable ECR image tag via AWS Management Console or CLI:
   ```bash
   aws apprunner start-deployment --service-arn <SERVICE_ARN>
   ```
2. **ECS Fargate Rollback**: Re-deploy the previous task definition revision:
   ```bash
   aws ecs update-service --cluster orbitscore-prod --service orbitscore-api --task-definition orbitscore-task:PREVIOUS_REVISION
   ```
3. **Database Rollback & Disaster Recovery**:
   - To prevent data loss, take a volume snapshot or copy `orbitscore.db` before migrations.
   - For a schema rollback to a previous state:
     ```bash
     # Restore SQLite database from pre-migration backup/snapshot
     cp /data/orbitscore.db.bak /data/orbitscore.db
     # Or run Alembic downgrade if downward migration scripts are confirmed non-destructive
     alembic downgrade -1
     ```
