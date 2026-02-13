# Cron Fix + Sync Dashboard Enhancement

**Status:** Phase 1 Ready (URGENT)
**Created:** 2026-02-13

---

## Problem Summary

**CRITICAL: Crons haven't been running for days**

**Root Cause:** Duplicate vercel.json files
- `/vercel.json` (root) - only has 1 cron: `hand-raiser-check`
- `/apps/web/vercel.json` - has 7 crons but **IS BEING IGNORED**
- Vercel only reads the root vercel.json in monorepo deployments

**Impact:** Only hand-raiser-check runs; all daily syncs (GHL, Skool, Meta, aggregation, snapshots) are broken

---

## Phases

### Phase 1: Fix Cron Configuration (URGENT)
- [ ] Consolidate all 8 crons into root `/vercel.json`
- [ ] Remove crons from `/apps/web/vercel.json` (keep headers)
- [ ] Deploy and verify in Vercel dashboard

**Files to modify:**
- `/vercel.json` - Add all crons
- `/apps/web/vercel.json` - Remove crons array

**Crons to add to root vercel.json:**
```json
{ "path": "/api/cron/sync-ghl", "schedule": "0 4 * * *" }
{ "path": "/api/cron/sync-skool", "schedule": "0 5 * * *" }
{ "path": "/api/cron/sync-meta", "schedule": "0 6 * * *" }
{ "path": "/api/cron/aggregate", "schedule": "0 7 * * *" }
{ "path": "/api/cron/send-daily-snapshot", "schedule": "0 8 * * *" }
{ "path": "/api/cron/sync-skool-dms", "schedule": "*/5 * * * *" }
{ "path": "/api/cron/send-pending-dms", "schedule": "*/5 * * * *" }
{ "path": "/api/cron/hand-raiser-check", "schedule": "*/15 * * * *" }
```

---

### Phase 2: Update CRON_REGISTRY + SyncTypes
- [ ] Add new SyncTypes to `/apps/web/src/lib/sync-log.ts`
- [ ] Add 5 missing crons to registry
- [ ] Update formatSyncType helper
- [ ] Update dropdown options in sync page
- [ ] Update valid types in API routes
- [ ] Add SyncLogger to DM/hand-raiser cron routes

**New SyncTypes:**
- `skool_dms` - Inbound DM sync
- `skool_dms_outbound` - Outbound DM send
- `hand_raiser` - Comment monitoring
- `aggregate` - Daily aggregation
- `daily_snapshot` - Email snapshot

**Files to modify:**
- `/apps/web/src/lib/sync-log.ts`
- `/apps/web/src/features/settings/lib/cron-registry.ts`
- `/apps/web/src/features/settings/hooks/use-sync-log.ts`
- `/apps/web/src/app/settings/sync/page.tsx`
- `/apps/web/src/app/api/settings/sync-log/route.ts`
- `/apps/web/src/app/api/settings/sync-log/last-runs/route.ts`
- `/apps/web/src/app/api/cron/sync-skool-dms/route.ts`
- `/apps/web/src/app/api/cron/send-pending-dms/route.ts`
- `/apps/web/src/app/api/cron/hand-raiser-check/route.ts`
- `/apps/web/src/app/api/cron/aggregate/route.ts`
- `/apps/web/src/app/api/cron/send-daily-snapshot/route.ts`

---

### Phase 3: Sidebar Sync Health Indicator
- [ ] Create SyncStatusIndicator component
- [ ] Create useSyncHealth hook
- [ ] Create /api/settings/sync-health endpoint
- [ ] Add indicator to Sidebar bottom section

**Behavior:**
- Green dot: All syncs healthy (last 24h, no failures)
- Yellow dot: No syncs in 24h (stale)
- Red dot: Failures in last 24h
- Click navigates to `/settings/sync`

**Files to create:**
- `/apps/web/src/components/shell/SyncStatusIndicator.tsx`
- `/apps/web/src/features/settings/hooks/use-sync-health.ts`
- `/apps/web/src/app/api/settings/sync-health/route.ts`

**Files to modify:**
- `/apps/web/src/components/shell/Sidebar.tsx`

---

### Phase 4: Dashboard Enhancements
- [ ] Add cron parser utility for "next run" calculation
- [ ] Create visual CronGrid component (table view)
- [ ] Create DM sync stats API
- [ ] Add DMSyncStats component to dashboard

**CronGrid columns:**
- Status dot (green/yellow/red)
- Name
- Schedule (human-readable)
- Last Run (relative time)
- Next Run (calculated)
- Run Now button

**DM Stats cards:**
- Inbound messages (24h)
- Outbound messages (24h)
- Contact mappings total
- Pending queue size

**Files to create:**
- `/apps/web/src/features/settings/lib/cron-parser.ts`
- `/apps/web/src/app/api/settings/dm-sync-stats/route.ts`

**Files to modify:**
- `/apps/web/src/app/settings/sync/page.tsx`

---

## Verification

### Phase 1
1. Deploy to Vercel
2. Check Vercel Dashboard > Project Settings > Crons
3. Confirm all 8 crons are listed
4. Wait for next scheduled run and check Vercel logs

### Phase 2-4
1. Visit `/settings/sync`
2. Confirm all crons appear in Schedules tab
3. Click "Run Now" on a few crons
4. Verify sync_activity_log captures the runs
5. Check sidebar shows sync health indicator
6. Verify DM stats section shows correct counts

---

## Commit Strategy

| Phase | Commit Message | Deploy |
|-------|----------------|--------|
| 1 | `Fix: consolidate crons into root vercel.json` | Immediate |
| 2 | `Phase 2: Update CRON_REGISTRY and add SyncLogger` | With 3-4 |
| 3 | `Phase 3: Add sidebar sync health indicator` | With 2,4 |
| 4 | `Phase 4: Dashboard cron grid and DM stats` | With 2-3 |
