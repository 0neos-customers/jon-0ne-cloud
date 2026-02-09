# 0ne App

A unified personal command center that consolidates business operations into one authenticated platform.

## Overview

0ne is the **application layer** of the 0ne system - a personal augmentation platform that eliminates tool sprawl and context-switching by bringing all operational tools under one roof.

**Problem:** Business operations scattered across GoHighLevel, Skool, Meta Ads, and spreadsheets. Each tool has its own login, UI, and mental overhead.

**Solution:** Single authenticated platform with unified metrics, prospecting tools, and CRM sync.

## Apps

| App | Description | Status |
|-----|-------------|--------|
| **KPI Dashboard** | Real-time business metrics, funnel tracking, cohort analysis | ✅ Live |
| **Skool Sync** | Sync Skool community data with GoHighLevel CRM | ✅ Live |
| **Prospector** | Facebook group lead engagement tool | 🚧 Planned |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Runtime | Bun |
| UI | React 19 + Tailwind CSS v4 |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Monorepo | Turborepo |
| Hosting | Vercel |

## Project Structure

```
0ne-app/
├── apps/
│   └── web/                 # Next.js application
│       └── src/
│           ├── app/         # App Router pages & API routes
│           ├── components/  # Shared components (shell, layout)
│           ├── features/    # Feature modules (kpi, skool, settings)
│           └── lib/         # Utilities
├── packages/
│   ├── ui/                  # Shared UI components (shadcn/ui based)
│   ├── db/                  # Supabase client + schemas
│   └── auth/                # Clerk auth utilities
├── product/                 # DesignOS specs & build tracking
│   ├── BUILD-STATE.md       # Session continuity tracker
│   └── sections/            # Per-feature specifications
└── scripts/                 # Data sync & migration scripts
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1+
- Supabase account
- Clerk account
- GoHighLevel API access (for KPI features)

### Installation

```bash
# Clone the repo
git clone https://github.com/becomingjimmy/0ne-app.git
cd 0ne-app

# Install dependencies
bun install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your credentials
```

### Environment Variables

Create `apps/web/.env.local` with:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Cron Security
CRON_SECRET=xxx

# GoHighLevel (KPI Dashboard)
GHL_API_KEY=xxx
GHL_LOCATION_ID=xxx

# Meta Ads (KPI Dashboard)
META_ACCESS_TOKEN=xxx
META_AD_ACCOUNT_ID=act_xxx
```

### Development

```bash
# Start the dev server
bun dev

# Or run from the web app directly
cd apps/web && bun dev
```

The app runs at `http://localhost:3000`.

### Database Setup

Database schemas are in `packages/db/schemas/`. Apply them to your Supabase instance:

```bash
# Run migrations (manually via Supabase dashboard or CLI)
bunx supabase db push
```

## Key Features

### KPI Dashboard

- **Funnel Metrics**: Track leads → hand-raisers → clients → funded
- **Cohort Analysis**: EPL (Earnings Per Lead) at Day 1, 7, 14, 35, 65, 95, 185, 370
- **Unit Economics**: LTV, ARPU, MRR trends, payback period
- **Source Filtering**: Filter all metrics by attribution source
- **Revenue Tracking**: One-time (GHL) + Recurring (Skool subscriptions)

### Data Sync

Cron jobs sync data from external sources:

| Endpoint | Source | Frequency |
|----------|--------|-----------|
| `/api/cron/sync-ghl` | GoHighLevel contacts | Daily |
| `/api/cron/sync-ghl-payments` | GHL invoices | Daily |
| `/api/cron/sync-skool` | Skool members | Daily |
| `/api/cron/sync-meta` | Meta Ads spend | Daily |

## Design System

| Token | Value |
|-------|-------|
| Primary | `#FF692D` (Monarch orange) |
| Background | `#F6F5F3` (warm cream) |
| Text | `#22201D` (near-black) |
| Sidebar | `#1C1B19` (dark charcoal) |
| Border Radius | `6px` |

## Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun lint         # Run ESLint
bun type-check   # TypeScript type checking
bun clean        # Clean build artifacts
```

## Contributing

This is a personal project. For Claude Code sessions:

1. Read `product/BUILD-STATE.md` first
2. Continue from "Next Session Focus"
3. Update BUILD-STATE.md at session end

## License

Private - All rights reserved.
