# ZeroBase Implementation Plan

ZeroBase is a self-hosted, lightweight alternative to Supabase designed to run on a single VPS via Coolify.

## 🚀 Vision
A developer-friendly dashboard and SDK that provides the core features of Supabase (Auth, DB, Storage) without the heavy overhead and cost of their managed services.

## 🛠 Tech Stack
- **Dashboard/Server**: Next.js 15, Prisma, Better Auth, Tailwind/shadcn.
- **Database**: PostgreSQL.
- **Storage**: MinIO (S3-compatible) or Local Storage Abstraction.
- **SDK**: Lightweight TypeScript wrapper using `fetch`.
- **Infrastructure**: Docker Compose for dev, Coolify for prod.

## 📋 Features & Roadmap

### Phase 1: Foundation (Tickets 1-3)
1. **Project Scaffold**: Next.js initialization with shadcn/ui and Prisma.
2. **Auth Integration**: Better Auth setup with Google and Email/Password.
3. **Storage Engine**: Interface for S3/Local storage.

### Phase 2: Core Dashboard (Tickets 4-6)
4. **Table Manager**: A shadcn-based data grid for Prisma/Postgres tables.
5. **SQL Editor**: Monaco editor integration for raw SQL queries.
6. **Storage UI**: File browser and bucket management.

### Phase 3: Client SDK (Ticket 7)
7. **ZeroBase SDK**: A `zerobase-js` package implementing `.from(table).select()` and `.auth` helpers.

### Phase 4: Deployment (Ticket 8)
8. **Coolify Handshake**: Dockerizing the stack for seamless Coolify deployment.

## 📂 Project Structure
```text
/apps
  /dashboard      # Next.js Dashboard & API
/packages
  /sdk            # ZeroBase Client SDK
/docker
  - docker-compose.yml
```

---

## 🎫 Implementation Tickets

### [ZB-001] Project Scaffolding & Core UI
**Goal**: Initialize the Next.js app and set up the design system.
**Status**: COMPLETED ✅
**Tasks**:
- [x] Run `npx create-next-app@latest .`
- [x] Initialize shadcn/ui and custom theme. 
- [x] Setup Prisma with PostgreSQL connection. 
- [x] Create basic Dashboard Layout with Sidebar. 

### [ZB-002] Dashboard Pages & Aesthetic Polish
**Goal**: Build the primary management interfaces.
**Status**: IN PROGRESS 🏗️
**Tasks**:
- [x] Implement Database Table Grid UI.
- [x] Implement SQL Editor with Monaco integration.
- [x] Implement Storage Bucket browser.
- [x] Implement User Auth management table.

### [ZB-003] Better Auth Integration
**Goal**: Implement robust authentication with Google support.
**Status**: IN PROGRESS 🏗️
**Tasks**:
- [x] Configure Google OAuth client (via `src/lib/auth.ts` config and `/api/auth/[...all]` handler).
- [ ] Create `/auth` login/signup pages.
- [ ] Add auth protection middleware.

### [ZB-004] Database API (PostgREST-like)
**Goal**: Dynamic API routes for table CRUD.
**Status**: COMPLETED ✅
**Tasks**:
- [x] Create dynamic API routes to fetch table metadata via Prisma (`/api/db/tables`).
- [x] Implement generic CRUD endpoints for all tables (`/rest/v1/[table]` and `/api/db/[table]`).
- [x] Add "New Row" and "Edit Row" modals in dashboard.

### [ZB-005] Storage Engine (S3/Local)
**Goal**: Manage image buckets and file uploads.
**Status**: COMPLETED ✅
**Tasks**:
- [x] Setup S3 client (AWS SDK).
- [x] Create storage API routes (`/api/storage/*`).
- [x] Link backend models with actual storage files.

### [ZB-006] ZeroBase Client SDK
**Goal**: Create the developer interface for the frontend.
**Status**: SCAFFOLDED 🏗️
**Tasks**:
- [x] Implement query builder syntax: `.from('users').select('*')`.
- [x] Add `auth.signIn()` and `storage.upload()` methods.
- [ ] Package for npm distribution.
