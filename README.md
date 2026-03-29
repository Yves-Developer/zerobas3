# ZeroBase 🚀

A lightweight, self-hosted Supabase alternative built with Next.js 15, Prisma, and Better Auth.

## Features
- **Database Explorer**: View and edit tables with a familiar data grid.
- **SQL Editor**: Execute raw SQL queries directly from the browser with Monaco Editor.
- **Image Storage**: Manage buckets and files with an intuitive explorer.
- **Authentication**: Seamless Google Auth integration via [Better Auth](https://github.com/better-auth/better-auth).
- **Client SDK**: A familiar `.from('table').select('*')` syntax for your frontend.
- **Coolify Ready**: Designed for effortless deployment on any VPS with Coolify.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma
- **Auth**: Better Auth
- **UI**: shadcn/ui + TailwindCSS 4
- **Editor**: Monaco Editor

## 🚀 Getting Started

1. **Clone and Install**:
```bash
npm install
```

2. **Environment Variables**:
Copy `.env.example` to `.env` and fill in your PostgreSQL URL and Auth secrets.
```bash
cp .env.example .env
```

3. **Prisma Setup**:
Generate the client and push the schema to your DB.
```bash
npx prisma generate
npx prisma db push
```

4. **Run Development Server**:
```bash
npm run dev
```

## 📦 Using the SDK

```typescript
import { createClient } from './lib/zerobase-client';

const zerobase = createClient('http://localhost:3000', 'your-api-key');

// Fetch data
const { data, error } = await zerobase.from('User').select('*');

// Auth
await zerobase.auth.signInWithGoogle();

// Storage
await zerobase.storage.from('avatars').upload('my-face.png', file);
```

## 🚢 Deployment (Coolify)
ZeroBase is designed to be deployed as a single Docker container. Simply point Coolify to this repository, and it will auto-detect the Next.js setup.

---
Built with ❤️ by Antigravity
