# 0ne App - Build State

> **For Claude Code:** Read this file FIRST when working on 0ne-app.
> This is the nimble hub - it points you to the right place.

---

## Quick Resume

**Last Updated:** 2026-02-13
**Current Focus:** Hand-Raiser Campaign UI

---

## Active Features

| Feature | Status | BUILD-STATE Location |
|---------|--------|---------------------|
| Hand-Raiser UI | 🔄 Ready | `sections/hand-raiser-ui/BUILD-STATE.md` |
| Cron Fix + Sync Dashboard | ✅ Complete | `sections/sync-dashboard/BUILD-STATE.md` |
| Skool-GHL DM Sync | ✅ Complete | `sections/skool-sync/BUILD-STATE.md` |
| Skool Scheduler | ✅ Complete | `sections/skool-scheduler/BUILD-STATE.md` |
| GHL Media Manager | ✅ Complete | `sections/media/BUILD-STATE.md` |

### How to Navigate

**Starting a feature:** Read the feature's BUILD-STATE in `sections/{feature}/BUILD-STATE.md`

**Checking history:** Read `COMPLETED-FEATURES.md` for archived implementation details

---

## Next Actions

### Hand-Raiser Campaign UI
**Build UI to manage Hand-Raiser campaigns (auto-DM Skool commenters)**

**To deploy:** Read `sections/hand-raiser-ui/BUILD-STATE.md` and deploy 4 phases using multi-agent workflow:
1. Spawn Phases 1-3 in parallel (API, Hook, Dialog)
2. Then Phase 4 (Page + Navigation)

---

## Blockers / Decisions Needed

None currently.

---

## Quick Commands

```bash
# Start dev server
cd apps/web && bun dev

# Run GHL sync
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/sync-ghl"

# Run Skool member sync
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/sync-skool"

# Run Meta ads sync
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/sync-meta"
```

---

## Completed Features

See `COMPLETED-FEATURES.md` for full archive. Summary:

- ✅ KPI Dashboard (Overview, Funnel, Cohorts, Expenses, Skool, GHL, Facebook Ads)
- ✅ Skool Post Scheduler (Variation Groups, Campaigns, One-Off Posts)
- ✅ Skool Post Drafts & External API
- ✅ GHL Media Manager
- ✅ Sync Dashboard
- ✅ Daily Notifications
- ✅ Source Filtering System
- ✅ Expenses System Upgrade
- ✅ Skool Revenue & MRR Integration
- ✅ Skool-GHL DM Sync (bidirectional DM sync with GHL unified inbox)
