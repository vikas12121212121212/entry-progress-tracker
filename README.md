# Entry Progress Tracker

## Overview

This application demonstrates **progressive background processing** of user-created entries. Users can create entries, which progress through multiple stages in the background while the frontend shows live status updates.

Example flows:

- Food order: `Placed → Preparing → Delivered`  
- Video processing: `Uploaded → Processing → Ready`  

---

## Architecture

```
Frontend (React)
    ↓
Backend (Express + PostgreSQL)
    ↓
Queue (BullMQ / Redis)
    ↓
Worker(s) (Node.js)
    ↓
PostgreSQL Database
```

**Flow:**

1. User submits an entry via frontend → POST `/entries`
2. Backend inserts entry with `status = CREATED` and enqueues job in BullMQ
3. Available worker(s) pick up jobs and update entry through stages:
   - `PROCESSING` → 20%
   - `STAGE_1_COMPLETE` → 60%
   - `STAGE_2_COMPLETE` → 80%
   - `COMPLETED` → 100%
4. Frontend polls backend every 2–3 seconds for latest status and progress
5. Progress bars visualize each entry's current progress (0–100%)

---

## Background Processing

- **Queue:** BullMQ + Redis handles asynchronous jobs
- **Workers:** Multiple Node.js worker processes pick jobs concurrently from queue. Each worker:
  - Updates entries in PostgreSQL **transactionally** using `FOR UPDATE`
  - Ensures **no two workers process the same entry simultaneously**
  - Uses **conditional updates** to prevent progress regression on retries
- **Error Handling:** Failed jobs are rolled back; BullMQ retries automatically

---

## Consistency & Concurrency

Updates are **atomic** and **safe across multiple workers**:

```sql
UPDATE entries
SET status = $1, progress = $2, updated_at = NOW()
WHERE id = $3 AND progress < $2;
```

- PostgreSQL `FOR UPDATE` locks rows during updates
- Multiple workers or retries never regress progress

---

## Frontend

- Built with React
- Create entries and view live progress bars
- Polls backend every 2–3 seconds for real-time status
- Shows multiple entries progressing in parallel

---

## Docker & Multiple Workers

Scale workers with Docker Compose:

```bash
docker-compose up --build --scale worker=3
```

- Redis assigns each job to only one worker
- PostgreSQL transactions + row locking ensure consistency
- Frontend automatically displays parallel progress

---

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/vikas12121212121212/entry-progress-tracker.git
cd entry-progress-tracker
```

### Create Backend Environment Variables

```bash
# In backend folder
touch .env
```

**.env contents:**

```
PORT=5000
DATABASE_URL=postgres://postgres:postgres@db:5432/entriesdb
REDIS_HOST=redis
REDIS_PORT=6379
WORKER_CONCURRENCY=3
```

### Start Services

```bash
# 1. Build all images
docker compose build

# 2. Start services in background (detached mode)
docker compose up -d

# 3. Scale worker service to 3 instances
docker compose up -d --scale worker=3
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Check Logs

```bash
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend
```

